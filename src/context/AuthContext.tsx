// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, AuthResponse, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isDemo: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    startDemo: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore the session on load (all state updates happen in callbacks)
    useEffect(() => {
        const saved = localStorage.getItem('token');
        (saved ? authAPI.me() : Promise.reject(new Error('no session')))
            .then(setUser)
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const startSession = async (auth: AuthResponse) => {
        localStorage.setItem('token', auth.access_token);
        setUser(await authAPI.me());
    };

    const value: AuthContextType = {
        user,
        loading,
        isDemo: !!user?.email.endsWith('@demo.local'),
        login: async (email, password) => startSession(await authAPI.login(email.trim(), password)),
        signup: async (email, password) => startSession(await authAPI.signup(email.trim(), password)),
        startDemo: async () => startSession(await authAPI.demo()),
        logout: () => {
            localStorage.removeItem('token');
            setUser(null);
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
