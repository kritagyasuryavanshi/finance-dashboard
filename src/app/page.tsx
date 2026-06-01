// src/app/page.tsx
/**
 * Main Dashboard Page
 * Shows summary and transaction list
 */

'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';

export default function Home() {
  const {
    transactions,
    summary,
    loading,
    error,
    addTransaction,
    removeTransaction,
    refresh,
  } = useTransactions();

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">💰 Finance Tracker</h1>
          <p className="text-gray-600 mt-2">
            Manage your income and expenses
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCard summary={summary} loading={loading} />

        {/* Add Transaction Form */}
        <TransactionForm onSubmit={addTransaction} loading={loading} />

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          </div>
          <div className="p-6">
            <TransactionList
              transactions={transactions}
              loading={loading}
              onDelete={removeTransaction}
            />
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refresh}
          className="mt-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
        >
          🔄 Refresh
        </button>
      </div>
    </main>
  );
}