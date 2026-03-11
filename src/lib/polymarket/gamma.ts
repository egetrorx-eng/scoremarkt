/**
 * Polymarket Gamma API Client
 * ═══════════════════════════════════════════════════════════════
 * Fetches real-time football/soccer prediction markets from Polymarket.
 *
 * Strategy:
 * 1. Use /events endpoint with football-related tag filtering
 * 2. Search for "football" and "soccer" keywords via /events
 * 3. Also try /markets endpoint with text search
 * 4. Filter results through football keyword detection
 * 5. Fall back to mock data when API returns no football results
 */

import type { Market, MarketFilters, MarketCardData, GammaEvent } from './types';
import { transformToCardData, transformEventToCardData, isFootballRelated } from './types';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

// Football/soccer search terms for the Gamma API
const FOOTBALL_SEARCH_TERMS = ['football', 'soccer', 'premier league', 'champions league', 'la liga', 'bundesliga', 'serie a'];

// Football-related tag slugs known to exist on Polymarket
const FOOTBALL_TAG_SLUGS = ['soccer', 'football', 'sports'];

/**
 * Fetch events from Polymarket Gamma API /events endpoint
 */
async function fetchEvents(params: Record<string, string | number | boolean> = {}): Promise<GammaEvent[]> {
    const url = new URL(`${GAMMA_API_BASE}/events`);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, String(value));
        }
    });

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            console.warn(`Gamma events API returned ${response.status}`);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

/**
 * Fetch markets from Polymarket Gamma API /markets endpoint
 */
async function fetchMarkets(params: Record<string, string | number | boolean> = {}): Promise<Market[]> {
    const url = new URL(`${GAMMA_API_BASE}/markets`);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, String(value));
        }
    });

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            console.warn(`Gamma markets API returned ${response.status}`);
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error fetching markets:', error);
        return [];
    }
}

/**
 * Fetch football events using multiple strategies
 */
async function fetchFootballEvents(options: { limit?: number; offset?: number; closed?: boolean } = {}): Promise<GammaEvent[]> {
    const { limit = 100, offset = 0, closed = false } = options;
    const allEvents: GammaEvent[] = [];
    const seenIds = new Set<string>();

    // Strategy 1: Fetch events with football-related tag slugs
    for (const tagSlug of FOOTBALL_TAG_SLUGS) {
        try {
            const events = await fetchEvents({
                tag_slug: tagSlug,
                active: true,
                closed,
                limit,
                offset,
            });
            for (const event of events) {
                if (!seenIds.has(event.id)) {
                    seenIds.add(event.id);
                    allEvents.push(event);
                }
            }
        } catch (e) {
            // Continue with other strategies
        }
    }

    // Strategy 2: Search for football keywords using the tag parameter
    for (const tag of ['Soccer', 'Football']) {
        try {
            const events = await fetchEvents({
                tag,
                active: true,
                closed,
                limit: 50,
                offset: 0,
            });
            for (const event of events) {
                if (!seenIds.has(event.id)) {
                    seenIds.add(event.id);
                    allEvents.push(event);
                }
            }
        } catch (e) {
            // Continue
        }
    }

    // Strategy 3: Broad sports events search to find football within them
    try {
        const sportsEvents = await fetchEvents({
            active: true,
            closed,
            limit: 200,
            offset: 0,
            order: 'volume',
            ascending: false,
        });

        for (const event of sportsEvents) {
            if (!seenIds.has(event.id)) {
                const tagTexts = (event.tags || []).map(t => t.slug || t.label);
                if (isFootballRelated(event.title + ' ' + (event.description || ''), tagTexts)) {
                    seenIds.add(event.id);
                    allEvents.push(event);
                }
            }
        }
    } catch (e) {
        // Continue
    }

    return allEvents;
}

/**
 * Fetch football markets directly from /markets endpoint
 */
