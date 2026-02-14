import React, { useState, useMemo } from 'react';
import MarketSearch from './MarketSearch';
import MarketHeatmap from './MarketHeatmap';
import MarketGrid from './MarketGrid';
import type { MarketCardData } from '../../lib/polymarket/types';

interface MarketExplorerProps {
    initialMarkets: MarketCardData[];
    emptyMessage?: string;
}

export default function MarketExplorer({ initialMarkets, emptyMessage }: MarketExplorerProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMarkets = useMemo(() => {
        if (!searchQuery.trim()) return initialMarkets;

        const q = searchQuery.toLowerCase();
        return initialMarkets.filter(m =>
            m.question.toLowerCase().includes(q) ||
            (m.league && m.league.toLowerCase().includes(q)) ||
            (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
            (m.teams && m.teams.some(t => t.toLowerCase().includes(q)))
        );
    }, [searchQuery, initialMarkets]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Search Bar - Moved into Explorer for reactive filtering */}
            <div className="flex justify-center">
                <MarketSearch onSearch={setSearchQuery} />
            </div>

            {/* Heatmap - Also reactive to search if we want, or just showing the subset */}
            <MarketHeatmap markets={filteredMarkets} />

            {/* Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">
                        Market Grid
                    </h2>
                    <span className="text-[10px] font-bold py-1 px-2.5 rounded bg-white/5 text-white/30 border border-white/10 uppercase tracking-widest">
                        {filteredMarkets.length} {filteredMarkets.length === 1 ? 'Market' : 'Markets'}
                    </span>
                </div>

                <MarketGrid
                    markets={filteredMarkets}
                    columns={2}
                    emptyMessage={searchQuery ? `No markets matching "${searchQuery}"` : emptyMessage}
                />
            </div>
        </div>
    );
}
