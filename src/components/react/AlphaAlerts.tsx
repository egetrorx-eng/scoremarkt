import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useClobWebSocket } from '@/lib/hooks/useClobWebSocket';
import type { MarketCardData } from '@/lib/polymarket/types';

interface AlphaAlertsProps {
    markets: MarketCardData[];
}

export default function AlphaAlerts({ markets }: AlphaAlertsProps) {
    // Extract all asset IDs (using first outcome as the primary ticker for the alert)
    const assetIds = markets
        .map(m => m.clobTokenIds?.[0])
        .filter((id): id is string => !!id);

    const { ticker } = useClobWebSocket(assetIds);
    const lastPrices = useRef<Record<string, number>>({});

    useEffect(() => {
        Object.entries(ticker).forEach(([asset_id, data]) => {
            const currentPrice = parseFloat(data.price);
            const previousPrice = lastPrices.current[asset_id];
            const market = markets.find(m => m.clobTokenIds?.includes(asset_id));

            if (previousPrice !== undefined && market) {
                const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

                // Alert threshold: 2% movement in a single ticker update (high volatility)
                if (Math.abs(changePercent) >= 2) {
                    toast.custom((t) => (
                        <div className={`flex flex-col gap-1 p-4 rounded-xl border backdrop-blur-xl bg-midnight-900/80 shadow-glow-sm ${changePercent > 0 ? 'border-lime-500/50' : 'border-red-500/50'
                            }`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-ping ${changePercent > 0 ? 'bg-lime-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                    Alpha Intelligence
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-white leading-tight">
                                {market.question}
                            </h4>
                            <p className="text-xs font-medium text-white/40">
                                Significant {changePercent > 0 ? 'upward' : 'downward'} move detected:
                                <span className={`ml-1 font-mono ${changePercent > 0 ? 'text-lime-400' : 'text-red-400'}`}>
                                    {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                                </span>
                            </p>
                            <button
                                onClick={() => {
                                    toast.dismiss(t);
                                    window.location.href = `/market/${market.id}`;
                                }}
                                className="mt-2 text-[10px] font-black uppercase tracking-widest text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-2"
                            >
                                Trade Decision
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </button>
                        </div>
                    ), {
                        duration: 8000,
                        position: 'bottom-right',
                    });
                }
            }

            // Update last price
            lastPrices.current[asset_id] = currentPrice;
        });
    }, [ticker, markets]);

    return null; // Side-effect only component
}
