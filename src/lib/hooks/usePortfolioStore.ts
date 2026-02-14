/**
 * usePortfolioStore Hook
 * ═══════════════════════════════════════════════════════════════
 * A simple hook to manage simulated trading data in localStorage.
 * Enables a functional experience without real-world blockchain txs.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export interface SimulatedPosition {
    id: string;
    marketId: string;
    marketQuestion: string;
    outcome: string;
    shares: number;
    avgPrice: number;
    timestamp: number;
    endDate?: string;
    outcomeIndex: number;
}

export interface SimulatedTrade {
    id: string;
    marketId: string;
    marketQuestion: string;
    side: 'BUY' | 'SELL';
    outcome: string;
    shares: number;
    price: number;
    timestamp: number;
    endDate?: string;
    outcomeIndex?: number;
}

export interface SimulatedLimitOrder {
    id: string;
    marketId: string;
    marketQuestion: string;
    side: 'BUY' | 'SELL';
    outcome: string;
    shares: number;
    limitPrice: number;
    status: 'PENDING' | 'FILLED' | 'CANCELLED';
    timestamp: number;
}

const RAW_STORAGE_KEYS = {
    POSITIONS: 'scoremarkt_sim_positions',
    TRADES: 'scoremarkt_sim_trades',
    BALANCE: 'scoremarkt_sim_balance',
    HISTORY: 'scoremarkt_sim_history',
    LIMIT_ORDERS: 'scoremarkt_sim_limit_orders',
};

const INITIAL_BALANCE = 5000; // $5,000 virtual USDC
const HISTORY_LIMIT = 30; // 30 days of history

export interface HistoryPoint {
    timestamp: number;
    value: number;
}

export function usePortfolioStore() {
    const { user, authenticated, ready: privyReady } = usePrivy();

    // Dynamic storage keys based on user ID
    const STORAGE_KEYS = useMemo(() => {
        const suffix = user?.id ? `_${user.id.replace(/:/g, '_')}` : '';
        return {
            POSITIONS: `${RAW_STORAGE_KEYS.POSITIONS}${suffix}`,
            TRADES: `${RAW_STORAGE_KEYS.TRADES}${suffix}`,
            BALANCE: `${RAW_STORAGE_KEYS.BALANCE}${suffix}`,
            HISTORY: `${RAW_STORAGE_KEYS.HISTORY}${suffix}`,
            LIMIT_ORDERS: `${RAW_STORAGE_KEYS.LIMIT_ORDERS}${suffix}`,
        };
    }, [user?.id]);

    const [positions, setPositions] = useState<SimulatedPosition[]>([]);
    const [trades, setTrades] = useState<SimulatedTrade[]>([]);
    const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [limitOrders, setLimitOrders] = useState<SimulatedLimitOrder[]>([]);
    const [storeReady, setStoreReady] = useState(false);
    const [needsSettlementCheck, setNeedsSettlementCheck] = useState(true);

    // Initial Load
    useEffect(() => {
        if (!privyReady) return;

        // Reset state when switching users or logging out
        if (!authenticated) {
            setPositions([]);
            setTrades([]);
            setBalance(INITIAL_BALANCE);
            setHistory([]);
            setLimitOrders([]);
            setStoreReady(true);
            return;
        }

        const storedPositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);
        const storedTrades = localStorage.getItem(STORAGE_KEYS.TRADES);
        const storedBalance = localStorage.getItem(STORAGE_KEYS.BALANCE);
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const storedLimitOrders = localStorage.getItem(STORAGE_KEYS.LIMIT_ORDERS);

        if (storedPositions) setPositions(JSON.parse(storedPositions));
        else setPositions([]);

        if (storedTrades) setTrades(JSON.parse(storedTrades));
        else setTrades([]);

        if (storedBalance) setBalance(parseFloat(storedBalance));
        else setBalance(INITIAL_BALANCE);

        if (storedLimitOrders) setLimitOrders(JSON.parse(storedLimitOrders));
        else setLimitOrders([]);

        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        } else {
            // Generate some mock history for first time users
            const now = Date.now();
            const day = 24 * 60 * 60 * 1000;
            const mockHistory = Array.from({ length: 15 }, (_, i) => ({
                timestamp: now - (15 - i) * day,
                value: INITIAL_BALANCE - 200 + Math.random() * 400
            }));
            setHistory(mockHistory);
        }

        setStoreReady(true);
    }, [STORAGE_KEYS, authenticated, privyReady]);

    // Sync to LocalStorage
    useEffect(() => {
        if (!storeReady || !authenticated) return;

        localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
        localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
        localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        localStorage.setItem(STORAGE_KEYS.LIMIT_ORDERS, JSON.stringify(limitOrders));
    }, [positions, trades, balance, history, limitOrders, storeReady, STORAGE_KEYS, authenticated]);

    // Settlement Engine
    const checkSettlements = useCallback(() => {
        if (!storeReady || !authenticated || !needsSettlementCheck) return;

        const now = new Date();
        const settledIndices: number[] = [];
        let balanceAdjustment = 0;
        const newTrades: SimulatedTrade[] = [];

        const updatedPositions = positions.filter((pos, index) => {
            if (pos.endDate && new Date(pos.endDate) < now) {
                // Market has ended - Resolve simulation
                // Logic: Deterministic "win" based on marketId to keep it consistent
                const winSeed = pos.marketId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                const won = (winSeed + pos.outcomeIndex) % 2 === 0;

                if (won) {
                    balanceAdjustment += pos.shares; // $1 per share
                }

                newTrades.push({
                    id: `s-${Date.now()}-${index}`,
                    marketId: pos.marketId,
                    marketQuestion: pos.marketQuestion,
                    side: won ? 'BUY' : 'SELL', // Using side to indicate inflow/outflow for history color
                    outcome: pos.outcome,
                    shares: pos.shares,
                    price: won ? 1 : 0,
                    timestamp: Date.now()
                });

                settledIndices.push(index);
                return false; // Remove from positions
            }
            return true;
        });

        if (settledIndices.length > 0) {
            setBalance(prev => prev + balanceAdjustment);
            setPositions(updatedPositions);
            setTrades(prev => [...newTrades, ...prev]);
            setNeedsSettlementCheck(false);
            console.log(`[ScoreMarkt] Settled ${settledIndices.length} positions. Balance adjustment: +$${balanceAdjustment}`);
        }
    }, [positions, storeReady, authenticated, needsSettlementCheck]);

    useEffect(() => {
        if (storeReady && authenticated && needsSettlementCheck) {
            checkSettlements();
        }
    }, [storeReady, authenticated, needsSettlementCheck, checkSettlements]);

    // Record Period Snapshot (e.g. daily)
    const recordSnapshot = useCallback(() => {
        const totalInvested = positions.reduce((acc, p) => acc + (p.shares * p.avgPrice), 0);
        const totalValue = balance + totalInvested;
        const now = Date.now();

        setHistory(prev => {
            const newHistory = [...prev, { timestamp: now, value: totalValue }];
            return newHistory.slice(-HISTORY_LIMIT);
        });
    }, [balance, positions]);

    const executeTrade = useCallback((trade: Omit<SimulatedTrade, 'id' | 'timestamp'>) => {
        const timestamp = Date.now();
        const tradeId = `t-${timestamp}`;
        const totalCost = trade.shares * trade.price;

        if (trade.side === 'BUY') {
            if (balance < totalCost) {
                throw new Error('Insufficient virtual balance');
            }

            // Update Balance
            setBalance(prev => prev - totalCost);

            // Update Positions
            setPositions(prev => {
                const existingIndex = prev.findIndex(p => p.marketId === trade.marketId && p.outcome === trade.outcome);
                if (existingIndex > -1) {
                    const existing = prev[existingIndex];
                    const newShares = existing.shares + trade.shares;
                    const newAvgPrice = ((existing.shares * existing.avgPrice) + totalCost) / newShares;

                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...existing,
                        shares: newShares,
                        avgPrice: newAvgPrice
                    };
                    return updated;
                } else {
                    return [...prev, {
                        id: `p-${timestamp}`,
                        marketId: trade.marketId,
                        marketQuestion: trade.marketQuestion,
                        outcome: trade.outcome,
                        shares: trade.shares,
                        avgPrice: trade.price,
                        timestamp,
                        endDate: (trade as any).endDate,
                        outcomeIndex: (trade as any).outcomeIndex || 0
                    }];
                }
            });
        } else {
            // SELL Logic
            setPositions(prev => {
                const existingIndex = prev.findIndex(p => p.marketId === trade.marketId && p.outcome === trade.outcome);
                if (existingIndex === -1 || prev[existingIndex].shares < trade.shares) {
                    throw new Error('Insufficient shares to sell');
                }

                const existing = prev[existingIndex];
                const newShares = existing.shares - trade.shares;

                // Update Balance
                setBalance(prevBal => prevBal + totalCost);

                if (newShares <= 0) {
                    return prev.filter((_, i) => i !== existingIndex);
                } else {
                    const updated = [...prev];
                    updated[existingIndex] = { ...existing, shares: newShares };
                    return updated;
                }
            });
        }

        // Record Trade
        setTrades(prev => [{ ...trade, id: tradeId, timestamp }, ...prev]);

        // Auto-refresh snapshot on trade
        setTimeout(recordSnapshot, 100);
    }, [balance, positions, recordSnapshot]);

    const addLimitOrder = useCallback((order: Omit<SimulatedLimitOrder, 'id' | 'timestamp' | 'status'>) => {
        const timestamp = Date.now();
        const id = `lo-${timestamp}`;
        const newOrder: SimulatedLimitOrder = {
            ...order,
            id,
            timestamp,
            status: 'PENDING'
        };

        setLimitOrders(prev => [newOrder, ...prev]);
    }, []);

    const cancelOrder = useCallback((id: string) => {
        setLimitOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
    }, []);

    const fulfillLimitOrder = useCallback((id: string, executionPrice: number) => {
        setLimitOrders(prev => {
            const orderIndex = prev.findIndex(o => o.id === id && o.status === 'PENDING');
            if (orderIndex === -1) return prev;

            const order = prev[orderIndex];

            // Execute the trade
            try {
                executeTrade({
                    marketId: order.marketId,
                    marketQuestion: order.marketQuestion,
                    side: order.side,
                    outcome: order.outcome,
                    shares: order.shares,
                    price: executionPrice,
                });

                const updated = [...prev];
                updated[orderIndex] = { ...order, status: 'FILLED' };
                return updated;
            } catch (err) {
                console.error('Failed to fulfill limit order:', err);
                return prev;
            }
        });
    }, [executeTrade]);

    const resetStore = () => {
        setPositions([]);
        setTrades([]);
        setBalance(INITIAL_BALANCE);
        setHistory([]);
    };

    return {
        positions,
        trades,
        balance,
        history,
        limitOrders,
        executeTrade,
        addLimitOrder,
        cancelOrder,
        fulfillLimitOrder,
        resetStore,
        ready: storeReady
    };
}
