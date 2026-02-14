import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: number;
}

const ACHIEVEMENTS_STORAGE_KEY = 'scoremarkt_achievements';

const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_trade',
        title: 'Pioneer',
        description: 'Placed your first simulated trade.',
        icon: '🚀'
    },
    {
        id: 'high_volume',
        title: 'Whale Status',
        description: 'Reached over $10,000 in total trading volume.',
        icon: '🐋'
    },
    {
        id: 'top_performance',
        title: 'Alpha Scout',
        description: 'Maintained a positive PnL over 5 trades.',
        icon: '🕵️'
    },
    {
        id: 'balance_master',
        title: 'Market Legend',
        description: 'Portfolio value exceeded $50,000.',
        icon: '👑'
    }
];

export function useAchievements() {
    const [achievements, setAchievements] = useState<Achievement[]>(ALL_ACHIEVEMENTS);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (stored) {
            const unlockedIds = JSON.parse(stored) as string[];
            setAchievements(prev => prev.map(a => ({
                ...a,
                unlockedAt: unlockedIds.includes(a.id) ? Date.now() : undefined
            })));
        }
        setReady(true);
    }, []);

    const unlockAchievement = useCallback((id: string) => {
        setAchievements(prev => {
            const achievement = prev.find(a => a.id === id);
            if (achievement && !achievement.unlockedAt) {
                const now = Date.now();

                // Save to localStorage
                const unlockedIds = prev
                    .filter(a => a.unlockedAt || a.id === id)
                    .map(a => a.id);
                localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(unlockedIds));

                // Notify User
                toast.success(`${achievement.icon} Achievement Unlocked: ${achievement.title}`, {
                    description: achievement.description,
                    duration: 5000,
                });

                return prev.map(a => a.id === id ? { ...a, unlockedAt: now } : a);
            }
            return prev;
        });
    }, []);

    return { achievements, unlockAchievement, ready };
}
