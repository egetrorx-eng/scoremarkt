import React, { useMemo, useState } from 'react';
import TraderIntelligence from './TraderIntelligence';

interface LeaderboardEntry {
    rank: number;
    name: string;
    pnl: number;
    winRate: number;
    trades: number;
}

export default function Leaderboard() {
    const [selectedTrader, setSelectedTrader] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectTrader = (trader: any) => {
        // Enriched mock convictions for the trader
        const enrichedTrader = {
            ...trader,
            convictions: [
                { marketId: 'm-1', question: 'Will Arsenal win the Premier League?', outcome: 'Yes', shares: 450, avgPrice: 0.62 },
                { marketId: 'm-2', question: 'Will Real Madrid reach the UCL Final?', outcome: 'Yes', shares: 800, avgPrice: 0.45 },
                { marketId: 'm-3', question: 'Total Goals in El Clasico > 2.5?', outcome: 'No', shares: 120, avgPrice: 0.78 }
            ]
        };
        setSelectedTrader(enrichedTrader);
        setIsModalOpen(true);
    };

    const pioneers = useMemo(() => {
        // Mock data for top traders
        return [
            { rank: 1, name: 'AlphaTerminal_01', pnl: 4520.50, winRate: 72, trades: 124 },
            { rank: 2, name: 'ScoreSage_X', pnl: 3840.20, winRate: 68, trades: 89 },
            { rank: 3, name: 'LiquidityHunter', pnl: 2950.00, winRate: 61, trades: 210 },
            { rank: 4, name: 'MarketMaven', pnl: 2100.80, winRate: 59, trades: 45 },
            { rank: 5, name: 'BullishBrave', pnl: 1850.40, winRate: 55, trades: 67 },
            { rank: 6, name: 'TrendSeeker', pnl: 1620.15, winRate: 54, trades: 112 },
            { rank: 7, name: 'DeltaNeutral', pnl: 1450.00, winRate: 52, trades: 56 },
            { rank: 8, name: 'GammaGal', pnl: 1210.30, winRate: 50, trades: 34 },
            { rank: 9, name: 'WhaleWatcher', pnl: 980.50, winRate: 48, trades: 189 },
            { rank: 10, name: 'Pioneer_TRD', pnl: 850.00, winRate: 47, trades: 23 }
        ];
    }, []);

    return (
        <div className="card p-8 border border-white/10 bg-midnight-800/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold font-display text-white border-l-4 border-lime-500 pl-4">Alpha Leaderboard</h3>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Top Simulation Analysts</span>
            </div>

            <div className="space-y-4">
                {pioneers.map((entry) => (
                    <div
                        key={entry.rank}
                        onClick={() => handleSelectTrader(entry)}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-lime-500/30 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                            ${entry.rank === 1 ? 'bg-gold/20 text-gold border border-gold/30' :
                                entry.rank === 2 ? 'bg-silver/20 text-silver border border-silver/30' :
                                    entry.rank === 3 ? 'bg-bronze/20 text-bronze border border-bronze/30' :
                                        'bg-white/5 text-white/40'}`}>
                            #{entry.rank}
                        </div>

                        <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors">{entry.name}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{entry.trades} Trades • {entry.winRate}% Win Rate</div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-black text-profit font-mono">+${entry.pnl.toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Profit</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                <button className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors">
                    View Full Rankings →
                </button>
            </div>

            <TraderIntelligence
                trader={selectedTrader}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
