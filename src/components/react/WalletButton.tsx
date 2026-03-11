/**
 * WalletButton Component
 * ═══════════════════════════════════════════════════════════════
 * Wallet connection button with dropdown menu.
 */

import { useState } from 'react';
import { useSafePrivy } from './PrivyProvider';

interface WalletButtonProps {
    className?: string;
}

export default function WalletButton({ className = '' }: WalletButtonProps) {
    const { login, logout, authenticated, user } = useSafePrivy();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get display address from Privy user
    const address = user?.wallet?.address;
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
    const balance = '0.00'; // Real balance fetching would be a separate step

    if (authenticated && user) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-500/30 backdrop-blur-md transition-all duration-300 group shadow-glow-sm hover:shadow-glow/10 ${className}`}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-profit shadow-glow animate-pulse" />
                    <span className="font-mono text-xs font-black tracking-tighter text-white/90">{shortAddress}</span>
                    <svg className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-3 w-80 z-50 origin-top-right">
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-midnight-900/95 backdrop-blur-xl shadow-2xl p-6">
                                {/* Ambient Background Glow */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl" />

                                {/* Header: Balance & Account */}
                                <div className="relative mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Total Balance</span>
                                        <span className="px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-400 text-[10px] font-bold">POLYGON</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black font-mono tracking-tighter text-white">${balance}</span>
                                        <span className="text-sm font-bold text-white/30 uppercase tracking-widest leading-none">USDC</span>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 group cursor-pointer hover:bg-white/10 transition-all duration-300">
                                    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">Your Terminal ID</div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-white/90 truncate mr-4">{address}</span>
                                        <svg className="w-4 h-4 text-white/20 group-hover:text-lime-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2 mb-6">
                                    <a href="/portfolio" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-lime-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Portfolio</span>
                                    </a>
                                    <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group text-left">
                                        <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-lime-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">Add Funds</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-xs font-black uppercase tracking-[0.2em] hover:bg-loss/10 hover:border-loss/30 hover:text-loss transition-all duration-300"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                id="wallet-connect-btn"
                onClick={login}
                className={`group relative overflow-hidden px-8 py-3 rounded-2xl bg-lime-500 font-display font-black text-sm text-midnight-900 transition-all duration-500 hover:scale-[1.02] hover:shadow-glow active:scale-95 ${className}`}
            >
                {/* Shine Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />

                <div className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="tracking-tight">CONNECT</span>
                </div>
            </button>
        </div>
    );
}
