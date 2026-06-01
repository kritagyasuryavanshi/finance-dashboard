// src/components/TransactionList.tsx
/**
 * List of Transactions
 * Shows all transactions in a table
 */

import { Transaction } from '@/lib/api';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  loading,
  onDelete,
}: TransactionListProps) {
  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No transactions yet. Add one to get started!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Description
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {transaction.category}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {transaction.type === 'income' ? '+' : '-'}$
                {transaction.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {transaction.description || '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600 hover:text-red-900 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}