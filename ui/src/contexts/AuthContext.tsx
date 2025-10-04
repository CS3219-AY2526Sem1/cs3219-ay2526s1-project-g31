'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isLoading: boolean;
    accessToken: string | null;
    logout: () => void;
    refreshAccessToken: () => Promise<string | null>;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const logout = useCallback(async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
        }
    }, []);

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.status === 401) {
                setAccessToken(null);
                return null;
            }

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
    }, []);

    const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
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
    }, [accessToken, refreshAccessToken]);

    useEffect(() => {
        const initAuth = async () => {
            const newToken = await refreshAccessToken();
            if (newToken) {
                setAccessToken(newToken);
            }
            setIsLoading(false);
        };

        initAuth();
    }, [refreshAccessToken]);

    return (
        <AuthContext.Provider value={{
            isLoading,
            accessToken,
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