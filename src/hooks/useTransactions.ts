// src/hooks/useTransactions.ts
/**
 * Custom hook for transaction data
 * Uses transactionAPI from api.ts
 */

import { useState, useEffect } from 'react';
import { transactionAPI, Transaction, TransactionSummary, CreateTransactionInput } from '@/lib/api';

interface UseTransactionsReturn {
    transactions: Transaction[];
    summary: TransactionSummary | null;
    loading: boolean;
    error: string | null;
    addTransaction: (data: CreateTransactionInput) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [txData, summaryData] = await Promise.all([
                transactionAPI.getAll(),
                transactionAPI.getSummary(),
            ]);
            setTransactions(txData);
            setSummary(summaryData);
        } catch (err: any) {
            // 401 handled globally by interceptor
            if (err.response?.status !== 401) {
                setError('Failed to load transactions');
            }
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (data: CreateTransactionInput) => {
        setError(null);
        try {
            const newTransaction = await transactionAPI.create(data);
            setTransactions(prev => [...prev, newTransaction]);
            // Refresh summary
            const summaryData = await transactionAPI.getSummary();
            setSummary(summaryData);
        } catch (err: any) {
            setError('Failed to add transaction');
            throw err;
        }
    };

    const removeTransaction = async (id: string) => {
        setError(null);
        try {
            await transactionAPI.delete(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            // Refresh summary
            const summaryData = await transactionAPI.getSummary();
            setSummary(summaryData);
        } catch (err: any) {
            setError('Failed to delete transaction');
            throw err;
        }
    };

    const refresh = async () => {
        await fetchAll();
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        transactions,
        summary,
        loading,
        error,
        addTransaction,
        removeTransaction,
        refresh,
    };
}