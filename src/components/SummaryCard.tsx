// src/components/SummaryCard.tsx
/**
 * Financial Summary Card Component
 * Displays total income, expense, balance
 */

import { TransactionSummary } from '@/lib/api';

interface SummaryCardProps {
  summary: TransactionSummary | null;
  loading: boolean;
}

export function SummaryCard({ summary, loading }: SummaryCardProps) {
  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!summary) {
    return <div className="text-center text-gray-500">No data</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {/* Income Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-green-900">Total Income</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">
          ${summary.total_income.toFixed(2)}
        </p>
        <p className="text-xs text-green-600 mt-1">
          From {summary.transaction_count} transactions
        </p>
      </div>

      {/* Expense Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-red-900">Total Expense</h3>
        <p className="text-3xl font-bold text-red-600 mt-2">
          ${summary.total_expense.toFixed(2)}
        </p>
        <p className="text-xs text-red-600 mt-1">
          Spending rate
        </p>
      </div>

      {/* Balance Card */}
      <div
        className={`rounded-lg p-6 border ${
          summary.balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <h3
          className={`text-sm font-medium ${
            summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}
        >
          Balance
        </h3>
        <p
          className={`text-3xl font-bold mt-2 ${
            summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          ${Math.abs(summary.balance).toFixed(2)}
        </p>
        <p
          className={`text-xs mt-1 ${
            summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          {summary.balance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}
        </p>
      </div>
    </div>
  );
}