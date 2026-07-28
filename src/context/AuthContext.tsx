// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if already logged in on app load
    useEffect(() => {
        const savedToken = localStorage.getItem('token');

        if (savedToken) {
            setToken(savedToken);
            // Verify token is still valid
            authAPI.me()
                .then(userData => {
                    setUser(userData);
                })
                .catch(() => {
                    // Token expired
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authAPI.login(email, password);
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        const userData = await authAPI.me();
        setUser(userData);
    };

    const signup = async (email: string, password: string) => {
        const data = await authAPI.signup(email, password);
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        const userData = await authAPI.me();
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}