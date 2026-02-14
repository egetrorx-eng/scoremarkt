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

export function useClobWebSocket(assetIds: string[]) {
    const [ticker, setTicker] = useState<Record<string, ClobTicker>>({});
    const [books, setBooks] = useState<Record<string, ClobOrderBook>>({});
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
    const wsRef = useRef<WebSocket | null>(null);

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
        if (!assetIds || assetIds.length === 0) {
            setStatus('closed');
            return;
        }

        const connect = () => {
            if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) return;

            setStatus('connecting');
            const ws = new WebSocket(CLOB_WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setStatus('open');
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
                } catch (err) {
                    // Ignore parsing errors
                }
            };

            ws.onerror = (err) => {
                console.error('WS Error:', err);
            };

            ws.onclose = () => {
                setStatus('closed');
                // Reconnect after 3 seconds
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [assetIds, subscribe]);

    return { ticker, books, status };
}
