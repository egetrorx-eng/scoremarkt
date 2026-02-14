import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useClobWebSocket } from '../../lib/hooks/useClobWebSocket';
import { usePortfolioStore } from '../../lib/hooks/usePortfolioStore';
import type { MarketCardData } from '../../lib/polymarket/types';

import { usePrivy } from '@privy-io/react-auth';
import { tradeAlerts } from '../../lib/services/tradeAlerts';

interface OrderExecutorProps {
    markets: MarketCardData[];
}

export default function OrderExecutor({ markets }: OrderExecutorProps) {
    const { user } = usePrivy();
    const { limitOrders, fulfillLimitOrder } = usePortfolioStore();
    const assetIds = markets.map(m => m.clobTokenIds?.[0]).filter((id): id is string => !!id);
    const { ticker } = useClobWebSocket(assetIds);
    const processedOrders = useRef<Set<string>>(new Set());

    useEffect(() => {
        const pendingOrders = limitOrders.filter(o => o.status === 'PENDING');

        if (pendingOrders.length === 0) return;

        Object.entries(ticker).forEach(([asset_id, data]) => {
            const currentPrice = parseFloat(data.price);

            pendingOrders.forEach(order => {
                if (order.marketId.includes(asset_id) || order.marketId === asset_id) {
                    let shouldExecute = false;

                    // BUY LIMIT: Price drops to or below limit
                    if (order.side === 'BUY' && currentPrice <= order.limitPrice) {
                        shouldExecute = true;
                    }
                    // SELL LIMIT: Price rises to or above limit
                    else if (order.side === 'SELL' && currentPrice >= order.limitPrice) {
                        shouldExecute = true;
                    }

                    if (shouldExecute && !processedOrders.current.has(order.id)) {
                        processedOrders.current.add(order.id);
                        fulfillLimitOrder(order.id, currentPrice);

                        // Trigger Email Alert
                        if (user?.email?.address) {
                            const storageKey = `scoremarkt_notif_prefs_${user.id.replace(/:/g, '_')}`;
                            const storedPrefs = localStorage.getItem(storageKey);
                            const prefs = storedPrefs ? JSON.parse(storedPrefs) : { limitOrderFulfillment: true };

                            if (prefs.limitOrderFulfillment) {
                                tradeAlerts.notifyOrderFilled(
                                    {
                                        name: user.google?.name || user.wallet?.address || 'Trader',
                                        email: user.email.address
                                    },
                                    {
                                        orderId: order.id,
                                        market: order.marketQuestion,
                                        side: order.side,
                                        shares: order.shares,
                                        price: currentPrice
                                    }
                                );
                            }
                        }

                        toast.success(`Limit Order Filled!`, {
                            description: `${order.side} ${order.outcome} at ${order.limitPrice.toFixed(2)}`,
                            duration: 5000,
                        });
                    }
                }
            });
        });
    }, [ticker, limitOrders, fulfillLimitOrder, user]);

    return null; // Side-effect only component
}
