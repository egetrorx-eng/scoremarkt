'use client';

import { PrivyProvider, usePrivy as useRealPrivy } from '@privy-io/react-auth';
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// SafePrivy Context
// Provides unified auth state that works both with real Privy AND in demo mode.
// All app components should import useSafePrivy / useSafeLogin from this file
// instead of importing directly from @privy-io/react-auth.
// ---------------------------------------------------------------------------

export interface SafePrivyUser {
    id: string;
    wallet?: { address: string };
    email?: { address: string };
    google?: { name: string };
}

export interface SafePrivyContextValue {
    authenticated: boolean;
    ready: boolean;
    user: SafePrivyUser | null;
    login: () => void;
    logout: () => void;
}

const SafePrivyContext = createContext<SafePrivyContextValue>({
    authenticated: false,
    ready: true,
    user: null,
    login: () => {},
    logout: () => {},
});

/** Use this instead of usePrivy() in all components */
export function useSafePrivy(): SafePrivyContextValue {
    return useContext(SafePrivyContext);
}

/** Use this instead of useLogin() in all components */
export function useSafeLogin(opts?: {
    onComplete?: (params: { user: SafePrivyUser; isNewUser: boolean; wasAlreadyAuthenticated: boolean }) => void;
}) {
    const ctx = useContext(SafePrivyContext);
    const onComplete = opts?.onComplete;
    const prevAuth = useRef(ctx.authenticated);

    useEffect(() => {
        if (ctx.authenticated && !prevAuth.current && ctx.user && onComplete) {
            onComplete({ user: ctx.user, isNewUser: false, wasAlreadyAuthenticated: false });
        }
        prevAuth.current = ctx.authenticated;
    }, [ctx.authenticated, ctx.user, onComplete]);

    return { login: ctx.login };
}

// ---------------------------------------------------------------------------
// Bridge: maps real Privy context into our SafePrivyContext
// ---------------------------------------------------------------------------

function PrivyBridge({ children }: { children: ReactNode }) {
    const privy = useRealPrivy();

    const value: SafePrivyContextValue = {
        authenticated: privy.authenticated,
        ready: privy.ready,
        user: privy.user as SafePrivyUser | null,
        login: privy.login,
        logout: privy.logout,
    };

    return (
        <SafePrivyContext.Provider value={value}>
            {children}
        </SafePrivyContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Demo Provider: simulates auth via localStorage when Privy is not configured
// ---------------------------------------------------------------------------

const DEMO_USER_KEY = 'scoremarkt_demo_user';

function DemoPrivyProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SafePrivyUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(DEMO_USER_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch { /* ignore */ }
        setReady(true);
    }, []);

    const login = useCallback(() => {
        const id = 'demo_' + Math.random().toString(36).slice(2, 10);
        const newUser: SafePrivyUser = {
            id: `demo:${id}`,
            wallet: { address: '0xDemo' + id },
        };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newUser));
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(DEMO_USER_KEY);
        setUser(null);
    }, []);

    return (
        <SafePrivyContext.Provider value={{
            authenticated: !!user,
            ready,
            user,
            login,
            logout,
        }}>
            {children}
        </SafePrivyContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Main exported wrapper - used in BaseLayout.astro
// ---------------------------------------------------------------------------

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
    const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;
    const isConfigured = appId && appId !== 'your-privy-app-id' && !appId.includes('...');

    if (!isConfigured) {
        return <DemoPrivyProvider>{children}</DemoPrivyProvider>;
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ['google', 'wallet'],
                appearance: {
                    theme: 'dark',
                    accentColor: '#bef264',
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
            }}
        >
            <PrivyBridge>{children}</PrivyBridge>
        </PrivyProvider>
    );
}
