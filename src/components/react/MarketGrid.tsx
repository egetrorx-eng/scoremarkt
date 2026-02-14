/**
 * MarketGrid Component
 * ═══════════════════════════════════════════════════════════════
 * Grid display of market cards with loading and empty states.
 */

import React from 'react';
import type { MarketCardData } from '../../lib/polymarket/types';
import MarketCard from './MarketCard';

interface MarketGridProps {
    markets: MarketCardData[];
    loading?: boolean;
    emptyMessage?: string;
    columns?: 2 | 3 | 4;
}

export default function MarketGrid({
    markets,
    loading = false,
    emptyMessage = 'No markets found',
    columns = 3
}: MarketGridProps) {

    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    if (loading) {
        return (
            <div className={`grid gap-6 ${gridCols[columns]}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="h-4 bg-midnight-600 rounded w-24 mb-4"></div>
                        <div className="h-6 bg-midnight-600 rounded w-full mb-2"></div>
                        <div className="h-4 bg-midnight-600 rounded w-3/4 mb-6"></div>

                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 h-16 bg-midnight-600 rounded-xl"></div>
                            <div className="flex-1 h-16 bg-midnight-600 rounded-xl"></div>
                        </div>

                        <div className="h-4 bg-midnight-600 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (markets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-midnight-700 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">{emptyMessage}</h3>
                <p className="text-sm text-white/40">Try adjusting your filters or search terms</p>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${gridCols[columns]}`}>
            {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
            ))}
        </div>
    );
}
