import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_STORAGE_KEY = 'scoremarkt_watchlist';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
            setWatchlist(JSON.parse(stored));
        }
        setReady(true);
    }, []);

    const toggleWatchlist = useCallback((marketId: string) => {
        setWatchlist(prev => {
            const next = prev.includes(marketId)
                ? prev.filter(id => id !== marketId)
                : [...prev, marketId];

            localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isInWatchlist = useCallback((marketId: string) => {
        return watchlist.includes(marketId);
    }, [watchlist]);

    return { watchlist, toggleWatchlist, isInWatchlist, ready };
}
