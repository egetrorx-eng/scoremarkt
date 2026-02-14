import React, { useEffect, useState } from 'react';
import { useWatchlist } from '../../lib/hooks/useWatchlist';
import { getMarkets } from '../../lib/polymarket/gamma';
import type { MarketCardData } from '../../lib/polymarket/types';

export default function WatchlistSidebar() {
    const { watchlist, ready: watchlistReady } = useWatchlist();
    const [markets, setMarkets] = useState<MarketCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWatchlistMarkets() {
            if (watchlist.length === 0) {
                setMarkets([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // For now, we fetch all markets and filter. 
                // In a production app, we'd have a getMarketsByIds endpoint.
                const allMarkets = await getMarkets({ limit: 100 });
                const filtered = allMarkets.filter(m => watchlist.includes(m.id));
                setMarkets(filtered);
            } catch (error) {
                console.error('Error fetching watchlist markets:', error);
            } finally {
                setLoading(false);
            }
        }

        if (watchlistReady) {
            fetchWatchlistMarkets();
        }
    }, [watchlist, watchlistReady]);

    if (!watchlistReady || (loading && markets.length === 0)) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-20 bg-white/5 rounded-2xl"></div>
                <div className="h-20 bg-white/5 rounded-2xl"></div>
            </div>
        );
    }

    if (markets.length === 0) {
        return (
            <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-white/10">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Track Your Alpha</p>
                <p className="text-[9px] text-white/30 leading-relaxed uppercase tracking-widest">Star markets to track them in this terminal.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                Global Watchlist
                <span className="text-gold font-bold">{markets.length}</span>
            </h3>

            <div className="space-y-2">
                {markets.map((market) => (
                    <a
                        key={market.id}
                        href={`/market/${market.id}`}
                        className="group flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <h4 className="text-[11px] font-bold text-white group-hover:text-gold transition-colors line-clamp-1 flex-1 mr-2 capitalize">
                                {market.question}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-lime-400">
                                {market.outcomes[0].priceFormatted}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                                    {market.volumeFormatted} VOL
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className={`text-[8px] font-bold uppercase tracking-tighter ${true ? 'text-profit' : 'text-coral'}`}>
                                    +2.4%
                                </span>
                                <svg className="w-2 h-2 text-profit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                                </svg>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
