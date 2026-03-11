import { useEffect, useState, useCallback, useRef } from 'react';

const CLOB_WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/';

export interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

export interface ClobTicker {
    asset_id: string;
    price: string;
    side: string;
    timestamp: string;
}

export interface ClobOrderBook {
    asset_id: string;
    bids: { price: string; size: string }[];
    asks: { price: string; size: string }[];
    timestamp: string;
}

const MAX_RETRIES = 5;

export function useClobWebSocket(assetIds: string[]) {
    const [ticker, setTicker] = useState<Record<string, ClobTicker>>({});
    const [books, setBooks] = useState<Record<string, ClobOrderBook>>({});
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
    const wsRef = useRef<WebSocket | null>(null);
    const retriesRef = useRef(0);
    const unmountedRef = useRef(false);

    const subscribe = useCallback((ids: string[]) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && ids.length > 0) {
            const msg = {
                type: 'subscribe',
                assets_ids: ids,
            };
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    useEffect(() => {
        unmountedRef.current = false;

        if (!assetIds || assetIds.length === 0) {
            setStatus('closed');
            return;
        }

        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connect = () => {
            if (unmountedRef.current) return;
            if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) return;

            setStatus('connecting');

            try {
                const ws = new WebSocket(CLOB_WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (unmountedRef.current) { ws.close(); return; }
                    setStatus('open');
                    retriesRef.current = 0;
                    subscribe(assetIds);
                };

                ws.onmessage = (event) => {
                    try {
                        const data: WebSocketMessage = JSON.parse(event.data);

                        if (data.type === 'ticker' && data.asset_id) {
                            setTicker(prev => ({
                                ...prev,
                                [data.asset_id]: data as unknown as ClobTicker
                            }));
                        } else if (data.type === 'book' && data.asset_id) {
                            setBooks(prev => ({
                                ...prev,
                                [data.asset_id]: data as unknown as ClobOrderBook
                            }));
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                };

                ws.onerror = () => {
                    // Silently handle - onclose will fire next
                };

                ws.onclose = () => {
                    if (unmountedRef.current) return;
                    setStatus('closed');
                    if (retriesRef.current < MAX_RETRIES) {
                        const delay = Math.min(3000 * Math.pow(2, retriesRef.current), 30000);
                        retriesRef.current++;
                        reconnectTimeout = setTimeout(connect, delay);
                    }
                };
            } catch {
                setStatus('closed');
            }
        };

        connect();

        return () => {
            unmountedRef.current = true;
            clearTimeout(reconnectTimeout);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [assetIds, subscribe]);

    return { ticker, books, status };
}
