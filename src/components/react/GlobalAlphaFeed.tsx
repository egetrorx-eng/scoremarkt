import React, { useMemo, useEffect, useState } from 'react';
import { useClobWebSocket } from '@/lib/hooks/useClobWebSocket';
import type { MarketCardData } from '@/lib/polymarket/types';

interface AlphaEvent {
    id: string;
    type: 'PRICE_MOVE' | 'WHALE_TRADE' | 'TRENDING';
    marketName: string;
    message: string;
    timestamp: number;
    marketId?: string;
}

interface GlobalAlphaFeedProps {
    markets: MarketCardData[];
}

export default function GlobalAlphaFeed({ markets }: GlobalAlphaFeedProps) {
    const [events, setEvents] = useState<AlphaEvent[]>([]);
    const assetIds = markets.map(m => m.clobTokenIds?.[0]).filter((id): id is string => !!id);
    const { ticker } = useClobWebSocket(assetIds);

    // Initialize with some mock "Trending" events
    useEffect(() => {
        const initialEvents: AlphaEvent[] = [
            {
                id: '1',
                type: 'TRENDING',
                marketName: 'Premier League',
                message: 'High activity detected in Saturday fixtures.',
                timestamp: Date.now() - 3600000
            },
            {
                id: '2',
                type: 'WHALE_TRADE',
                marketName: 'Champions League',
                message: '$50,000 position entered on Real Madrid.',
                timestamp: Date.now() - 7200000
            }
        ];
        setEvents(initialEvents);
    }, []);

    // Monitor real-time price moves
    useEffect(() => {
        Object.entries(ticker).forEach(([asset_id, data]) => {
            const market = markets.find(m => m.clobTokenIds?.includes(asset_id));
            const price = parseFloat(data.price);

            // Randomly simulate a "Whale Trade" or "Trending" event for visual flair
            if (Math.random() > 0.99) {
                const newEvent: AlphaEvent = {
                    id: Math.random().toString(),
                    type: 'PRICE_MOVE',
                    marketName: market?.question || 'Unknown Market',
                    message: `Price shift to ${(price * 100).toFixed(1)}¢ detected.`,
                    timestamp: Date.now(),
                    marketId: market?.id
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 10));
            }
        });
    }, [ticker, markets]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Intelligence Feed</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-lime-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-lime-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Type Indicator */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${event.type === 'PRICE_MOVE' ? 'bg-lime-500' :
                            event.type === 'WHALE_TRADE' ? 'bg-neon-cyan' : 'bg-purple-500'
                            }`} />

                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${event.type === 'PRICE_MOVE' ? 'text-lime-400' :
                                event.type === 'WHALE_TRADE' ? 'text-neon-cyan' : 'text-purple-400'
                                }`}>
                                {event.type.replace('_', ' ')}
                            </span>
                            <span className="text-[8px] font-mono text-white/20">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1">
                            {event.marketName}
                        </h4>
                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                            {event.message}
                        </p>

                        {event.marketId && (
                            <a
                                href={`/market/${event.marketId}`}
                                className="mt-2 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                Inspect Alpha
                                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        )}
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-xs font-medium text-white/20 uppercase tracking-widest">Scanning Network...</p>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-lime-500/5 border border-lime-500/10">
                    <div className="w-6 h-6 rounded-lg bg-lime-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-[9px] font-medium text-white/40 leading-tight uppercase tracking-tighter">
                        PRO TIP: High volatility alerts indicate localized alpha opportunities.
                    </p>
                </div>
            </div>
        </div>
    );
}
