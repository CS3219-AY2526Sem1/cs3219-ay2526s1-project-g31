'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
// import { User } from 'shared';

interface AuthContextType {
    // user: User | null;
    // isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    // login: (token: string) => void;
    logout: () => void;
    refreshAccessToken: () => Promise<string | null>;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Login with access token and fetch user data
    // const login = async (token: string) => {
    //     setAccessToken(token);

    //     try {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/me`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //             },
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             if (data.authenticated && data.user) {
    //                 setUser(data.user);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch user data:', error);
    //     }
    // };

    // Logout
    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
            // setUser(null);
        }
    };

    // Refresh access token using refresh token cookie
    const refreshAccessToken = async (): Promise<string | null> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.accessToken);
                return data.accessToken;
            }
            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    };

    const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const fetchWithToken = async (accessToken: string) => {
            headers['Authorization'] = `Bearer ${accessToken}`;
            const response = await fetch(url, {
                ...options,
                headers,
            });
            return response;
        }

        let response;

        if (accessToken) {
            response = await fetchWithToken(accessToken);
            if (response.status === 401) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    setAccessToken(newToken);
                    response = await fetchWithToken(newToken);
                }
            }
        } else {
            response = await fetch(url, options);
        }

        return response;
    };

    useEffect(() => {
        const initAuth = async () => {
            const newToken = await refreshAccessToken();
            if (newToken) {
                setAccessToken(newToken);
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{
            // user,
            // isAuthenticated: !!user,
            isLoading,
            accessToken,
            // login,
            logout,
            refreshAccessToken,
            authFetch
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};