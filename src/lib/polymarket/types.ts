/**
 * Polymarket API Types
 * ═══════════════════════════════════════════════════════════════
 * TypeScript interfaces for Polymarket API responses.
 */

// ═══ Event Types (from Gamma /events endpoint) ═══

export interface GammaEvent {
    id: string;
    ticker: string;
    slug: string;
    title: string;
    description: string;
    startDate: string;
    creationDate: string;
    endDate: string;
    image: string;
    icon: string;
    active: boolean;
    closed: boolean;
    archived: boolean;
    new: boolean;
    featured: boolean;
    restricted: boolean;
    liquidity: number;
    volume: number;
    openInterest: number;
    category: string;
    subcategory: string;
    markets: Market[];
    tags?: GammaTag[];
    negRisk?: boolean;
    commentCount?: number;
}

export interface GammaTag {
    id: string;
    label: string;
    slug: string;
    forceShow?: boolean;
}

// ═══ Market Types ═══

export interface Market {
    conditionId: string;
    questionId: string;
    question: string;
    description: string;
    outcomes: string[];
    outcomePrices: string[];
    clobTokenIds: string[];
    volume: string;
    volumeNum: number;
    liquidity: string;
    liquidityNum: number;
    endDate: string;
    image: string;
    icon: string;
    tags: string[];
    closed: boolean;
    archived: boolean;
    new: boolean;
    featured: boolean;
    restricted: boolean;
    groupItemTitle?: string;
    groupItemThreshold?: string;
    questionID?: string;
    enableOrderBook: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    spread?: number;
    resolutionSource?: string;
    // Event-level data propagated to market
    eventSlug?: string;
    eventTitle?: string;
}

export interface MarketGroup {
    id: string;
    slug: string;
    title: string;
    description: string;
    markets: Market[];
}

// ═══ Order Book Types ═══

export interface OrderBookLevel {
    price: string;
    size: string;
}

export interface OrderBook {
    market: string;
    asset_id: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    timestamp: string;
    hash: string;
}

// ═══ Trade Types ═══

export interface Trade {
    id: string;
    taker_order_id: string;
    market: string;
    asset_id: string;
    side: 'BUY' | 'SELL';
    size: string;
    fee_rate_bps: string;
    price: string;
    status: string;
    match_time: string;
    last_update: string;
    outcome: string;
    bucket_index: number;
    owner: string;
    maker_address: string;
    transaction_hash: string;
    trader_side: 'TAKER' | 'MAKER';
}

// ═══ Position Types ═══

export interface Position {
    asset: string;
    conditionId: string;
    market: string;
    outcome: string;
    outcomeIndex: number;
    size: string;
    avgPrice: string;
    currentPrice: string;
    value: string;
    pnl: string;
    pnlPercent: string;
    realizedPnl: string;
    unrealizedPnl: string;
}

export interface Portfolio {
    positions: Position[];
    totalValue: string;
    totalPnl: string;
    totalPnlPercent: string;
}

// ═══ Order Types ═══

export interface Order {
    id: string;
    market: string;
    asset_id: string;
    side: 'BUY' | 'SELL';
    original_size: string;
    size_matched: string;
    price: string;
    outcome: string;
    status: 'LIVE' | 'MATCHED' | 'CANCELLED';
    expiration: string;
    created_at: string;
    owner: string;
    order_type: 'GTC' | 'GTD' | 'FOK';
    associate_trades: Trade[];
}

// ═══ API Response Types ═══

export interface MarketsResponse {
    data: Market[];
    next_cursor?: string;
    limit: number;
    count: number;
}

export interface TradesResponse {
    data: Trade[];
    next_cursor?: string;
}

export interface MarketFilters {
    league?: string;
    type?: 'match' | 'tournament' | 'player' | 'all';
    status?: 'open' | 'closed' | 'all';
    timeframe?: 'live' | 'today' | 'week' | 'month' | 'all';
    search?: string;
    sort?: 'volume' | 'liquidity' | 'newest' | 'ending';
    limit?: number;
    offset?: number;
}

