// src/components/TransactionForm.tsx
/**
 * Form to Add New Transaction
 */

import { useState } from 'react';
import { CreateTransactionInput } from '@/lib/api';

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  loading?: boolean;
}

export function TransactionForm({ onSubmit, loading = false }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !amount) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        category,
        amount: parseFloat(amount),
        description,
      });
      // Reset form
      setCategory('');
      setAmount('');
      setDescription('');
      setType('expense');
    } catch (error) {
      alert('Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border mb-8">
      <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Food, Salary"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}