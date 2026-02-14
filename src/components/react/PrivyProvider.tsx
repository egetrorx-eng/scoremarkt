'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
    const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;

    // If no App ID is provided, render children without the provider to avoid crashing
    // Note: React components using usePrivy hooks will still need to handle the lack of context.
    if (!appId || appId === 'your-privy-app-id' || appId.includes('...')) {
        console.warn('Privy App ID is missing or invalid. Authentication features will be disabled.');
        return <>{children}</>;
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
            {children}
        </PrivyProvider>
    );
}
