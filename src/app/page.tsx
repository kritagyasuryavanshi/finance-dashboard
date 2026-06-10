// src/app/page.tsx
/**
 * Main Dashboard Page
 * 
 * Has TWO tabs:
 * 1. Dashboard - transactions and summary
 * 2. AI Assistant - AI insights and chat
 */

'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { AIInsights } from '@/components/AIInsights';

export default function Home() {
    
    // Get all transaction data and functions
    const {
        transactions,
        summary,
        loading,
        error,
        addTransaction,
        removeTransaction,
        refresh,
    } = useTransactions();

    // Track which tab is active
    const [activeTab, setActiveTab] = useState<'dashboard' | 'ai'>('dashboard');

    return (
        <main className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">

                {/* ─── HEADER ─────────────────── */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        💰 Finance Tracker
                    </h1>
                    <p className="text-gray-500 mt-1">
                        AI-Powered Personal Finance Manager
                    </p>
                </div>

                {/* ─── ERROR ──────────────────── */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* ─── SUMMARY CARDS ──────────── */}
                {/* Always visible on both tabs */}
                <SummaryCard summary={summary} loading={loading} />

                {/* ─── TAB NAVIGATION ─────────── */}
                <div className="flex gap-2 mb-6">
                    
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'dashboard'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'ai'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                    >
                        🤖 AI Assistant
                    </button>
                </div>

                {/* ─── DASHBOARD TAB ──────────── */}
                {activeTab === 'dashboard' && (
                    <div>
                        {/* Add Transaction Form */}
                        <TransactionForm
                            onSubmit={addTransaction}
                            loading={loading}
                        />
                        
                        {/* Transaction List */}
                        <div className="bg-white rounded-lg border">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Transactions
                                </h2>
                                <button
                                    onClick={refresh}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                            <div className="p-6">
                                <TransactionList
                                    transactions={transactions}
                                    loading={loading}
                                    onDelete={removeTransaction}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── AI TAB ─────────────────── */}
                {activeTab === 'ai' && (
                    <AIInsights />
                )}

            </div>
        </main>
    );
}