// src/lib/api.ts
/**
 * API Client
 * Handles all communication with FastAPI backend
 */

import axios from 'axios';

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/transactions`,
  // ↑ All requests go to http://localhost:8000/transactions
  headers: {
    'Content-Type': 'application/json',
  },
});

// ────────────────────────────────────
// TYPES (Data shapes from Python)
// ────────────────────────────────────

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

export interface CreateTransactionInput {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
}

// ────────────────────────────────────
// API FUNCTIONS
// ────────────────────────────────────

/**
 * Get all transactions
 * Optional filter by type (income/expense)
 */
export async function getAllTransactions(
  type?: 'income' | 'expense'
): Promise<Transaction[]> {
  try {
    const response = await api.get('/', {
      params: type ? { transaction_type: type } : {},
      // ↑ If type provided, add as query parameter
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Get financial summary
 */
export async function getSummary(): Promise<TransactionSummary> {
  try {
    const response = await api.get('/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
}

/**
 * Get single transaction by ID
 */
export async function getTransaction(id: string): Promise<Transaction> {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    throw error;
  }
}

/**
 * Create new transaction
 */
export async function createTransaction(
  data: CreateTransactionInput
): Promise<Transaction> {
  try {
    const response = await api.post('/', {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description || '',
    });
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Delete transaction by ID
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const response = await api.delete(`/${id}`);
    return response.data.success;
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    throw error;
  }
}

export default api;