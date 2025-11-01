import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

export function proxyMiddleware(targetUrl: string, route?: string, ws?: boolean, pathRewriteFn?: (path: string, req: any) => string) {
    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: ws,
        pathRewrite: pathRewriteFn
            ? pathRewriteFn
            : route
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