// ═══ UI Types ═══

export interface MarketCardData {
    id: string;
    question: string;
    description: string;
    outcomes: {
        name: string;
        price: number;
        priceFormatted: string;
    }[];
    volume: string;
    volumeFormatted: string;
    liquidity: string;
    endDate: string;
    endDateFormatted: string;
    image: string;
    tags: string[];
    isClosed: boolean;
    isNew: boolean;
    isFeatured: boolean;
    league?: string;
    teams?: string[];
    clobTokenIds?: string[];
    outcomePrices?: string[];
    eventSlug?: string;
    eventTitle?: string;
}

// ═══ Helper Functions ═══

export function formatVolume(volume: string | number): string {
    const num = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (isNaN(num)) return '$0';
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
}

export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `${(num * 100).toFixed(0)}¢`;
}

export function formatProbability(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '0%';
    return `${(num * 100).toFixed(0)}%`;
}

export function formatDate(dateString: string): string {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBD';
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'Ended';
    } else if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Tomorrow';
    } else if (diffDays <= 7) {
        return `${diffDays} days`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Football league detection patterns
const LEAGUE_PATTERNS: Record<string, string[]> = {
    'premier-league': ['premier league', 'epl', 'english premier'],
    'champions-league': ['champions league', 'ucl', 'uefa champions'],
    'la-liga': ['la liga', 'laliga', 'spanish league'],
    'bundesliga': ['bundesliga', 'german league'],
    'serie-a': ['serie a', 'italian league'],
    'ligue-1': ['ligue 1', 'french league'],
    'europa-league': ['europa league', 'uel'],
    'world-cup': ['world cup', 'fifa world'],
    'euros': ['euro 2024', 'euro 2028', 'european championship', 'euros'],
    'copa-america': ['copa america', 'copa américa'],
    'mls': ['mls', 'major league soccer'],
    'conference-league': ['conference league', 'uecl'],
};

export function detectLeague(text: string, tags?: string[]): string | undefined {
    const searchText = (text || '').toLowerCase();
    const tagText = (tags || []).join(' ').toLowerCase();
    const combined = `${searchText} ${tagText}`;

    for (const [league, patterns] of Object.entries(LEAGUE_PATTERNS)) {
        for (const pattern of patterns) {
            if (combined.includes(pattern)) {
                return league;
            }
        }
    }
    return undefined;
}

// Known football team names for detection
const FOOTBALL_TEAMS = [
    'manchester city', 'manchester united', 'man city', 'man utd',
    'liverpool', 'arsenal', 'chelsea', 'tottenham', 'spurs',
    'newcastle', 'west ham', 'aston villa', 'brighton', 'wolves',
    'crystal palace', 'everton', 'nottingham forest', 'fulham', 'bournemouth',
    'real madrid', 'barcelona', 'atletico madrid', 'athletic bilbao', 'sevilla',
    'bayern munich', 'bayern', 'dortmund', 'borussia', 'leverkusen', 'leipzig',
    'juventus', 'inter milan', 'ac milan', 'napoli', 'roma', 'lazio', 'atalanta',
    'psg', 'paris saint', 'marseille', 'lyon', 'monaco', 'lille',
    'benfica', 'porto', 'sporting cp', 'ajax', 'feyenoord', 'psv',
    'celtic', 'rangers', 'galatasaray', 'fenerbahce', 'besiktas',
];

export function detectTeams(text: string): string[] {
    const lower = (text || '').toLowerCase();
    return FOOTBALL_TEAMS.filter(team => lower.includes(team));
}

export function isFootballRelated(text: string, tags?: string[]): boolean {
    const combined = `${(text || '').toLowerCase()} ${(tags || []).join(' ').toLowerCase()}`;

    // Check for football/soccer keywords
    const footballKeywords = [
        'football', 'soccer', 'premier league', 'champions league',
        'la liga', 'bundesliga', 'serie a', 'ligue 1', 'europa league',
        'world cup', 'euros', 'copa america', 'mls', 'uefa', 'fifa',
        'goal', 'penalty', 'match', 'fixture',
    ];

    if (footballKeywords.some(kw => combined.includes(kw))) return true;

    // Check for known team names
    if (FOOTBALL_TEAMS.some(team => combined.includes(team))) return true;

    return false;
}

export function parseFootballTags(tags: string[]): { league?: string; teams: string[] } {
    if (!tags || !Array.isArray(tags)) {
        return { teams: [] };
    }

    const leaguePatterns = [
        'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1',
        'champions-league', 'europa-league', 'world-cup', 'euros'
    ];

    const league = tags.find(tag => tag && leaguePatterns.some(pattern => tag.toLowerCase().includes(pattern)));
    const teams = tags.filter(tag => tag && !leaguePatterns.some(pattern => tag.toLowerCase().includes(pattern)));

    return { league, teams };
}

export function transformToCardData(market: Market): MarketCardData {
    const { league: tagLeague, teams: tagTeams } = parseFootballTags(market.tags || []);
    const league = tagLeague || detectLeague(market.question, market.tags);
    const teams = tagTeams.length > 0 ? tagTeams : detectTeams(market.question);

    const outcomes = Array.isArray(market.outcomes) ? market.outcomes : [];
    const outcomePrices = Array.isArray(market.outcomePrices) ? market.outcomePrices : [];

    return {
        id: market.conditionId,
        question: market.question,
        description: market.description || '',
        outcomes: outcomes.map((name, index) => ({
            name: typeof name === 'string' ? name : String(name),
            price: parseFloat(outcomePrices[index] || '0'),
            priceFormatted: formatProbability(outcomePrices[index] || '0'),
        })),
        volume: market.volume || '0',
        volumeFormatted: formatVolume(market.volume || '0'),
        liquidity: market.liquidity || '0',
        endDate: market.endDate || '',
        endDateFormatted: formatDate(market.endDate || ''),
        image: market.image || '',
        tags: market.tags || [],
        isClosed: !!market.closed,
        isNew: !!market.new,
        isFeatured: !!market.featured,
        league,
        teams,
        clobTokenIds: market.clobTokenIds,
        outcomePrices: market.outcomePrices,
        eventSlug: market.eventSlug,
        eventTitle: market.eventTitle,
    };
}

export function transformEventToCardData(event: GammaEvent): MarketCardData[] {
    if (!event.markets || event.markets.length === 0) {
        // If no nested markets, create one from the event itself
        return [{
            id: event.id,
            question: event.title,
            description: event.description || '',
            outcomes: [],
            volume: String(event.volume || 0),
            volumeFormatted: formatVolume(event.volume || 0),
            liquidity: String(event.liquidity || 0),
            endDate: event.endDate || '',
            endDateFormatted: formatDate(event.endDate || ''),
            image: event.image || event.icon || '',
            tags: (event.tags || []).map(t => t.slug || t.label),
            isClosed: !!event.closed,
            isNew: !!event.new,
            isFeatured: !!event.featured,
            league: detectLeague(event.title, (event.tags || []).map(t => t.slug || t.label)),
            teams: detectTeams(event.title),
            eventSlug: event.slug,
            eventTitle: event.title,
        }];
    }

    // Transform each market within the event
    return event.markets.map(market => {
        const tagSlugs = (event.tags || []).map(t => t.slug || t.label);
        const enrichedMarket: Market = {
            ...market,
            tags: [...(market.tags || []), ...tagSlugs],
            eventSlug: event.slug,
            eventTitle: event.title,
            image: market.image || event.image || event.icon || '',
        };
        return transformToCardData(enrichedMarket);
    });
}
