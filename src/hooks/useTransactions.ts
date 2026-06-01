// src/hooks/useTransactions.ts
/**
 * Custom React Hook for Transaction Data
 * Handles fetching, loading, error states
 */

import { useState, useEffect } from 'react';
import {
  getAllTransactions,
  getSummary,
  createTransaction,
  deleteTransaction,
  Transaction,
  TransactionSummary,
  CreateTransactionInput,
} from '@/lib/api';

interface UseTransactionsReturn {
  // Data
  transactions: Transaction[];
  summary: TransactionSummary | null;
  
  // States
  loading: boolean;
  error: string | null;
  
  // Functions
  fetchTransactions: (type?: 'income' | 'expense') => Promise<void>;
  fetchSummary: () => Promise<void>;
  addTransaction: (data: CreateTransactionInput) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all transactions
  const fetchTransactions = async (type?: 'income' | 'expense') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTransactions(type);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  // Create transaction
  const addTransaction = async (data: CreateTransactionInput) => {
    setError(null);
    try {
      const newTransaction = await createTransaction(data);
      setTransactions([...transactions, newTransaction]);
      // Refresh summary after adding
      await fetchSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      throw err;
    }
  };

  // Delete transaction
  const removeTransaction = async (id: string) => {
    setError(null);
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
      // Refresh summary after deleting
      await fetchSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      throw err;
    }
  };

  // Refresh all data
  const refresh = async () => {
    await Promise.all([fetchTransactions(), fetchSummary()]);
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await refresh();
    };

    void loadData();
  }, []);

  return {
    transactions,
    summary,
    loading,
    error,
    fetchTransactions,
    fetchSummary,
    addTransaction,
    removeTransaction,
    refresh,
  };
}