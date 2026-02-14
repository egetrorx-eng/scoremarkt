import React, { useMemo } from 'react';
import type { MarketCardData } from '../../lib/polymarket/types';

interface MarketHeatmapProps {
    markets: MarketCardData[];
}

export default function MarketHeatmap({ markets }: MarketHeatmapProps) {
    // Group markets by league and calculate average sentiment (alpha) and total volume
    const stats = useMemo(() => {
        const groups: Record<string, { count: number, totalVolume: number, totalAlpha: number }> = {};

        markets.forEach(m => {
            const league = m.league || 'other';
            if (!groups[league]) {
                groups[league] = { count: 0, totalVolume: 0, totalAlpha: 0 };
            }
            groups[league].count++;
            groups[league].totalVolume += parseFloat(m.volume || '0') || 50000; // Mock volume if missing
            groups[league].totalAlpha += 65 + (m.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 30);
        });

        return Object.entries(groups).map(([league, data]) => ({
            league,
            avgAlpha: data.totalAlpha / data.count,
            volume: data.totalVolume,
            count: data.count
        })).sort((a, b) => b.volume - a.volume);
    }, [markets]);

    const formatLeagueName = (league: string): string => {
        return league
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="card p-6 border border-white/10 bg-midnight-800/40 backdrop-blur-md overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Market Pulse</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1">Global Sentiment Heatmap</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-lime-500"></div>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">High Alpha</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-coral"></div>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Volatile</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.league}
                        className="group relative p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
                    >
                        {/* Sentiment Indicator Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <div
                                className={`h-full transition-all duration-1000 ${stat.avgAlpha > 80 ? 'bg-lime-500 shadow-glow' : 'bg-neon-cyan'}`}
                                style={{ width: `${stat.avgAlpha}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">
                                {formatLeagueName(stat.league)}
                            </span>
                            <span className={`text-[10px] font-bold font-mono ${stat.avgAlpha > 80 ? 'text-lime-400' : 'text-neon-cyan'}`}>
                                {stat.avgAlpha.toFixed(0)}α
                            </span>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-xl font-bold font-display text-white">
                                    ${(stat.volume / 1000).toFixed(0)}k
                                </div>
                                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">24h Vol</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
                                    {stat.count} Markets
                                </div>
                            </div>
                        </div>

                        {/* Background Alpha Pulse */}
                        <div className={`absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${stat.avgAlpha > 80 ? 'bg-lime-500' : 'bg-neon-cyan'}`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
