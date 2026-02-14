/**
 * OrderBook Component
 * ═══════════════════════════════════════════════════════════════
 * Displays bids and asks for a market.
 */

import React, { useMemo } from 'react';
import { useClobWebSocket } from '@/lib/hooks/useClobWebSocket';

interface OrderBookProps {
    clobTokenId?: string;
    basePrice?: number;
}

export default function OrderBook({ clobTokenId, basePrice = 0.5 }: OrderBookProps) {
    const { books } = useClobWebSocket(clobTokenId ? [clobTokenId] : []);
    const liveBook = clobTokenId ? books[clobTokenId] : null;

    const priceCents = Math.round(basePrice * 100);

    const bids = useMemo(() => {
        if (liveBook?.bids) {
            return liveBook.bids.slice(0, 5).map((bid, i) => ({
                price: Math.round(parseFloat(bid.price) * 100),
                size: parseFloat(bid.size),
                depth: Math.min(100, (parseFloat(bid.size) / 1000) * 100 + 20)
            }));
        }

        return Array.from({ length: 5 }, (_, i) => ({
            price: priceCents - (i + 1),
            size: Math.floor(Math.random() * 500) + 100,
            depth: 90 - i * 15
        }));
    }, [priceCents, liveBook]);

    const asks = useMemo(() => {
        if (liveBook?.asks) {
            return liveBook.asks.slice(0, 5).map((ask, i) => ({
                price: Math.round(parseFloat(ask.price) * 100),
                size: parseFloat(ask.size),
                depth: Math.min(100, (parseFloat(ask.size) / 1000) * 100 + 20)
            }));
        }

        return Array.from({ length: 5 }, (_, i) => ({
            price: priceCents + i,
            size: Math.floor(Math.random() * 500) + 100,
            depth: 85 - i * 12
        }));
    }, [priceCents, liveBook]);

    return (
        <div className="card p-8 border border-white/10 bg-midnight-800/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold font-display text-white border-l-4 border-lime-500 pl-4">Live Order Book</h3>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">USDC POOL</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Bids */}
                <div>
                    <h4 className="text-[10px] font-bold text-profit uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                        Bids
                        <span className="text-white/20">Size</span>
                    </h4>
                    <div className="space-y-2">
                        {bids.map((bid, i) => (
                            <div key={bid.price} className="flex items-center gap-3 group/row">
                                <span className="w-12 font-mono font-bold text-profit text-sm">{bid.price}¢</span>
                                <div className="flex-1 h-8 bg-midnight-900/50 rounded-lg relative overflow-hidden border border-white/5">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-profit/20 border-r border-profit/30 transition-all duration-700 group-hover/row:bg-profit/40"
                                        style={{ width: `${bid.depth}%` }}
                                    />
                                    <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold font-mono text-white/70">
                                        ${bid.size.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Asks */}
                <div>
                    <h4 className="text-[10px] font-bold text-coral uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                        Asks
                        <span className="text-white/20">Size</span>
                    </h4>
                    <div className="space-y-2">
                        {asks.map((ask, i) => (
                            <div key={ask.price} className="flex items-center gap-3 group/row">
                                <span className="w-12 font-mono font-bold text-coral text-sm">{ask.price}¢</span>
                                <div className="flex-1 h-8 bg-midnight-900/50 rounded-lg relative overflow-hidden border border-white/5">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-coral/20 border-r border-coral/30 transition-all duration-700 group-hover/row:bg-coral/40"
                                        style={{ width: `${ask.depth}%` }}
                                    />
                                    <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-bold font-mono text-white/70">
                                        ${ask.size.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
