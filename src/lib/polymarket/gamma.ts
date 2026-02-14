/**
 * Polymarket Gamma API Client
 * ═══════════════════════════════════════════════════════════════
 * Market discovery API for fetching prediction markets.
 * Base URL: https://gamma-api.polymarket.com
 */

import type { Market, MarketFilters, MarketCardData } from './types';
import { transformToCardData } from './types';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

// Football/Soccer related tags to filter by
const FOOTBALL_TAGS = [
    'football', 'soccer', 'premier-league', 'la-liga', 'bundesliga',
    'serie-a', 'ligue-1', 'champions-league', 'europa-league',
    'world-cup', 'euros', 'copa-america', 'fifa', 'uefa'
];

/**
 * Fetch markets from Polymarket Gamma API
 */
async function fetchMarkets(params: Record<string, string | number | boolean> = {}): Promise<Market[]> {
    const url = new URL(`${GAMMA_API_BASE}/markets`);

    // Gamma API parameters
    if (params.tag) {
        url.searchParams.set('tag_id', '113'); // Common ID for Football/Soccer
    }

    Object.entries(params).forEach(([key, value]) => {
        if (key === 'tag') return; // Handled above
        url.searchParams.set(key, String(value));
    });

    try {
        console.log(`Fetching markets: ${url.toString()}`);
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Gamma API error: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
        console.error('Error fetching markets:', error);
        return [];
    }
}

/**
 * Get all football/soccer markets
 */
export async function getFootballMarkets(options: MarketFilters = {}): Promise<MarketCardData[]> {
    const { limit = 50, offset = 0, status = 'open' } = options;

    // Fetch markets with football search or tag
    // We try multiple approaches to ensure we get data
    const markets = await fetchMarkets({
        search: 'football',
        limit,
        offset,
        active: true,
        closed: status === 'closed',
    });

    // If still empty, try 'soccer'
    let results = markets;
    if (results.length === 0) {
        results = await fetchMarkets({
            search: 'soccer',
            limit,
            offset,
            active: true,
            closed: status === 'closed',
        });
    }

    // Combine and deduplicate
    const uniqueMarkets = Array.from(
        new Map(results.map(m => [m.conditionId, m])).values()
    );

    // Filter by additional criteria
    let filtered = uniqueMarkets;

    if (options.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(m =>
            m.question.toLowerCase().includes(searchLower) ||
            m.description?.toLowerCase().includes(searchLower) ||
            m.tags?.some(t => t.toLowerCase().includes(searchLower))
        );
    }

    if (options.league) {
        filtered = filtered.filter(m =>
            m.tags?.some(t => t.toLowerCase().includes(options.league!.toLowerCase())) ||
            m.question.toLowerCase().includes(options.league!.toLowerCase())
        );
    }

    // Sort
    filtered = sortMarkets(filtered, options.sort || 'volume');

    // Transform to card data
    return filtered.map(transformToCardData);
}

/**
 * Get featured/trending markets
 */
export async function getFeaturedMarkets(limit = 6): Promise<MarketCardData[]> {
    const marketsSelected = await getMarkets();

    // Filter for featured or high volume markets
    return marketsSelected
        .filter(m => !m.isClosed)
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
        .slice(0, limit);
}

/**
 * Get live/today markets
 */
export async function getLiveMarkets(): Promise<MarketCardData[]> {
    const marketsLive = await getMarkets({ limit: 100 });
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return marketsLive.filter(m => {
        const endDate = new Date(m.endDate);
        return endDate >= now && endDate <= tomorrow && !m.isClosed;
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
        // For Gamma, searching by condition_id is often more reliable
        const url = new URL(`${GAMMA_API_BASE}/markets`);
        url.searchParams.set('condition_id', conditionId);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Market not found: ${conditionId}`);
        }

        const data = await response.json();
        const market = Array.isArray(data) ? data[0] : data;

        if (!market) return null;
        return transformToCardData(market);
    } catch (error) {
        console.error('Error fetching market:', error);
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
function sortMarkets(markets: Market[], sortBy: string): Market[] {
    const sorted = [...markets];

    switch (sortBy) {
        case 'volume':
            return sorted.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
        case 'liquidity':
            return sorted.sort((a, b) => parseFloat(b.liquidity) - parseFloat(a.liquidity));
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'ending':
            return sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
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
 * Get user positions (mock for now, preparing for real integration)
 */
export async function getUserPositions(address: string) {
    console.log(`Fetching positions for ${address}`);
    // In a real implementation, we would query a DB or the Polymarket subgraph
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

// Mock data for development/demo purposes
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
        image: 'https://polymarket.com/images/market.png',
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
        image: 'https://polymarket.com/images/market.png',
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
        image: 'https://polymarket.com/images/market.png',
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
        image: 'https://polymarket.com/images/market.png',
        tags: ['football', 'la-liga', 'barcelona'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'la-liga',
        teams: ['barcelona'],
        clobTokenIds: ['barca-id'],
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
        image: 'https://polymarket.com/images/market.png',
        tags: ['football', 'bundesliga', 'bayern-munich'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'bundesliga',
        teams: ['bayern-munich'],
        clobTokenIds: ['bayern-id'],
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
        image: 'https://polymarket.com/images/market.png',
        tags: ['football', 'serie-a', 'inter-milan'],
        isClosed: false,
        isNew: false,
        isFeatured: false,
        league: 'serie-a',
        teams: ['inter-milan'],
        clobTokenIds: ['inter-id'],
        outcomePrices: ['0.58', '0.42']
    },
];

/**
 * Get markets (with fallback to mock data for development)
 */
export async function getMarkets(options: MarketFilters = {}): Promise<MarketCardData[]> {
    try {
        const markets = await getFootballMarkets(options);

        // If no markets found, return mock data for development
        if (markets.length === 0) {
            console.log('No markets from API, using mock data');

            // Apply similar filters to mock data to maintain UI consistency
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