async function fetchFootballMarketsDirect(options: { limit?: number; offset?: number; closed?: boolean } = {}): Promise<Market[]> {
    const { limit = 100, offset = 0, closed = false } = options;
    const allMarkets: Market[] = [];
    const seenIds = new Set<string>();

    // Try multiple search terms
    for (const term of FOOTBALL_SEARCH_TERMS) {
        try {
            const markets = await fetchMarkets({
                search: term,
                active: true,
                closed,
                limit: 50,
                offset,
            });

            for (const market of markets) {
                const id = market.conditionId || market.questionId;
                if (id && !seenIds.has(id)) {
                    seenIds.add(id);
                    allMarkets.push(market);
                }
            }
        } catch (e) {
            // Continue
        }

        // Don't exhaust the API
        if (allMarkets.length >= limit) break;
    }

    // Filter to only genuinely football-related markets
    return allMarkets.filter(m =>
        isFootballRelated(m.question + ' ' + (m.description || ''), m.tags)
    );
}

/**
 * Get all football/soccer markets (primary export)
 * Combines events-based and markets-based discovery
 */
export async function getFootballMarkets(options: MarketFilters = {}): Promise<MarketCardData[]> {
    const { limit = 50, offset = 0, status = 'open' } = options;
    const closed = status === 'closed';

    let allCards: MarketCardData[] = [];

    try {
        // Get events and extract markets from them
        const events = await fetchFootballEvents({ limit: 100, offset: 0, closed });
        for (const event of events) {
            const cards = transformEventToCardData(event);
            allCards.push(...cards);
        }
    } catch (e) {
        console.error('Error in events-based fetching:', e);
    }

    // If we didn't get enough, also try direct markets endpoint
    if (allCards.length < limit) {
        try {
            const directMarkets = await fetchFootballMarketsDirect({ limit: 50, offset: 0, closed });
            const seenIds = new Set(allCards.map(c => c.id));
            for (const market of directMarkets) {
                const id = market.conditionId;
                if (id && !seenIds.has(id)) {
                    seenIds.add(id);
                    allCards.push(transformToCardData(market));
                }
            }
        } catch (e) {
            console.error('Error in direct markets fetching:', e);
        }
    }

    // Deduplicate by id
    const uniqueMap = new Map<string, MarketCardData>();
    for (const card of allCards) {
        if (card.id && !uniqueMap.has(card.id)) {
            uniqueMap.set(card.id, card);
        }
    }
    let results = Array.from(uniqueMap.values());

    // Filter by search
    if (options.search) {
        const searchLower = options.search.toLowerCase();
        results = results.filter(m =>
            m.question.toLowerCase().includes(searchLower) ||
            m.description?.toLowerCase().includes(searchLower) ||
            m.tags?.some(t => t.toLowerCase().includes(searchLower)) ||
            m.teams?.some(t => t.toLowerCase().includes(searchLower))
        );
    }

    // Filter by league
    if (options.league && options.league !== 'all') {
        results = results.filter(m =>
            m.league === options.league ||
            m.tags?.some(t => t.toLowerCase().includes(options.league!.toLowerCase())) ||
            m.question.toLowerCase().includes(options.league!.replace('-', ' ').toLowerCase())
        );
    }

    // Filter by status
    if (status === 'open') {
        results = results.filter(m => !m.isClosed);
    } else if (status === 'closed') {
        results = results.filter(m => m.isClosed);
    }

    // Filter out markets with no outcomes
    results = results.filter(m => m.outcomes && m.outcomes.length > 0);

    // Sort
    results = sortMarkets(results, options.sort || 'volume');

    // Apply limit/offset
    return results.slice(offset, offset + limit);
}

/**
 * Get featured/trending markets
 */
export async function getFeaturedMarkets(limit = 6): Promise<MarketCardData[]> {
    const allMarkets = await getMarkets({ limit: 50 });

    return allMarkets
        .filter(m => !m.isClosed && m.outcomes.length > 0)
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, limit);
}

/**
 * Get live/today markets
 */
