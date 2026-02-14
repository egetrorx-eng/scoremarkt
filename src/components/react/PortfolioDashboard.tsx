/**
 * PortfolioDashboard Component
 * ═══════════════════════════════════════════════════════════════
 * Main manager for the portfolio page. Handles auth state,
 * data fetching, and layouts.
 */

import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import PortfolioSummary from './PortfolioSummary';
import PositionsTable from './PositionsTable';
import PerformanceChart from './PerformanceChart';
import Leaderboard from './Leaderboard';
import NotificationSettings from './NotificationSettings';
import {
    getUserPortfolioSummary,
    getUserPositions,
    getUserTradeHistory,
    getUserClosedPositions
} from '@/lib/polymarket/gamma';
import { usePortfolioStore } from '@/lib/hooks/usePortfolioStore';
import { useAchievements } from '@/lib/hooks/useAchievements';

export default function PortfolioDashboard() {
    const { authenticated, user, login, ready } = usePrivy();
    const {
        positions: simPositions,
        trades: simTrades,
        balance: simBalance,
        history: simHistory,
        limitOrders: simLimitOrders,
        cancelOrder,
        ready: storeReady
    } = usePortfolioStore();
    const { achievements, unlockAchievement } = useAchievements();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'history' | 'pending' | 'settings'>('active');

    const isPrivyEnabled = !!import.meta.env.PUBLIC_PRIVY_APP_ID &&
        import.meta.env.PUBLIC_PRIVY_APP_ID !== 'your-privy-app-id';

    const address = user?.wallet?.address;

    // Resolve loading state even if Privy doesn't initialize
    useEffect(() => {
        if (!isPrivyEnabled) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPrivyEnabled]);

    useEffect(() => {
        async function loadData() {
            if (authenticated && address) {
                setLoading(true);
                try {
                    const [summary, positions, trades, closed] = await Promise.all([
                        getUserPortfolioSummary(address),
                        getUserPositions(address),
                        getUserTradeHistory(address),
                        getUserClosedPositions(address)
                    ]);

                    // Merge and augment simulated data
                    const augmentedSimPositions = simPositions.map(p => ({
                        ...p,
                        market: p.marketQuestion,
                        isSimulated: true,
                        currentPrice: p.avgPrice, // Mocking current price as avg price for now
                        value: p.shares * p.avgPrice,
                        pnl: 0,
                        pnlPercent: 0
                    }));

                    const augmentedSimTrades = simTrades.map(t => ({
                        ...t,
                        market: t.marketQuestion,
                        time: new Date(t.timestamp).toLocaleTimeString(),
                        isSimulated: true
                    }));

                    const simInvestedValue = simPositions.reduce((acc, p) => acc + (p.shares * p.avgPrice), 0);

                    // Simple Stats Calculation
                    const simPnL = (simBalance + simInvestedValue) - 5000;
                    const roi = (simPnL / 5000) * 100;
                    const winRate = simTrades.length > 0 ? 68.5 : 0; // Mocking win rate for now as we don't track outcome status yet

                    setData({
                        summary: {
                            ...summary,
                            totalValue: summary.totalValue + simBalance + simInvestedValue,
                            availableBalance: summary.availableBalance + simBalance,
                            investedValue: summary.investedValue + simInvestedValue,
                            winRate,
                            roi
                        },
                        positions: [...augmentedSimPositions, ...positions],
                        trades: [...augmentedSimTrades, ...trades],
                        closed
                    });
                } catch (error) {
                    console.error('Error loading portfolio data:', error);
                } finally {
                    setLoading(false);
                }
            } else if (ready) {
                setLoading(false);
            }
        }
        if (storeReady) {
            loadData();
        }

        // Achievement Check: Pioneer
        if (simTrades.length > 0) {
            unlockAchievement('first_trade');
        }
        // Achievement Check: Whale
        const totalVolume = simTrades.reduce((acc, t) => acc + (t.shares * t.price), 0);
        if (totalVolume > 10000) {
            unlockAchievement('high_volume');
        }
        // Achievement Check: Legend
        if (simBalance > 50000) {
            unlockAchievement('balance_master');
        }
    }, [authenticated, address, ready, storeReady, simPositions, simTrades, simBalance, simHistory, unlockAchievement]);

    if ((isPrivyEnabled && !ready) || loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin mb-4" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Initializing Terminal...</p>
            </div>
        );
    }

    if (isPrivyEnabled && !authenticated) {
        return (
            <div className="card p-12 text-center border-white/5 bg-midnight-800/40 backdrop-blur-md">
                <div className="w-20 h-20 bg-lime-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-lime-500/20">
                    <svg className="w-10 h-10 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-display font-black text-white mb-4 uppercase tracking-tight">Terminal Access Restricted</h2>
                <p className="text-white/40 max-w-sm mx-auto mb-10 font-medium">Please connect your terminal identity to view your portfolio and trading history.</p>
                <button
                    onClick={login}
                    className="px-10 py-5 rounded-2xl bg-lime-500 text-midnight-900 font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:shadow-glow hover:scale-105 active:scale-95"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Performance History */}
            {simHistory && simHistory.length > 0 && (
                <PerformanceChart data={simHistory} />
            )}

            {/* Portfolio Summary */}
            {data?.summary && <PortfolioSummary data={data.summary} />}

            {/* Main Portfolio Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
                        {[
                            { id: 'active', label: 'Active Positions' },
                            { id: 'closed', label: 'Recently Closed' },
                            { id: 'history', label: 'Trade History' },
                            { id: 'pending', label: 'Pending Orders' },
                            { id: 'settings', label: 'Terminal Settings' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] relative transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-lime-500 text-midnight-900 shadow-glow'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'pending' && simLimitOrders.filter(o => o.status === 'PENDING').length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold shadow-glow"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content based on active tab */}
                    <div className="animate-in fade-in duration-500">
                        {activeTab === 'active' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">Open Positions</h2>
                                    <span className="text-[10px] font-bold py-1 px-2.5 rounded bg-white/5 text-white/30 border border-white/10">
                                        {data?.positions?.length || 0} TOTAL
                                    </span>
                                </div>
                                <PositionsTable positions={data?.positions || []} />
                            </div>
                        )}

                        {activeTab === 'closed' && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90 px-2">Settled Contracts</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {data?.closed?.map((pos: any) => (
                                        <div key={pos.id} className={`card p-6 border transition-all duration-300 ${pos.won ? 'border-profit/20 bg-profit/5' : 'border-coral/20 bg-coral/5'}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="text-sm font-black text-white/90 mb-2 leading-snug">{pos.market}</p>
                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                                        {pos.outcome} • {pos.shares} SHARES • {pos.closedAt}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-black font-mono ${pos.won ? 'text-profit' : 'text-coral'}`}>
                                                        {pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDC
                                                    </p>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${pos.won ? 'bg-profit/20 text-profit' : 'bg-coral/20 text-coral'}`}>
                                                        {pos.won ? 'WON' : 'LOSS'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90 px-2">Activity Log</h2>
                                <div className="card overflow-hidden p-0 border-white/5 bg-midnight-800/40">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Market</th>
                                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Side</th>
                                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Outcome</th>
                                                    <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Shares</th>
                                                    <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Price</th>
                                                    <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {data?.trades?.map((trade: any) => (
                                                    <tr key={trade.id} className="group hover:bg-white/[0.03] transition-colors">
                                                        <td className="py-4 px-6 text-xs font-bold text-white/80 group-hover:text-white">{trade.market}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${trade.side === 'BUY' ? 'text-profit' : 'text-coral'}`}>
                                                                {trade.side}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">{trade.outcome}</td>
                                                        <td className="py-4 px-6 text-xs text-right font-mono text-white/60">{trade.shares}</td>
                                                        <td className="py-4 px-6 text-xs text-right font-mono text-white">{(trade.price * 100).toFixed(0)}¢</td>
                                                        <td className="py-4 px-6 text-[10px] text-right text-white/20 font-bold uppercase">{trade.time}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pending' && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">Simulated Limit Orders</h2>
                                    <span className="text-[10px] font-bold py-1 px-2.5 rounded bg-gold/10 text-gold border border-gold/20 shadow-glow/10 uppercase tracking-widest">
                                        Execution Pending
                                    </span>
                                </div>

                                {simLimitOrders.filter(o => o.status === 'PENDING').length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                        <p className="text-xs font-bold text-white/20 uppercase tracking-widest leading-relaxed"> No pending limit orders detected in terminal.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {simLimitOrders.filter(o => o.status === 'PENDING').map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-midnight-800/60 border border-white/5 hover:border-gold/30 transition-all duration-300 group relative overflow-hidden">
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white capitalize line-clamp-1">{order.marketQuestion}</h4>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${order.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-coral/10 text-coral'}`}>
                                                                {order.side} {order.outcome}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Limit: {(order.limitPrice * 100).toFixed(0)}¢</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 relative z-10">
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-white font-mono">{order.shares.toFixed(0)} Shares</div>
                                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Value: ${(order.shares * order.limitPrice).toFixed(2)}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => cancelOrder(order.id)}
                                                        className="p-3 rounded-xl bg-coral/10 text-coral border border-coral/20 hover:bg-coral hover:text-white transition-all duration-300 group/cancel"
                                                        title="Cancel Order"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {/* Subtle gold glow for pending status */}
                                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div className="animate-in fade-in duration-500">
                                <NotificationSettings />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Achievements Section */}
                    <div className="card p-6 border border-white/10 bg-midnight-800/40 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Platform Badges</h3>
                            <span className="text-[10px] font-bold py-1 px-2 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">Unlocked</span>
                        </div>

                        <div className="space-y-4">
                            {achievements.map((badge) => (
                                <div key={badge.id} className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 ${badge.unlockedAt ? 'bg-lime-500/5 border-lime-500/20' : 'bg-white/5 border-white/5 opacity-40'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${badge.unlockedAt ? 'bg-lime-500/10 shadow-glow/10 font-black' : 'bg-white/5'}`}>
                                        {badge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-xs font-black uppercase tracking-wider ${badge.unlockedAt ? 'text-white' : 'text-white/40'}`}>{badge.title}</h4>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{badge.description}</p>
                                    </div>
                                    {badge.unlockedAt && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Leaderboard />
                </div>
            </div>
        </div>
    );
}
