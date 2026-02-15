/**
 * SocialTape Component
 * ═══════════════════════════════════════════════════════════════
 * A real-time scrolling feed of "Whale Activations" and AI signals.
 */

import React, { useState, useEffect, useMemo } from 'react';

interface TapeEvent {
    id: string;
    type: 'WHALE_BUY' | 'ALPHA_SIGNAL' | 'MARKET_END' | 'LIQUIDATION';
    user: string;
    content: string;
    timestamp: number;
    amount?: string;
    marketId?: string;
    outcome?: string;
}

interface SocialTapeProps {
    minimal?: boolean;
}

export default function SocialTape({ minimal = false }: SocialTapeProps) {
    const [events, setEvents] = useState<TapeEvent[]>([]);

    // Mock live feed generation
    useEffect(() => {
        const initialEvents: TapeEvent[] = [
            { id: '1', type: 'WHALE_BUY', user: 'AlphaTerminal_01', content: 'Placed $1.2k on Soccer: Arsenal Win', timestamp: Date.now() - 5000, amount: '$1,200', marketId: '22881', outcome: 'Yes' },
            { id: '2', type: 'ALPHA_SIGNAL', user: 'ScoreMarkt AI', content: 'High Alpha (92%) detected on Champions League', timestamp: Date.now() - 15000 },
            { id: '3', type: 'WHALE_BUY', user: 'LiquidityHunter', content: 'Positioned $850 on Underdog Victory (Serie A)', timestamp: Date.now() - 30000, amount: '$850', marketId: '22882', outcome: 'Yes' },
        ];
        setEvents(initialEvents);

        const interval = setInterval(() => {
            const types: TapeEvent['type'][] = ['WHALE_BUY', 'ALPHA_SIGNAL', 'MARKET_END'];
            const users = ['WhaleWatcher', 'GammaGal', 'TrendSeeker', 'ScoreMarkt AI'];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomType = types[Math.floor(Math.random() * types.length)];

            const newEvent: TapeEvent = {
                id: Math.random().toString(36).substr(2, 9),
                type: randomType,
                user: randomUser,
                content: randomType === 'WHALE_BUY' ? `Entered $${(Math.random() * 500 + 500).toFixed(0)} position on Football` :
                    randomType === 'ALPHA_SIGNAL' ? `Alpha intensity increased to ${(Math.random() * 20 + 75).toFixed(0)}%` :
                        'Market settlement nearing execution',
                timestamp: Date.now(),
                amount: randomType === 'WHALE_BUY' ? `$${(Math.random() * 1000).toFixed(0)}` : undefined,
                marketId: randomType === 'WHALE_BUY' ? '22881' : undefined,
                outcome: 'Yes'
            };

            setEvents(prev => [newEvent, ...prev].slice(0, 10));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    if (minimal) {
        return (
            <div className="flex items-center gap-8 overflow-hidden whitespace-nowrap py-3 px-6 glass-dark border-y border-white/5 relative group">
                <div className="flex items-center gap-2 flex-shrink-0 border-r border-white/10 pr-6 mr-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                    <span className="text-[9px] font-black text-neon-cyan uppercase tracking-[0.2em]">Live Alpha</span>
                </div>
                <div className="flex gap-12 items-center animate-marquee hover:pause transition-all">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-white/20 font-mono">[{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${event.type === 'WHALE_BUY' ? 'text-profit' : 'text-neon-cyan'}`}>
                                {event.user}:
                            </span>
                            <span className="text-[10px] font-bold text-white/60 tracking-tight">{event.content}</span>
                            {event.marketId && (
                                <a
                                    href={`/market/${event.marketId}?mirror=${event.outcome || 'Yes'}&shares=${event.amount?.replace(/[^0-9]/g, '') || '100'}`}
                                    className="text-[9px] font-black text-lime-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
                                >
                                    [Mirror]
                                </a>
                            )}
                        </div>
                    ))}
                </div>
                {/* Horizontal Marquee Animation defined in CSS */}
            </div>
        );
    }

    return (
        <div className="card p-6 border border-white/10 bg-midnight-800/40 backdrop-blur-md overflow-hidden relative group h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Alpha Tape</h3>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                    <span className="text-[8px] font-bold text-neon-cyan/60 uppercase tracking-widest">Live Signals</span>
                </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {events.map((event) => (
                    <div key={event.id} className="animate-in slide-in-from-top-4 fade-in duration-500 border-b border-white/5 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${event.type === 'WHALE_BUY' ? 'bg-profit/10 text-profit' :
                                event.type === 'ALPHA_SIGNAL' ? 'bg-neon-cyan/10 text-neon-cyan' :
                                    'bg-white/5 text-white/40'
                                }`}>
                                {event.type.replace('_', ' ')}
                            </span>
                            <span className="text-[8px] font-bold text-white/10 font-mono">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                            <p className="text-[11px] font-bold text-white/80 leading-snug flex-1">
                                <span className="text-lime-400/80 mr-1">{event.user}</span>
                                {event.content}
                            </p>
                            {event.marketId && (
                                <button
                                    onClick={() => {
                                        window.location.href = `/market/${event.marketId}?mirror=${event.outcome || 'Yes'}&shares=${event.amount?.replace(/[^0-9]/g, '') || '100'}`;
                                    }}
                                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest hover:bg-neon-cyan hover:text-midnight-900 hover:border-neon-cyan transition-all"
                                >
                                    Mirror
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fading bottom overlay */}
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-midnight-900/60 to-transparent pointer-events-none"></div>
        </div>
    );
}
