// src/lib/api.ts
/**
 * API client: one axios instance, JWT attached to every request,
 * friendly error messages, and longer timeouts for AI calls.
 */

import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ───────────────────────────────

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

export interface DeepAnalysis {
    final_output: string;
    financial_health: string;
    alert_message: string;
    summary: TransactionSummary;
    error?: string | null;
}

// ─── Instance ────────────────────────────

const DEFAULT_TIMEOUT = 45_000; // free hosting can take ~1 minute to wake
const AI_TIMEOUT = 150_000; // the CrewAI crew takes about a minute

const api = axios.create({
    baseURL: API_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// An expired session sends the user back to sign in. Auth calls themselves are
// excluded, so a wrong password shows an error instead of reloading the page.
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const url = error.config?.url || '';
        if (error.response?.status === 401 && !url.startsWith('/auth/') && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/** Turn any request failure into one sentence the user can act on. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Try again.'): string {
    const e = err as AxiosError<{ detail?: unknown }>;
    if (e?.code === 'ECONNABORTED') return 'The server took too long to answer. It may be waking up; try again in a moment.';
    if (e?.response) {
        const detail = e.response.data?.detail;
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, '');
        return fallback;
    }
    if (e?.request) return "Can't reach the server. Check your connection, or wait a minute while it wakes up.";
    return fallback;
}

// ─── Server wake-up ──────────────────────

/** Ping /health; resolves true once the API answers. */
export async function pingServer(timeout = 70_000): Promise<boolean> {
    try {
        await api.get('/health', { timeout });
        return true;
    } catch {
        return false;
    }
}

// ─── Auth ────────────────────────────────

export const authAPI = {
    signup: async (email: string, password: string): Promise<AuthResponse> =>
        (await api.post('/auth/signup', { email, password })).data,

    login: async (email: string, password: string): Promise<AuthResponse> =>
        (await api.post('/auth/login', { email, password })).data,

    demo: async (): Promise<AuthResponse> => (await api.post('/auth/demo', null, { timeout: 70_000 })).data,

    me: async (): Promise<User> => (await api.get('/auth/me')).data,
};

// ─── Transactions ────────────────────────

export const transactionAPI = {
    getAll: async (type?: 'income' | 'expense'): Promise<Transaction[]> =>
        (await api.get('/transactions/', { params: type ? { transaction_type: type } : {} })).data,

    getSummary: async (): Promise<TransactionSummary> => (await api.get('/transactions/summary')).data,

    create: async (data: CreateTransactionInput): Promise<Transaction> => (await api.post('/transactions/', data)).data,

    delete: async (id: string): Promise<boolean> => (await api.delete(`/transactions/${id}`)).data.success,
};

// ─── AI ──────────────────────────────────

export const aiAPI = {
    getInsights: async (): Promise<{ response: string }> =>
        (await api.get('/ai/insights', { timeout: AI_TIMEOUT })).data,

    /** `history` = earlier turns only; the new message is sent separately */
    chat: async (message: string, history: ChatMessage[] = []): Promise<{ response: string }> =>
        (await api.post('/ai/chat', { message, chat_history: history }, { timeout: AI_TIMEOUT })).data,

    deepAnalysis: async (): Promise<DeepAnalysis> => (await api.get('/ai/deep-analysis', { timeout: AI_TIMEOUT })).data,

    crewAnalysis: async (): Promise<{ report: string }> =>
        (await api.get('/ai/crew-analysis', { timeout: AI_TIMEOUT })).data,

    uploadDocument: async (file: File): Promise<{ success: boolean; message: string; documents_loaded: number }> => {
        const formData = new FormData();
        formData.append('file', file);
        return (
            await api.post('/ai/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: AI_TIMEOUT,
            })
        ).data;
    },

    queryDocuments: async (
        question: string,
        useAgent = false
    ): Promise<{ answer: string; sources?: string[] | null; from_agent: boolean }> =>
        (await api.post('/ai/query-documents', { question, use_agent: useAgent }, { timeout: AI_TIMEOUT })).data,
};

export default api;
