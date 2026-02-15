import React, { useState, useMemo } from 'react';
import MarketSearch from './MarketSearch';
import MarketHeatmap from './MarketHeatmap';
import MarketGrid from './MarketGrid';
import type { MarketCardData } from '../../lib/polymarket/types';
import { useMarkets } from '../../lib/hooks/useMarkets';

interface MarketExplorerProps {
    initialMarkets: MarketCardData[];
    emptyMessage?: string;
}

export default function MarketExplorer({ initialMarkets, emptyMessage }: MarketExplorerProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Use the real-time markets hook with auto-refresh
    const { markets: liveMarkets, loading, lastUpdated, isLive, refresh } = useMarkets({
        initialMarkets,
        autoRefresh: true,
        refreshInterval: 60_000,
    });

    // Use live data if available, otherwise use initial (SSR) data
    const activeMarkets = liveMarkets.length > 0 ? liveMarkets : initialMarkets;

    const filteredMarkets = useMemo(() => {
        if (!searchQuery.trim()) return activeMarkets;

        const q = searchQuery.toLowerCase();
        return activeMarkets.filter(m =>
            m.question.toLowerCase().includes(q) ||
            (m.league && m.league.toLowerCase().includes(q)) ||
            (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
            (m.teams && m.teams.some(t => t.toLowerCase().includes(q)))
        );
    }, [searchQuery, activeMarkets]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Search Bar */}
            <div className="flex justify-center">
                <MarketSearch onSearch={setSearchQuery} />
            </div>

            {/* Live Data Status Indicator */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={`relative flex h-2 w-2 ${isLive ? '' : 'opacity-50'}`}>
                        {isLive && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-lime-500' : 'bg-white/30'}`}></span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                        {isLive ? 'Live Data' : 'Cached Data'}
                    </span>
                    {lastUpdated && (
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => refresh()}
                    className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-lime-400 transition-colors px-2 py-1 rounded border border-white/5 hover:border-lime-500/30"
                    title="Refresh market data"
                >
                    Refresh
                </button>
            </div>

            {/* Heatmap */}
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
                    loading={loading}
                    columns={2}
                    emptyMessage={searchQuery ? `No markets matching "${searchQuery}"` : emptyMessage}
                />
            </div>
        </div>
    );
}
