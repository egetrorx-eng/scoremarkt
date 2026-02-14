/**
 * PerformanceChart Component
 * ═══════════════════════════════════════════════════════════════
 * Visualizes portfolio value history.
 */

import React, { useMemo } from 'react';
import type { HistoryPoint } from '@/lib/hooks/usePortfolioStore';

interface PerformanceChartProps {
    data: HistoryPoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
    const isProfitable = useMemo(() => {
        if (data.length < 2) return true;
        return data[data.length - 1].value >= data[0].value;
    }, [data]);

    const color = isProfitable ? '#4ade80' : '#f87171'; // Green-400 or Red-400

    // Coordinate transformations
    const chartContent = useMemo(() => {
        if (data.length < 2) return null;

        const width = 800;
        const height = 200;
        const padding = 40;

        const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
        const minVal = Math.min(...data.map(d => d.value)) * 0.9;
        const range = maxVal - minVal;

        const xStep = (width - padding * 2) / (data.length - 1);

        const points = data.map((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - ((d.value - minVal) / range * (height - padding * 2));
            return { x, y };
        });

        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        const areaData = `${pathData} L${points[points.length - 1].x},${height - padding} L${points[0].x},${height - padding} Z`;

        return { pathData, areaData, lastPoint: points[points.length - 1] };
    }, [data]);

    if (!chartContent) return null;

    return (
        <div className="card p-8 border border-white/10 bg-midnight-800/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-1">Performance Terminal</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">30-Day Net Worth History</p>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${isProfitable ? 'bg-profit/10 text-profit border border-profit/20' : 'bg-coral/10 text-coral border border-coral/20'}`}>
                        {isProfitable ? 'TRENDING UP' : 'MARKET VOLATILITY'}
                    </span>
                </div>
            </div>

            <div className="h-48 relative overflow-visible group">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="performGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <path d={chartContent.areaData} fill="url(#performGradient)" className="animate-in fade-in duration-1000" />
                    <path d={chartContent.pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-in slide-in-from-left duration-1000" />

                    {/* Hotpoint */}
                    <g className="animate-pulse">
                        <circle cx={chartContent.lastPoint.x} cy={chartContent.lastPoint.y} r="4" fill={color} />
                        <circle cx={chartContent.lastPoint.x} cy={chartContent.lastPoint.y} r="10" fill={color} className="opacity-20" />
                    </g>
                </svg>

                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-[0.03]">
                    {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-white"></div>
                    ))}
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                <span>{new Date(data[0].timestamp).toLocaleDateString()}</span>
                <span>Active Performance Sync</span>
                <span>{new Date(data[data.length - 1].timestamp).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
