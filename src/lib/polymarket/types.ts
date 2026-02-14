/**
 * Polymarket API Types
 * ═══════════════════════════════════════════════════════════════
 * TypeScript interfaces for Polymarket API responses.
 */

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
    // Computed fields
    spread?: number;
    resolutionSource?: string;
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
}

// ═══ Helper Functions ═══

export function formatVolume(volume: string | number): string {
    const num = typeof volume === 'string' ? parseFloat(volume) : volume;
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
    return `${(num * 100).toFixed(0)}%`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
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
    const { league, teams } = parseFootballTags(market.tags);

    const outcomes = Array.isArray(market.outcomes) ? market.outcomes : [];
    const outcomePrices = Array.isArray(market.outcomePrices) ? market.outcomePrices : [];

    return {
        id: market.conditionId,
        question: market.question,
        description: market.description,
        outcomes: outcomes.map((name, index) => ({
            name,
            price: parseFloat(outcomePrices[index] || '0'),
            priceFormatted: formatProbability(outcomePrices[index] || '0'),
        })),
        volume: market.volume,
        volumeFormatted: formatVolume(market.volume),
        liquidity: market.liquidity,
        endDate: market.endDate,
        endDateFormatted: formatDate(market.endDate),
        image: market.image,
        tags: market.tags,
        isClosed: market.closed,
        isNew: market.new,
        isFeatured: market.featured,
        league,
        teams,
        clobTokenIds: market.clobTokenIds,
        outcomePrices: market.outcomePrices,
    };
}
