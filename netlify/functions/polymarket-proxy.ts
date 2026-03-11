import type { Handler, HandlerEvent } from '@netlify/functions';
import { corsHeaders, jsonResponse, errorResponse } from './_shared/utils';

/**
 * Polymarket API Proxy - Netlify Function
 * ═══════════════════════════════════════════════════════════════
 * Proxies requests to the Polymarket Gamma API for client-side use.
 * Handles CORS and caches responses for performance.
 */

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

// Simple in-memory cache (lives per function invocation on Netlify)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached(key: string): unknown | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: unknown): void {
    cache.set(key, { data, timestamp: Date.now() });
}

const handler: Handler = async (event: HandlerEvent) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return errorResponse('Only GET requests are supported', 405);
    }

    // Parse the endpoint from query parameters
    const params = event.queryStringParameters || {};
    const endpoint = params.endpoint || 'events';
    delete params.endpoint;

    // Only allow specific endpoints
    const allowedEndpoints = ['events', 'markets', 'sports', 'tags'];
    if (!allowedEndpoints.includes(endpoint)) {
        return errorResponse('Invalid endpoint', 400);
    }

    // Build the Gamma API URL
    const url = new URL(`${GAMMA_API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    const cacheKey = url.toString();

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30',
                'X-Cache': 'HIT',
                ...corsHeaders,
            },
            body: JSON.stringify(cached),
        };
    }

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'ScoreMarkt/1.0',
            },
        });

        if (!response.ok) {
            return errorResponse(`Polymarket API error: ${response.status}`, response.status);
        }

        const data = await response.json();

        // Cache the response
        setCache(cacheKey, data);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=30',
                'X-Cache': 'MISS',
                ...corsHeaders,
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Proxy error:', error);
        return errorResponse('Failed to fetch from Polymarket API', 502);
    }
};

export { handler };
