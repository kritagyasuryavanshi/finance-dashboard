// src/lib/api.ts
/**
 * API Client - Single source of truth for all API calls
 * 
 * Structure:
 * - One axios instance (no baseURL prefix)
 * - Token interceptor (auto-adds JWT to every request)
 * - 401 interceptor (auto-redirect to login)
 * - Separate functions grouped by feature
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────
// TYPES
// ─────────────────────────────────────

export interface Transaction {
    id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
}

export interface TransactionSummary {
    total_income: number;
    total_expense: number;
    balance: number;
    transaction_count: number;

    
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface CreateTransactionInput {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description?: string;
}

export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user_id: string;
    email: string;
}


// ─────────────────────────────────────
// AXIOS INSTANCE
// Base URL = API root (no prefix!)
// ─────────────────────────────────────

const api = axios.create({
    baseURL: API_URL,
    // ↑ Just the base URL e.g. http://localhost:8000
    //   NO /transactions prefix!
    //   Each function adds its own path
    headers: {
        'Content-Type': 'application/json',
    },
});


// ─────────────────────────────────────
// REQUEST INTERCEPTOR
// Automatically adds JWT token to every request
// ─────────────────────────────────────

api.interceptors.request.use((config) => {
    // Only runs in browser (not during SSR)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // ↑ Adds to EVERY request automatically
            //   GET /transactions → includes Bearer token
            //   POST /transactions → includes Bearer token
            //   GET /ai/insights → includes Bearer token
            //   All of them! No manual work needed
        }
    }
    return config;
});


// ─────────────────────────────────────
// RESPONSE INTERCEPTOR
// Handle 401 errors globally
// ─────────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    // ↑ Success: just return response as-is
    
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
                // ↑ Force redirect to login page
                //   Any 401 from ANY endpoint triggers this
            }
        }
        return Promise.reject(error);
        // ↑ Still throw the error
        //   Calling code can catch it if needed
    }
);


// ─────────────────────────────────────
// AUTH API FUNCTIONS
// ─────────────────────────────────────

export const authAPI = {
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/signup', { email, password });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    me: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};


// ─────────────────────────────────────
// TRANSACTION API FUNCTIONS
// ─────────────────────────────────────

export const transactionAPI = {
    getAll: async (type?: 'income' | 'expense'): Promise<Transaction[]> => {
        const params = type ? { transaction_type: type } : {};
        const response = await api.get('/transactions/', { params });
        return response.data;
    },

    getSummary: async (): Promise<TransactionSummary> => {
        const response = await api.get('/transactions/summary');
        return response.data;
    },

    getById: async (id: string): Promise<Transaction> => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    create: async (data: CreateTransactionInput): Promise<Transaction> => {
        const response = await api.post('/transactions/', data);
        return response.data;
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await api.delete(`/transactions/${id}`);
        return response.data.success;
    },
};


// ─────────────────────────────────────
// AI API FUNCTIONS
// ─────────────────────────────────────

export const aiAPI = {
    getInsights: async (): Promise<{ response: string }> => {
        const response = await api.get('/ai/insights');
        return response.data;
    },

    chat: async (
        message: string,
        chatHistory: ChatMessage[] = []  // ← was any[], now properly typed
    ): Promise<{ response: string }> => {
        const response = await api.post('/ai/chat', {
            message,
            chat_history: chatHistory,
        });
        return response.data;
    },

    getAdvice: async (category: string, amount: number): Promise<{ response: string }> => {
        const response = await api.post('/ai/advice', { category, amount });
        return response.data;
    },

    uploadDocument: async (file: File): Promise<{
        success: boolean;
        message: string;
        documents_loaded: number;
    }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ai/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    queryDocuments: async (
        question: string,
        useAgent: boolean = false
    ): Promise<{
        answer: string;
        sources: string[];
        from_agent: boolean;
    }> => {
        const response = await api.post('/ai/query-documents', {
            question,
            use_agent: useAgent,
        });
        return response.data;
    },
};

export default api;