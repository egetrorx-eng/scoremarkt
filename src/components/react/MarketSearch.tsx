import React, { useState, useEffect, useRef } from 'react';

interface MarketSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function MarketSearch({ onSearch, placeholder = "Search markets, leagues, or teams..." }: MarketSearchProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Command/Ctrl + K to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    return (
        <div className="relative group w-full max-w-2xl">
            {/* Animated background glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500/20 to-neon-cyan/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>

            <div className="relative flex items-center">
                <div className="absolute left-5 text-white/20 transition-colors group-focus-within:text-lime-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-midnight-900/80 border border-white/10 rounded-2xl pl-14 pr-24 py-5 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-xl transition-all"
                />

                <div className="absolute right-5 flex items-center gap-2 pointer-events-none">
                    <div className="flex items-center gap-1 px-1.5 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <span className="text-[12px] leading-none">⌘</span>
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Hint for results */}
            {query && (
                <div className="absolute top-full left-0 w-full mt-2 p-3 rounded-xl bg-midnight-800/90 border border-white/10 backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">
                        Filtering for <span className="text-lime-400">"{query}"</span>
                    </p>
                </div>
            )}
        </div>
    );
}
