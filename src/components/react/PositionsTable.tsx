/**
 * PositionsTable Component
 * ═══════════════════════════════════════════════════════════════
 * Displays user's active positions with P&L and actions.
 */

import React, { useState } from 'react';

interface Position {
    id: string;
    market: string;
    marketId: string;
    outcome: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    pnl: number;
    pnlPercent: number;
}

interface PositionsTableProps {
    positions: Position[];
}

export default function PositionsTable({ positions }: PositionsTableProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    if (positions.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="w-16 h-16 rounded-full bg-midnight-700 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">No Active Positions</h3>
                <p className="text-sm text-white/40 mb-6">Start trading to see your positions here</p>
                <a href="/markets" className="btn-primary btn-sm inline-flex">
                    Browse Markets
                </a>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden p-0 border border-white/10 bg-midnight-800/40 backdrop-blur-md shadow-elevated">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="text-left py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Market</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Outcome</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Shares</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Avg Price</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Current</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Value</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">P&L</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-white/40 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {positions.map((pos) => (
                            <tr key={pos.id} className="group hover:bg-white/5 transition-colors duration-200">
                                <td className="py-5 px-6">
                                    <a href={`/market/${pos.marketId}`} className="text-sm font-medium text-white/90 hover:text-lime-400 transition-colors line-clamp-2 leading-relaxed">
                                        {pos.market}
                                    </a>
                                </td>
                                <td className="py-5 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lime-500/10 text-lime-400 border border-lime-500/20 shadow-[0_0_10px_rgba(191,255,0,0.1)]">
                                        {pos.outcome}
                                    </span>
                                </td>
                                <td className="py-5 px-6 text-right font-mono text-sm text-white/80">{pos.shares.toLocaleString()}</td>
                                <td className="py-5 px-6 text-right font-mono text-sm text-white/60">{(pos.avgPrice * 100).toFixed(0)}¢</td>
                                <td className="py-5 px-6 text-right font-mono text-sm text-white/90">{(pos.currentPrice * 100).toFixed(0)}¢</td>
                                <td className="py-5 px-6 text-right font-mono text-sm font-bold text-white">${pos.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="py-5 px-6 text-right">
                                    <div className={`inline-flex flex-col items-end font-mono ${pos.pnl >= 0 ? 'text-profit' : 'text-coral'}`}>
                                        <span className="text-sm font-bold">
                                            {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] opacity-70">
                                            {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-5 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-profit/10 text-profit border border-profit/20 hover:bg-profit/20 transition-all">
                                            Add
                                        </button>
                                        <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-coral/10 text-coral border border-coral/20 hover:bg-coral/20 transition-all">
                                            Sell
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/5">
                {positions.map((pos) => (
                    <div key={pos.id} className="p-5 active:bg-white/5 transition-colors">
                        <button
                            onClick={() => setExpandedRow(expandedRow === pos.id ? null : pos.id)}
                            className="w-full text-left"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white/90 leading-snug mb-1 line-clamp-2">{pos.market}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-500/10 text-lime-400 border border-lime-500/20 uppercase tracking-wider">
                                            {pos.outcome}
                                        </span>
                                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{pos.shares} shares</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="font-mono font-bold text-white mb-0.5">${pos.value.toFixed(2)}</p>
                                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${pos.pnl >= 0 ? 'bg-profit/10 text-profit' : 'bg-coral/10 text-coral'}`}>
                                        {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </button>

                        {expandedRow === pos.id && (
                            <div className="mt-5 pt-5 border-t border-white/5 space-y-4 transition-all duration-300 ease-out overflow-hidden">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Avg Price</span>
                                        <span className="font-mono text-sm text-white/80">{(pos.avgPrice * 100).toFixed(0)}¢</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Current</span>
                                        <span className="font-mono text-sm text-white/80">{(pos.currentPrice * 100).toFixed(0)}¢</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total P&L</span>
                                        <span className={`font-mono text-sm font-bold ${pos.pnl >= 0 ? 'text-profit' : 'text-coral'}`}>
                                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-profit/10 text-profit border border-profit/20 hover:bg-profit/20 transition-all shadow-glow-sm">
                                        Add More
                                    </button>
                                    <button className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-coral/10 text-coral border border-coral/20 hover:bg-coral/20 transition-all">
                                        Sell All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
