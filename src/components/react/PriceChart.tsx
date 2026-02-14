/**
 * PriceChart Component
 * ═══════════════════════════════════════════════════════════════
 * Renders a premium, animated price history chart.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useClobWebSocket } from '@/lib/hooks/useClobWebSocket';

interface PricePoint {
    time: string;
    price: number;
}

interface PriceChartProps {
    clobTokenId?: string;
    initialPrice?: number;
    data?: PricePoint[];
    color?: string;
}

export default function PriceChart({ clobTokenId, initialPrice = 0.5, data, color = '#00F5FF' }: PriceChartProps) {
    const { ticker } = useClobWebSocket(clobTokenId ? [clobTokenId] : []);
    const [liveHistory, setLiveHistory] = useState<PricePoint[]>([]);

    // Generate initial history
    const initialHistory = useMemo(() => {
        if (data) return data;
        let current = initialPrice;
        return Array.from({ length: 12 }, (_, i) => {
            current = Math.max(0.1, Math.min(0.9, current + (Math.random() - 0.5) * 0.05));
            return {
                time: `${i}:00`,
                price: current
            };
        });
    }, [data, initialPrice]);

    useEffect(() => {
        setLiveHistory(initialHistory);
    }, [initialHistory]);

    // Handle incoming ticker updates
    useEffect(() => {
        if (clobTokenId && ticker[clobTokenId]) {
            const newPrice = parseFloat(ticker[clobTokenId].price);
            setLiveHistory(prev => {
                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const newPoint = { time: timeStr, price: newPrice };
                return [...prev.slice(-14), newPoint]; // Keep last 15 points
            });
        }
    }, [ticker, clobTokenId]);

    const chartData = liveHistory;

    // Convert data points to SVG path
    const pathData = useMemo(() => {
        if (chartData.length < 2) return '';

        const width = 400;
        const height = 200;
        const padding = 20;

        const xStep = (width - padding * 2) / (chartData.length - 1);

        return chartData.map((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d.price * (height - padding * 2));
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ');
    }, [chartData]);

    const areaPathData = useMemo(() => {
        if (!pathData) return '';
        return `${pathData} L380,180 L20,180 Z`;
    }, [pathData]);

    return (
        <div className="card p-8 border border-white/10 bg-midnight-800/40 backdrop-blur-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold font-display text-white border-l-4 border-lime-500 pl-4">Market History</h3>
                <div className="flex bg-midnight-900/50 rounded-lg p-1 border border-white/5">
                    {['1h', '1d', '1w'].map(t => (
                        <button
                            key={t}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${t === '1h' ? 'text-neon-cyan bg-white/5 rounded' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-72 bg-midnight-900/30 rounded-2xl relative overflow-hidden group border border-white/5">
                {/* SVG Chart */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                        d={areaPathData}
                        fill="url(#chartGradient)"
                        className="animate-in fade-in duration-1000"
                    />

                    {/* Line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_8px_rgba(0,245,255,0.3)] animate-in slide-in-from-left duration-1000"
                    />

                    {/* Current Price Point */}
                    {chartData.length > 0 && (
                        <g className="animate-pulse">
                            <circle cx="380" cy={200 - 20 - (chartData[chartData.length - 1]?.price || 0) * 160} r="4" fill={color} />
                            <circle cx="380" cy={200 - 20 - (chartData[chartData.length - 1]?.price || 0) * 160} r="8" fill={color} className="opacity-20" />
                        </g>
                    )}
                </svg>

                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-[0.03]">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-white"></div>
                    ))}
                </div>

                {/* Vertical Cursor Mockup (shows on hover) */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-midnight-900 border border-white/20 px-2 py-1 rounded text-[9px] font-mono text-white/80 whitespace-nowrap">
                        $0.62 • 14:00
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Price Probability</span>
                </div>
            </div>
        </div>
    );
}
