// // Simple API utility that follows the flow:
// // 1. Try request with access token
// // 2. If 401, refresh token
// // 3. Retry request with new token

// export interface ApiOptions extends Omit<RequestInit, 'headers'> {
//     headers?: Record<string, string>;
// }

// export async function apiRequest(
//     url: string,
//     accessToken: string | null,
//     refreshTokenFn: () => Promise<string | null>,
//     options: ApiOptions = {}
// ): Promise<Response> {
//     const headers: Record<string, string> = {
//         'Content-Type': 'application/json',
//         ...options.headers,
//     };

//     // Add Authorization header if we have a token
//     if (accessToken) {
//         headers['Authorization'] = `Bearer ${accessToken}`;
//     }

//     // Try the request
//     let response = await fetch(url, {
//         ...options,
//         headers,
//     });

//     // If 401 and we have a refresh function, try to refresh and retry
//     if (response.status === 401) {
//         const newToken = await refreshTokenFn();

//         if (newToken) {
//             // Retry with new token
//             headers['Authorization'] = `Bearer ${newToken}`;
//             response = await fetch(url, {
//                 ...options,
//                 headers,
//             });
//         }
//     }

//     return response;
// }