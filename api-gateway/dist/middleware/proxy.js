"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpProxy = httpProxy;
exports.wsProxy = wsProxy;
const http_proxy_middleware_1 = require("http-proxy-middleware");
function httpProxy(targetUrl, route) {
    return (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: route
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
function wsProxy(target, route) {
    return (0, http_proxy_middleware_1.createProxyMiddleware)({
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
