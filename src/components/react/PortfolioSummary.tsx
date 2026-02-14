/**
 * PortfolioSummary Component
 * ═══════════════════════════════════════════════════════════════
 * Displays user's portfolio overview with key metrics.
 */

import React from 'react';

interface PortfolioData {
    totalValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    availableBalance: number;
    investedValue: number;
    winRate: number;
    roi: number;
}

interface PortfolioSummaryProps {
    data: PortfolioData;
}

export default function PortfolioSummary({ data }: PortfolioSummaryProps) {
    const isProfitable = data.totalPnl >= 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Value */}
            <div className="group relative card overflow-hidden col-span-2 lg:col-span-1 border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300 hover:border-lime-500/30 hover:shadow-glow/20">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-12 h-12 text-lime-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                    </svg>
                </div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center border border-lime-500/20 shadow-[0_0_15px_rgba(191,255,0,0.1)]">
                        <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Total Value</span>
                </div>
                <div className="text-3xl font-bold font-display text-white relative z-10 group-hover:text-lime-400 transition-colors duration-300">
                    ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Total P&L */}
            <div className="group card border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${isProfitable ? 'bg-profit/20 border-profit/20' : 'bg-coral/20 border-coral/20'} border flex items-center justify-center`}>
                        <svg className={`w-5 h-5 ${isProfitable ? 'text-profit' : 'text-coral'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isProfitable ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Total P&L</span>
                </div>
                <div className={`text-2xl font-bold font-display ${isProfitable ? 'text-profit' : 'text-coral'}`}>
                    {isProfitable ? '+' : ''}{data.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-lg ml-1 opacity-80">({isProfitable ? '+' : ''}{data.totalPnlPercent.toFixed(1)}%)</span>
                </div>
            </div>

            {/* Available Balance */}
            <div className="group card border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Available</span>
                </div>
                <div className="text-2xl font-bold font-display text-white group-hover:text-neon-cyan transition-colors duration-300">
                    ${data.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Invested Value */}
            <div className="group card border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Invested</span>
                </div>
                <div className="text-2xl font-bold font-display text-white group-hover:text-gold transition-colors duration-300">
                    ${data.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Simulated Win Rate */}
            <div className="group card border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Win Rate</span>
                </div>
                <div className="text-2xl font-bold font-display text-white group-hover:text-purple-400 transition-colors duration-300">
                    {data.winRate.toFixed(1)}%
                </div>
            </div>

            {/* Total ROI */}
            <div className="group card border border-white/10 bg-midnight-800/40 backdrop-blur-md hover:bg-midnight-700/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-profit/20 border border-profit/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-profit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-white/50 tracking-wide uppercase">Total ROI</span>
                </div>
                <div className="text-2xl font-bold font-display text-profit">
                    +{data.roi.toFixed(1)}%
                </div>
            </div>
        </div>
    );
}
