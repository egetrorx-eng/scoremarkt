/**
 * TraderIntelligence Component
 * ═══════════════════════════════════════════════════════════════
 * Modal for analyst profiling and direct "Alpha Mirroring".
 */

import React from 'react';

interface TraderProfile {
    name: string;
    convictions: {
        marketId: string;
        question: string;
        outcome: string;
        shares: number;
        avgPrice: number;
    }[];
}

interface TraderIntelligenceProps {
    trader: TraderProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function TraderIntelligence({ trader, isOpen, onClose }: TraderIntelligenceProps) {
    if (!isOpen || !trader) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-midnight-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-300">
                <div className="card p-8 border border-white/20 bg-midnight-900 shadow-glow-lg overflow-hidden">
                    {/* Header Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 via-neon-cyan to-lime-500" />

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.3em] mb-1 block">Analyst Intelligence</span>
                            <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">{trader.name}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/10 pb-4">Top Convictions</h3>

                        <div className="space-y-4">
                            {trader.convictions.map((conv, idx) => (
                                <div key={idx} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-lime-500/30 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="text-sm font-bold text-white leading-snug max-w-[70%]">{conv.question}</p>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-lime-400 font-mono">{(conv.avgPrice * 100).toFixed(0)}¢</span>
                                            <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Entry Price</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-lime-500/10 text-lime-400">
                                                {conv.outcome}
                                            </span>
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                {conv.shares} Shares Held
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                window.location.href = `/market/${conv.marketId}?mirror=${conv.outcome}&shares=${Math.ceil(conv.shares * 0.1)}`;
                                            }}
                                            className="px-4 py-2 rounded-xl bg-lime-500 text-midnight-900 text-[10px] font-black uppercase tracking-widest hover:shadow-glow transition-all"
                                        >
                                            Mirror Alpha
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
                            Simulation data verified by ScoreMarkt Intelligence Center
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
