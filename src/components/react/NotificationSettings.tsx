import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface NotificationPreferences {
    limitOrderFulfillment: boolean;
    alphaAlerts: boolean;
    marketing: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
    limitOrderFulfillment: true,
    alphaAlerts: true,
    marketing: false,
};

export default function NotificationSettings() {
    const { user, authenticated } = usePrivy();
    const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);

    const storageKey = user?.id ? `scoremarkt_notif_prefs_${user.id.replace(/:/g, '_')}` : null;

    useEffect(() => {
        if (!storageKey || !authenticated) {
            setLoading(false);
            return;
        }

        const stored = localStorage.getItem(storageKey);
        if (stored) {
            setPrefs(JSON.parse(stored));
        }
        setLoading(false);
    }, [storageKey, authenticated]);

    const togglePref = (key: keyof NotificationPreferences) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(newPrefs));
        }
    };

    if (!authenticated) return null;

    return (
        <div className="card p-8 border border-white/10 bg-midnight-800/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold font-display text-white">Engagement Settings</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Manage your professional terminal alerts</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                        <div className="text-sm font-bold text-white">Trade Fulfillment Alerts</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Receive email notifications when limit orders are hit</div>
                    </div>
                    <button
                        onClick={() => togglePref('limitOrderFulfillment')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.limitOrderFulfillment ? 'bg-lime-500' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-midnight-900 transition-transform duration-300 ${prefs.limitOrderFulfillment ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                        <div className="text-sm font-bold text-white">AI Alpha Detected</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Alerts for high-confidence market opportunities</div>
                    </div>
                    <button
                        onClick={() => togglePref('alphaAlerts')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.alphaAlerts ? 'bg-lime-500' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-midnight-900 transition-transform duration-300 ${prefs.alphaAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-50">
                    <div>
                        <div className="text-sm font-bold text-white">Marketing & Product Updates</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Stay synchronized with terminal feature releases</div>
                    </div>
                    <button
                        onClick={() => togglePref('marketing')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${prefs.marketing ? 'bg-lime-500' : 'bg-white/10'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-midnight-900 transition-transform duration-300 ${prefs.marketing ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
                    Emails will be sent to <span className="text-lime-500/60 lowercase">{user?.email?.address || 'your connected email'}</span>
                </p>
            </div>
        </div>
    );
}
