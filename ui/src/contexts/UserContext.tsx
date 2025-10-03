'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { User } from 'shared';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { accessToken, authFetch, isLoading: isAuthLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        if (!accessToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authFetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/me`);

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, accessToken]);

    useEffect(() => {
        console.log("Auth loading:", isAuthLoading, "Access token:", accessToken);
        // Wait for auth to finish loading
        if (isAuthLoading) {
            return;
        }

        // Only fetch if we have an access token
        if (!accessToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        fetchUser();
    }, [accessToken, isAuthLoading, fetchUser]);
    return (
        <UserContext.Provider value={{ user, isLoading, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};