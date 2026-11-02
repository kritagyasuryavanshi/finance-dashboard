// src/hooks/useTransactions.ts
/**
 * Transactions + summary for the signed-in user.
 * Loads once on mount; add/remove update local state and refresh the summary.
 */

import { useCallback, useEffect, useState } from 'react';
import { errorMessage, transactionAPI, Transaction, TransactionSummary, CreateTransactionInput } from '@/lib/api';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(
        () =>
            Promise.all([transactionAPI.getAll(), transactionAPI.getSummary()])
                .then(([tx, sum]) => {
                    setTransactions(tx);
                    setSummary(sum);
                    setError(null);
                })
                .catch((err) => setError(errorMessage(err, "Couldn't load your transactions.")))
                .finally(() => setLoading(false)),
        []
    );

    useEffect(() => {
        load();
    }, [load]);

    const addTransaction = async (data: CreateTransactionInput) => {
        const created = await transactionAPI.create(data);
        setTransactions((prev) => [created, ...prev]);
        setSummary(await transactionAPI.getSummary());
    };

    const removeTransaction = async (id: string) => {
        await transactionAPI.delete(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        setSummary(await transactionAPI.getSummary());
    };

    return { transactions, summary, loading, error, addTransaction, removeTransaction, refresh: load };
}
