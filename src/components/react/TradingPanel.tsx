/**
 * TradingPanel Component
 * ═══════════════════════════════════════════════════════════════
 * Trading interface for placing orders on a market.
 */

import React, { useState, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { MarketCardData } from '../../lib/polymarket/types';
import { usePortfolioStore } from '../../lib/hooks/usePortfolioStore';

interface TradingPanelProps {
    market: MarketCardData;
}

type OrderSide = 'BUY' | 'SELL';
type OrderType = 'MARKET' | 'LIMIT';

export default function TradingPanel({ market }: TradingPanelProps) {
    const { authenticated: isConnected, login: handleConnect } = usePrivy();
    const { balance, executeTrade, addLimitOrder, ready: storeReady } = usePortfolioStore();
    const [side, setSide] = useState<OrderSide>('BUY');
    const [orderType, setOrderType] = useState<OrderType>('MARKET');
    const [selectedOutcome, setSelectedOutcome] = useState(0);
    const [amount, setAmount] = useState('');
    const [limitPrice, setLimitPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const outcomes = market.outcomes;
    const currentPrice = outcomes[selectedOutcome]?.price || 0;

    // Handle Mirror Trading parameters from URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const mirrorOutcome = params.get('mirror');
        const mirrorShares = params.get('shares');

        if (mirrorOutcome) {
            const outcomeIndex = outcomes.findIndex(o => o.name.toLowerCase() === mirrorOutcome.toLowerCase());
            if (outcomeIndex > -1) {
                setSelectedOutcome(outcomeIndex);
            }
        }

        if (mirrorShares) {
            // For Mirror Trading, we populate the amount field. 
            // If buying, amount is usually USDC. If selling, it's shares.
            // Based on the 'mirror' logic in TraderIntelligence, we use shares as the amount.
            setAmount(mirrorShares);
        }
    }, [outcomes]);

    // Calculate shares and potential payout
    const calculations = useMemo(() => {
        const amountNum = parseFloat(amount) || 0;
        const executionPrice = orderType === 'MARKET' ? currentPrice : (parseFloat(limitPrice) / 100);

        if (amountNum === 0 || (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0))) {
            return { shares: 0, potentialPayout: 0, potentialProfit: 0 };
        }

        if (side === 'BUY') {
            // Buying: amount / price = shares
            const shares = amountNum / (executionPrice || 0.01);
            const potentialPayout = shares; // Each share worth $1 if wins
            const potentialProfit = potentialPayout - amountNum;
            return { shares, potentialPayout, potentialProfit };
        } else {
            // Selling: amount in shares
            const shares = amountNum;
            const proceeds = shares * (executionPrice || 0.01);
            return { shares, potentialPayout: proceeds, potentialProfit: proceeds };
        }
    }, [amount, currentPrice, side, orderType, limitPrice]);

    const handleTrade = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (orderType === 'MARKET') {
                await executeTrade({
                    marketId: market.id,
                    marketQuestion: market.question,
                    side,
                    outcome: outcomes[selectedOutcome].name,
                    shares: side === 'BUY' ? calculations.shares : parseFloat(amount),
                    price: currentPrice,
                    endDate: market.endDate,
                    outcomeIndex: selectedOutcome
                } as any);
                alert('Simulation Successful: Trade recorded in your local portfolio.');
            } else {
                addLimitOrder({
                    marketId: market.id,
                    marketQuestion: market.question,
                    side,
                    outcome: outcomes[selectedOutcome].name,
                    shares: side === 'BUY' ? calculations.shares : parseFloat(amount),
                    limitPrice: parseFloat(limitPrice) / 100,
                });
                alert('Limit Order Placed: Execution pending price hit.');
            }
            setAmount('');
            setLimitPrice('');
        } catch (err: any) {
            setError(err.message || 'Trade failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBinary = outcomes.length === 2 &&
        (outcomes[0].name === 'Yes' || outcomes[0].name === 'No');

    return (
        <div className="card border border-white/10 bg-midnight-800/40 backdrop-blur-md p-6 shadow-elevated relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${side === 'BUY' ? 'bg-profit' : 'bg-coral'}`}></div>

            {/* Virtual Balance Header */}
            {isConnected && (
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Simulation Balance</span>
                        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mirror') && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                                <span className="text-[8px] font-black text-neon-cyan uppercase tracking-widest">Mirror Mode Active</span>
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-mono font-bold text-lime-400 bg-lime-400/10 px-2 py-1 rounded-lg">
                        ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                    </span>
                </div>
            )}

            {/* Buy/Sell & Order Type Tabs */}
            <div className="space-y-4 mb-8 relative z-10">
                <div className="flex bg-midnight-900/50 rounded-2xl p-1.5 border border-white/5">
                    <button
                        onClick={() => { setSide('BUY'); setError(null); }}
                        className={`flex-1 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${side === 'BUY'
                            ? 'bg-profit text-midnight-900 shadow-glow/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => { setSide('SELL'); setError(null); }}
                        className={`flex-1 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${side === 'SELL'
                            ? 'bg-coral text-white shadow-glow/20'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        Sell
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setOrderType('MARKET')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${orderType === 'MARKET' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/30 hover:text-white/50'}`}
                    >
                        Market
                    </button>
                    <button
                        onClick={() => setOrderType('LIMIT')}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${orderType === 'LIMIT' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/30 hover:text-white/50'}`}
                    >
                        Limit
                    </button>
                </div>
            </div>

            {/* Outcome Selection */}
            <div className="mb-8 relative z-10">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">Select Outcome</label>
                <div className={`grid gap-3 ${isBinary ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {outcomes.map((outcome, index) => {
                        const isSelected = selectedOutcome === index;

                        return (
                            <button
                                key={outcome.name}
                                onClick={() => setSelectedOutcome(index)}
                                className={`group/btn p-4 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden ${isSelected
                                    ? 'bg-lime-500/10 border-lime-500/40 shadow-glow/10'
                                    : 'bg-white/5 border-white/5 text-white/50 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-lime-400' : 'text-white/40 group-hover/btn:text-white/60'}`}>
                                    {outcome.name}
                                </div>
                                <div className={`text-xl font-bold font-mono mt-1 transition-colors ${isSelected ? 'text-white' : 'text-white/60 group-hover/btn:text-white'}`}>
                                    {outcome.priceFormatted}
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-2 h-2 rounded-full bg-lime-500 shadow-glow"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8 relative z-10">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">
                    {side === 'BUY' ? 'Investment (USDC)' : 'Shares To Sell'}
                </label>
                <div className="relative group/input">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); setError(null); }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-midnight-900/50 border border-white/10 rounded-2xl px-5 py-4 font-mono text-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500/50 transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-white/20 group-focus-within/input:text-lime-500 transition-colors">
                        {side === 'BUY' ? 'USDC' : 'SHARES'}
                    </div>
                </div>

                {orderType === 'LIMIT' && (
                    <div className="mt-4">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">Limit Price (¢)</label>
                        <div className="relative group/input">
                            <input
                                type="number"
                                value={limitPrice}
                                onChange={(e) => { setLimitPrice(e.target.value); setError(null); }}
                                placeholder="0"
                                min="1"
                                max="99"
                                className="w-full bg-midnight-900/50 border border-white/10 rounded-2xl px-5 py-4 font-mono text-2xl text-gold placeholder:text-gold/10 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-gold/20 group-focus-within/input:text-gold transition-colors">
                                CENTS
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Amount Buttons */}
                {side === 'BUY' && (
                    <div className="flex gap-2 mt-4">
                        {[10, 25, 50, 100].map((val) => (
                            <button
                                key={val}
                                onClick={() => { setAmount(String(val)); setError(null); }}
                                className="flex-1 py-2 text-[11px] font-bold rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/5 transition-all duration-300"
                            >
                                ${val}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/20 text-coral text-[11px] font-bold uppercase tracking-wider text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Calculations */}
            {parseFloat(amount) > 0 && (
                <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-medium uppercase tracking-wider">
                            {side === 'BUY' ? 'Estimated Shares' : 'Total Proceeds'}
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                            {side === 'BUY'
                                ? `${calculations.shares.toFixed(2)} shares`
                                : `$${calculations.potentialPayout.toFixed(2)}`
                            }
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-medium uppercase tracking-wider">Avg. Price</span>
                        <span className="font-mono font-bold text-white text-sm">
                            {(currentPrice * 100).toFixed(0)}¢
                        </span>
                    </div>

                    {side === 'BUY' && (
                        <>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Potential Payout</span>
                                <span className="font-mono font-bold text-white text-lg">
                                    ${calculations.potentialPayout.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Expected Profit</span>
                                <div className="text-right">
                                    <div className={`font-mono font-bold text-lg ${calculations.potentialProfit > 0 ? 'text-profit' : 'text-white'
                                        }`}>
                                        +${calculations.potentialProfit.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] font-bold text-profit uppercase tracking-widest">
                                        {((calculations.potentialProfit / parseFloat(amount)) * 100).toFixed(0)}% ROI
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Action Button */}
            <div className="relative z-10">
                {isConnected ? (
                    <button
                        onClick={handleTrade}
                        disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-glow-sm hover:shadow-glow-lg active:scale-[0.98] ${side === 'BUY'
                            ? 'bg-profit hover:bg-profit/90 text-midnight-900 disabled:bg-profit/20 disabled:text-midnight-900/30'
                            : 'bg-coral hover:bg-coral/90 text-white disabled:bg-coral/20 disabled:text-white/30'
                            } disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3`}
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-midnight-900/20 border-t-midnight-900 rounded-full animate-spin" />
                        ) : (
                            `Place ${side} Order`
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="w-full bg-gradient-to-r from-lime-500 to-lime-400 hover:from-lime-400 hover:to-lime-500 text-midnight-900 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-glow-sm hover:shadow-glow-lg active:scale-[0.98]"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] font-bold text-white/20 text-center mt-6 leading-relaxed uppercase tracking-tighter relative z-10">
                Market data synced with Polymarket (Polygon)
                <br />
                Trade at your own risk.
            </p>
        </div>
    );
}
