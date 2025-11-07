"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyMiddleware = proxyMiddleware;
const http_proxy_middleware_1 = require("http-proxy-middleware");
function proxyMiddleware(targetUrl, route, ws, pathRewriteFn) {
    return (0, http_proxy_middleware_1.createProxyMiddleware)({
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
                var _a;
                const host = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.host) || '';
                console.log(`[Proxy] ${req.method} ${host}${req.url}`);
                (0, http_proxy_middleware_1.fixRequestBody)(proxyReq, req);
            },
            proxyRes: (proxyRes, req, res) => {
                var _a;
                const host = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.host) || '';
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
                var _a;
                const host = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.host) || '';
                console.error(`[Proxy Error] ${req.method} ${host}${req.url}:`, err.message);
            }
        }
    });
}
