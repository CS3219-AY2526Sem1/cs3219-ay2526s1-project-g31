import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: Debugged proxy logic.
 * Author review: Validated correctness.
 */

export function httpProxy(targetUrl: string, route?: string) {
    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: route
            ? (path, req) => `${route}${path}`
            : undefined,
        on: {
            proxyReq: (proxyReq, req, res) => {
                const host = (req as any).headers?.host || '';
                console.log(`[Proxy] ${req.method} ${host}${req.url}`);
                fixRequestBody(proxyReq, req);
            },
            proxyRes: (proxyRes, req, res) => {
                const host = (req as any).headers?.host || '';
                console.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.method} ${host}${req.url}`);

                // Log redirect details
                if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) {
                    const location = proxyRes.headers['location'];
                    if (location) {
                        console.log(`[Proxy Redirect] Redirecting to: ${location}`);
                    }
                }
            },
            error: (err, req, res) => {
                const host = (req as any).headers?.host || '';
                console.error(`[Proxy Error] ${req.method} ${host}${req.url}:`, err.message);
            }
        }
    });
}

export function wsProxy(target: string, route: string) {
    return createProxyMiddleware({
        target: target,
        changeOrigin: true,
        ws: true,
        pathFilter: (pathname, req) => {
            return pathname.startsWith(route);
        },
        pathRewrite: (path, req) => {
            return path;
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[Proxy] ${req.method} ${req.url} -> ${target}`);
                console.log(`[Proxy] Full target URL: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
            },
            proxyReqWs: (proxyReq, req, socket, options, head) => {
                console.log(`[WebSocket] Upgrading ${req.url}`);
                console.log(`[WebSocket] Target:`, options.target);
                console.log(`[WebSocket] ProxyReq path: ${proxyReq.path}`);
                console.log(`[WebSocket] ProxyReq host: ${proxyReq.getHeader('host')}`);
            },
            error: (err, req, res) => {
                console.error(`[Proxy Error] ${req.url}:`, err.message);
            }
        }
    });
}