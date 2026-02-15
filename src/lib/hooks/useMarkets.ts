/**
 * useMarkets Hook
 * ═══════════════════════════════════════════════════════════════
 * Client-side hook for fetching real-time football markets from
 * the Polymarket API via our Netlify proxy function.
 * Supports auto-refresh and search/filter.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MarketCardData, GammaEvent, Market } from '../polymarket/types';
import { transformToCardData, transformEventToCardData, isFootballRelated } from '../polymarket/types';

const PROXY_BASE = '/.netlify/functions/polymarket-proxy';
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const REFRESH_INTERVAL = 60_000; // 60 seconds

interface UseMarketsOptions {
    initialMarkets?: MarketCardData[];
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseMarketsReturn {
    markets: MarketCardData[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
    isLive: boolean;
}

/**
 * Fetch from our Netlify proxy (preferred) or directly from Gamma API
 */
async function fetchFromProxy(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
    // Try proxy first (handles CORS)
    try {
        const url = new URL(PROXY_BASE, window.location.origin);
        url.searchParams.set('endpoint', endpoint);
        Object.entries(params).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
        });

        const response = await fetch(url.toString());
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        // Proxy unavailable, try direct
    }

    // Fallback: direct API call (may fail due to CORS in browser)
    try {
        const url = new URL(`${GAMMA_API_BASE}/${endpoint}`);
        Object.entries(params).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
        });

        const response = await fetch(url.toString());
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        // Both failed
    }

    return null;
}

/**
 * Fetch football markets from the client side
 */
async function fetchClientFootballMarkets(): Promise<MarketCardData[]> {
    const allCards: MarketCardData[] = [];
    const seenIds = new Set<string>();

    // Strategy 1: Fetch events with football tag slugs
    for (const tagSlug of ['soccer', 'football', 'sports']) {
        try {
            const data = await fetchFromProxy('events', {
                tag_slug: tagSlug,
                active: 'true',
                closed: 'false',
                limit: '100',
            });

            if (Array.isArray(data)) {
                for (const event of data as GammaEvent[]) {
                    if (!seenIds.has(event.id)) {
                        seenIds.add(event.id);
                        const cards = transformEventToCardData(event);
                        allCards.push(...cards);
                    }
                }
            }
        } catch (e) {
            // Continue
        }
    }

    // Strategy 2: Search markets directly
    for (const term of ['football', 'soccer']) {
        try {
            const data = await fetchFromProxy('markets', {
                search: term,
                active: 'true',
                closed: 'false',
                limit: '50',
            });

            const markets = Array.isArray(data) ? data : [];
            for (const market of markets as Market[]) {
                const id = market.conditionId;
                if (id && !seenIds.has(id) && isFootballRelated(market.question, market.tags)) {
                    seenIds.add(id);
                    allCards.push(transformToCardData(market));
                }
            }
        } catch (e) {
            // Continue
        }
    }

    // Filter out markets with no outcomes and sort by volume
    return allCards
        .filter(m => m.outcomes && m.outcomes.length > 0)
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
}

export function useMarkets(options: UseMarketsOptions = {}): UseMarketsReturn {
    const {
        initialMarkets = [],
        autoRefresh = true,
        refreshInterval = REFRESH_INTERVAL,
    } = options;

    const [markets, setMarkets] = useState<MarketCardData[]>(initialMarkets);
    const [loading, setLoading] = useState(initialMarkets.length === 0);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(
        initialMarkets.length > 0 ? new Date() : null
    );
    const [isLive, setIsLive] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const freshMarkets = await fetchClientFootballMarkets();

            if (freshMarkets.length > 0) {
                setMarkets(freshMarkets);
                setIsLive(true);
            }
            setLastUpdated(new Date());
        } catch (e) {
            setError('Failed to refresh market data');
            console.error('Market refresh error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch (if no initial markets provided)
    useEffect(() => {
        if (initialMarkets.length === 0) {
            refresh();
        }
    }, [initialMarkets.length, refresh]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        intervalRef.current = setInterval(refresh, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, refresh]);

    return { markets, loading, error, lastUpdated, refresh, isLive };
}
