// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { AIInsights } from '@/components/AIInsights';
import { DocumentUpload } from '@/components/documentUpload';
import { DocumentQuery } from '@/components/documentQuery';

export default function Home() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'documents'>('dashboard');

    const {
        transactions,
        summary,
        loading: txLoading,
        error,
        addTransaction,
        removeTransaction,
        refresh,
    } = useTransactions();

    // ─────────────────────────────────
    // PROTECT THIS ROUTE
    // Redirect to login if not logged in
    // ─────────────────────────────────
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // Don't render dashboard if not logged in
    if (!user) return null;

    return (
        <main className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">

                {/* ─── HEADER WITH USER INFO ─── */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            💰 Finance Tracker
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, {user.email}!
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* ─── ERROR ─── */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* ─── SUMMARY CARDS ─── */}
                <SummaryCard summary={summary} loading={txLoading} />

                {/* ─── TABS ─── */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'dashboard'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'ai'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                    >
                        🤖 AI Assistant
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'documents'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                        }`}
                    >
                        📁 Document Analysis
                    </button>
                </div>

                {/* ─── DASHBOARD TAB ─── */}
                {activeTab === 'dashboard' && (
                    <div>
                        <TransactionForm onSubmit={addTransaction} loading={txLoading} />
                        <div className="bg-white rounded-lg border">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Transactions</h2>
                                <button onClick={refresh} className="text-sm text-gray-500">
                                    🔄 Refresh
                                </button>
                            </div>
                            <div className="p-6">
                                <TransactionList
                                    transactions={transactions}
                                    loading={txLoading}
                                    onDelete={removeTransaction}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── AI TAB ─── */}
                {activeTab === 'ai' && <AIInsights />}

                {/* ─── DOCUMENTS TAB ─── */}
                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        <DocumentUpload />
                        <DocumentQuery />
                    </div>
                )}
            </div>
        </main>
    );
}