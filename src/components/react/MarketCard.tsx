/**
 * MarketCard Component
 * ═══════════════════════════════════════════════════════════════
 * Displays a prediction market card with odds and quick actions.
 */

import React from 'react';
import type { MarketCardData } from '../../lib/polymarket/types';
import { useWatchlist } from '../../lib/hooks/useWatchlist';

interface MarketCardProps {
    market: MarketCardData;
    variant?: 'default' | 'compact' | 'featured';
}

// League badge colors
const leagueColors: Record<string, { bg: string; text: string; border: string }> = {
    'premier-league': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    'champions-league': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    'la-liga': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    'bundesliga': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    'serie-a': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    'ligue-1': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const formatLeagueName = (league: string): string => {
    return league
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function MarketCard({ market, variant = 'default' }: MarketCardProps) {
    const { isInWatchlist, toggleWatchlist } = useWatchlist();
    const isStarred = isInWatchlist(market.id);
    const leagueStyle = market.league ? leagueColors[market.league] || leagueColors['premier-league'] : null;

    const isBinary = market.outcomes.length === 2 &&
        (market.outcomes[0].name === 'Yes' || market.outcomes[0].name === 'No');

    return (
        <a
            href={`/market/${market.id}`}
            className={`
        group block relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-800/40 backdrop-blur-md transition-all duration-300 hover:bg-midnight-700/60 hover:border-lime-500/30 hover:shadow-glow/20 hover:-translate-y-1
        ${variant === 'featured' ? 'shadow-glow-sm border-lime-500/20' : ''}
      `}
        >
            {/* Glossy Overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="p-5 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {market.league && leagueStyle && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${leagueStyle.bg} ${leagueStyle.text} ${leagueStyle.border}`}>
                                    {formatLeagueName(market.league)}
                                </span>
                            )}
                            {market.isNew && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-500/10 text-lime-400 border border-lime-500/20 shadow-[0_0_10px_rgba(191,255,0,0.1)]">
                                    New
                                </span>
                            )}
                            {market.isFeatured && !market.isNew && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 shadow-[0_0_10px_rgba(255,184,0,0.1)]">
                                    Featured
                                </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-lime-500 text-midnight-900 shadow-glow-sm">
                                {65 + (market.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 30)}% Alpha
                            </span>
                        </div>

                        {/* Question */}
                        <h3 className="text-base font-bold font-display text-white group-hover:text-lime-400 transition-colors leading-snug line-clamp-2">
                            {market.question}
                        </h3>
                    </div>

                    {/* Watchlist Star Toggle */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWatchlist(market.id);
                        }}
                        className={`p-2 rounded-xl border transition-all duration-300 ${isStarred
                            ? 'bg-gold/10 border-gold/40 text-gold shadow-glow/10'
                            : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40 hover:border-white/10'
                            }`}
                        aria-label={isStarred ? "Remove from watchlist" : "Add to watchlist"}
                    >
                        <svg className={`w-4 h-4 ${isStarred ? 'fill-gold' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </button>
                </div>

                {/* Outcomes */}
                <div className="space-y-2 mb-5">
                    {isBinary ? (
                        // Binary market - show horizontal bars
                        <div className="flex gap-2">
                            {market.outcomes.map((outcome, index) => (
                                <div
                                    key={outcome.name}
                                    className={`
                                        flex-1 py-2.5 px-4 rounded-xl text-center transition-all border
                                        ${index === 0
                                            ? 'bg-profit/5 border-profit/20 hover:bg-profit/10'
                                            : 'bg-coral/5 border-coral/20 hover:bg-coral/10'
                                        }
                                    `}
                                >
                                    <div className={`text-lg font-bold font-mono ${index === 0 ? 'text-profit' : 'text-coral'}`}>
                                        {outcome.priceFormatted}
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{outcome.name}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Multi-outcome market - show list
                        <div className="space-y-1.5">
                            {market.outcomes.slice(0, 3).map((outcome, index) => (
                                <div
                                    key={outcome.name}
                                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <span className="text-sm font-medium text-white/80 truncate mr-2">{outcome.name}</span>
                                    <span className="text-sm font-bold font-mono text-lime-400">
                                        {outcome.priceFormatted}
                                    </span>
                                </div>
                            ))}
                            {market.outcomes.length > 3 && (
                                <div className="text-[10px] font-bold text-white/30 text-center uppercase tracking-widest pt-1">
                                    +{market.outcomes.length - 3} more outcomes
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] border-t border-white/10 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-white/50 font-bold font-mono uppercase tracking-tighter">{market.volumeFormatted} Volume</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-white/50 font-medium uppercase tracking-tighter">{market.endDateFormatted}</span>
                        </div>
                    </div>

                    <div className="text-lime-500 group-hover:text-lime-400 transition-all duration-300 group-hover:translate-x-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </a>
    );
}