export async function getLiveMarkets(): Promise<MarketCardData[]> {
    const allMarkets = await getMarkets({ limit: 100 });
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allMarkets.filter(m => {
        if (!m.endDate || m.isClosed) return false;
        const endDate = new Date(m.endDate);
        return endDate >= now && endDate <= tomorrow;
    });
}

/**
 * Get single market by condition ID
 */
export async function getMarketById(conditionId: string): Promise<MarketCardData | null> {
    // If it's a mock ID, return from MOCK_MARKETS
    if (conditionId.startsWith('mock-')) {
        const mock = MOCK_MARKETS.find(m => m.id === conditionId);
        return mock || null;
    }

    try {
        // Try fetching by condition_id from the markets endpoint
        const url = new URL(`${GAMMA_API_BASE}/markets`);
        url.searchParams.set('condition_id', conditionId);

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Market not found: ${conditionId}`);
        }

        const data = await response.json();
        const market = Array.isArray(data) ? data[0] : data;

        if (!market) return null;
        return transformToCardData(market);
    } catch (error) {
        console.error('Error fetching market:', error);

        // Also try the slug/id approach via events
        try {
            const url = new URL(`${GAMMA_API_BASE}/events`);
            url.searchParams.set('id', conditionId);
            const response = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const events = await response.json();
                if (Array.isArray(events) && events.length > 0) {
                    const cards = transformEventToCardData(events[0]);
                    if (cards.length > 0) return cards[0];
                }
            }
        } catch (e) {
            // Fall through to null
        }

        return null;
    }
}

/**
 * Search markets by query
 */
export async function searchMarkets(query: string): Promise<MarketCardData[]> {
    const allMarkets = await getFootballMarkets({ limit: 200, search: query });
    return allMarkets.slice(0, 20);
}

/**
 * Get markets by league
 */
export async function getMarketsByLeague(league: string): Promise<MarketCardData[]> {
    return getFootballMarkets({ league, limit: 50 });
}

/**
 * Sort markets by criteria
 */
function sortMarkets(markets: MarketCardData[], sortBy: string): MarketCardData[] {
    const sorted = [...markets];

    switch (sortBy) {
        case 'volume':
            return sorted.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
        case 'liquidity':
            return sorted.sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity));
        case 'newest':
            return sorted.sort((a, b) => {
                if (!a.endDate || !b.endDate) return 0;
                return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
            });
        case 'ending':
            return sorted.sort((a, b) => {
                if (!a.endDate || !b.endDate) return 0;
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            });
        default:
            return sorted;
    }
}

/**
 * Get available leagues from markets
 */
export function extractLeagues(markets: MarketCardData[]): string[] {
    const leagues = new Set<string>();

    markets.forEach(m => {
        if (m.league) {
            leagues.add(m.league);
        }
    });

    return Array.from(leagues).sort();
}

/**
 * Get user positions (mock for now)
 */
export async function getUserPositions(address: string) {
    console.log(`Fetching positions for ${address}`);
    return [
        {
            id: '1',
            market: 'Will Manchester City win the Premier League 2024/25?',
            marketId: 'mock-1',
            outcome: 'Yes',
            shares: 125,
            avgPrice: 0.62,
            currentPrice: 0.65,
            value: 81.25,
            pnl: 3.75,
            pnlPercent: 4.84,
        },
        {
            id: '2',
            market: 'Will Real Madrid win the Champions League 2024/25?',
            marketId: 'mock-2',
            outcome: 'Yes',
            shares: 200,
            avgPrice: 0.25,
            currentPrice: 0.28,
            value: 56.00,
            pnl: 6.00,
            pnlPercent: 12.00,
        },
        {
            id: '3',
            market: 'Will Liverpool beat Arsenal this weekend?',
            marketId: 'mock-3',
            outcome: 'Liverpool',
            shares: 75,
            avgPrice: 0.38,
            currentPrice: 0.42,
            value: 31.50,
            pnl: 3.00,
            pnlPercent: 10.53,
        },
    ];
}

/**
 * Get user portfolio summary (mock for now)
 */
export async function getUserPortfolioSummary(address: string) {
    console.log(`Fetching portfolio summary for ${address}`);
    return {
        totalValue: 2847.52,
        totalPnl: 423.18,
        totalPnlPercent: 17.45,
        availableBalance: 1250.00,
        investedValue: 1597.52,
    };
}

/**
 * Get user trade history (mock for now)
 */
export async function getUserTradeHistory(address: string) {
    return [
        { id: 't1', market: 'Man City - Premier League', side: 'BUY', outcome: 'Yes', shares: 50, price: 0.65, time: '2 hours ago' },
        { id: 't2', market: 'Real Madrid - UCL', side: 'BUY', outcome: 'Yes', shares: 100, price: 0.27, time: '1 day ago' },
        { id: 't3', market: 'Liverpool vs Arsenal', side: 'SELL', outcome: 'Draw', shares: 25, price: 0.28, time: '2 days ago' },
    ];
}

/**
 * Get user closed positions (mock for now)
 */
export async function getUserClosedPositions(address: string) {
    return [
        {
            id: 'c1',
            market: 'Will Chelsea beat Tottenham?',
            outcome: 'Yes',
            shares: 100,
            entryPrice: 0.55,
            exitPrice: 1.00,
            pnl: 45.00,
            closedAt: '2025-01-10',
            won: true,
        },
        {
            id: 'c2',
            market: 'Will Arsenal win against Newcastle?',
            outcome: 'No',
            shares: 50,
            entryPrice: 0.40,
            exitPrice: 0.00,
            pnl: -20.00,
            closedAt: '2025-01-08',
            won: false,
        },
    ];
}

// Mock data for development/demo
export const MOCK_MARKETS: MarketCardData[] = [
    {
        id: 'mock-1',
        question: 'Will Manchester City win the Premier League 2024/25?',
        description: 'This market resolves to Yes if Manchester City finishes first in the Premier League standings.',
        outcomes: [
            { name: 'Yes', price: 0.65, priceFormatted: '65%' },
            { name: 'No', price: 0.35, priceFormatted: '35%' },
        ],
        volume: '2500000',
        volumeFormatted: '$2.5M',
        liquidity: '150000',
        endDate: '2025-05-25T22:00:00Z',
        endDateFormatted: 'May 25',
        image: '',
        tags: ['football', 'premier-league', 'manchester-city'],
        isClosed: false,
        isNew: false,
        isFeatured: true,
        league: 'premier-league',
        teams: ['manchester-city'],
        clobTokenIds: ['21742464016664973305260124610141639145892881180425624911786522302196620576307'],
        outcomePrices: ['0.65', '0.35']
    },
    {
        id: 'mock-2',
        question: 'Will Real Madrid win the Champions League 2024/25?',
        description: 'This market resolves to Yes if Real Madrid wins the UEFA Champions League final.',
        outcomes: [
            { name: 'Yes', price: 0.28, priceFormatted: '28%' },
            { name: 'No', price: 0.72, priceFormatted: '72%' },
        ],
        volume: '4200000',
        volumeFormatted: '$4.2M',
        liquidity: '280000',
        endDate: '2025-05-31T21:00:00Z',
        endDateFormatted: 'May 31',
        image: '',
        tags: ['football', 'champions-league', 'real-madrid'],
        isClosed: false,
        isNew: false,
        isFeatured: true,
        league: 'champions-league',
        teams: ['real-madrid'],
        clobTokenIds: ['91901048805217983050117464052303031175628173428987258384218335017559132569437'],
        outcomePrices: ['0.28', '0.72']
    },
    {
        id: 'mock-3',
        question: 'Will Liverpool beat Arsenal this weekend?',
        description: 'This market resolves to Yes if Liverpool defeats Arsenal in their weekend match.',
        outcomes: [
            { name: 'Liverpool', price: 0.42, priceFormatted: '42%' },
            { name: 'Draw', price: 0.28, priceFormatted: '28%' },
            { name: 'Arsenal', price: 0.30, priceFormatted: '30%' },
        ],
        volume: '850000',
        volumeFormatted: '$850K',
        liquidity: '75000',
        endDate: '2025-01-18T15:00:00Z',
        endDateFormatted: 'Tomorrow',
        image: '',
        tags: ['football', 'premier-league', 'liverpool', 'arsenal'],
        isClosed: false,
        isNew: true,
        isFeatured: false,
        league: 'premier-league',
        teams: ['liverpool', 'arsenal'],
        clobTokenIds: ['1121010385750212983050117464052303031175628173428987258384218335017559132569437'],
        outcomePrices: ['0.42', '0.28', '0.30']
    },
    {
        id: 'mock-4',
        question: 'Will Barcelona win La Liga 2024/25?',
        description: 'Market resolves to Yes if Barcelona finishes first in La Liga.',
        outcomes: [
            { name: 'Yes', price: 0.55, priceFormatted: '55%' },
            { name: 'No', price: 0.45, priceFormatted: '45%' },
        ],
        volume: '1800000',
        volumeFormatted: '$1.8M',
        liquidity: '120000',
        endDate: '2025-05-26T20:00:00Z',
        endDateFormatted: 'May 26',
        image: '',
        tags: ['football', 'la-liga', 'barcelona'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'la-liga',
        teams: ['barcelona'],
        clobTokenIds: [],
        outcomePrices: ['0.55', '0.45']
    },
    {
        id: 'mock-5',
        question: 'Will Bayern Munich win the Bundesliga 2024/25?',
        description: 'Market resolves to Yes if Bayern Munich finishes first in the Bundesliga.',
        outcomes: [
            { name: 'Yes', price: 0.72, priceFormatted: '72%' },
            { name: 'No', price: 0.28, priceFormatted: '28%' },
        ],
        volume: '980000',
        volumeFormatted: '$980K',
        liquidity: '85000',
        endDate: '2025-05-17T17:30:00Z',
        endDateFormatted: 'May 17',
        image: '',
        tags: ['football', 'bundesliga', 'bayern-munich'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'bundesliga',
        teams: ['bayern-munich'],
        clobTokenIds: [],
        outcomePrices: ['0.72', '0.28']
    },
    {
        id: 'mock-6',
        question: 'Will Inter Milan win Serie A 2024/25?',
        description: 'Market resolves to Yes if Inter Milan finishes first in Serie A.',
        outcomes: [
            { name: 'Yes', price: 0.58, priceFormatted: '58%' },
            { name: 'No', price: 0.42, priceFormatted: '42%' },
        ],
        volume: '720000',
        volumeFormatted: '$720K',
        liquidity: '65000',
        endDate: '2025-05-25T18:00:00Z',
        endDateFormatted: 'May 25',
        image: '',
        tags: ['football', 'serie-a', 'inter-milan'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'serie-a',
        teams: ['inter-milan'],
        clobTokenIds: [],
        outcomePrices: ['0.58', '0.42']
    },
];

/**
 * Get markets (with fallback to mock data for development)
 */
export async function getMarkets(options: MarketFilters = {}): Promise<MarketCardData[]> {
    try {
        const markets = await getFootballMarkets(options);

        if (markets.length === 0) {
            console.log('No football markets from API, using mock data');

            let filteredMocks = [...MOCK_MARKETS];

            if (options.league && options.league !== 'all') {
                filteredMocks = filteredMocks.filter(m => m.league === options.league);
            }
            if (options.status === 'closed') {
                filteredMocks = filteredMocks.filter(m => m.isClosed);
            } else if (options.status === 'open') {
                filteredMocks = filteredMocks.filter(m => !m.isClosed);
            }
            if (options.search) {
                const q = options.search.toLowerCase();
                filteredMocks = filteredMocks.filter(m =>
                    m.question.toLowerCase().includes(q) ||
                    m.description?.toLowerCase().includes(q)
                );
            }

            return filteredMocks;
        }

        return markets;
    } catch (error) {
        console.error('Error fetching markets, using mock data:', error);
        return MOCK_MARKETS;
    }
}
