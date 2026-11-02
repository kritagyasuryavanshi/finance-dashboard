// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, FileText, LayoutDashboard, ListOrdered, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { Overview } from '@/components/Overview';
import { Transactions } from '@/components/Transactions';
import { Assistant } from '@/components/Assistant';
import { Agents } from '@/components/Agents';
import { Documents } from '@/components/Documents';
import { ErrorNote } from '@/components/ui';

type View = 'overview' | 'transactions' | 'assistant' | 'agents' | 'documents';

const NAV: { id: View; label: string; title: string; icon: typeof Bot }[] = [
    { id: 'overview', label: 'Overview', title: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', title: 'Transactions', icon: ListOrdered },
    { id: 'assistant', label: 'Assistant', title: 'AI assistant', icon: MessageSquare },
    { id: 'agents', label: 'Agents', title: 'AI agents', icon: Bot },
    { id: 'documents', label: 'Statements', title: 'Bank statements', icon: FileText },
];

function Dashboard() {
    const { user, isDemo, logout } = useAuth();
    const { transactions, summary, loading, error, addTransaction, removeTransaction } = useTransactions();
    const [view, setView] = useState<View>('overview');
    const [focusForm, setFocusForm] = useState(false);
    const hasData = (summary?.transaction_count ?? 0) > 0;
    const current = NAV.find((n) => n.id === view)!;

    const go = (v: View, focus = false) => {
        setView(v);
        setFocusForm(focus);
        window.scrollTo({ top: 0 });
    };

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
            {/* Sidebar (desktop) */}
            <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-3 py-6 lg:flex">
                <p className="px-3 text-lg font-bold">Finance Tracker</p>
                <nav className="mt-8 space-y-1" aria-label="Main">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => go(id)}
                            aria-current={view === id ? 'page' : undefined}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                                view === id ? 'bg-teal-soft text-teal' : 'text-muted hover:bg-paper hover:text-ink'
                            }`}
                        >
                            <Icon className="h-4 w-4" aria-hidden />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto border-t border-line px-3 pt-4">
                    <p className="truncate text-sm font-semibold" title={user?.email}>
                        {isDemo ? 'Demo account' : user?.email}
                    </p>
                    <button onClick={logout} className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
                        <LogOut className="h-4 w-4" aria-hidden /> Sign out
                    </button>
                </div>
            </aside>

            <div className="pb-24 lg:pb-0">
                {/* Top bar (mobile) */}
                <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
                    <p className="font-bold">Finance Tracker</p>
                    <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-muted" aria-label="Sign out">
                        <LogOut className="h-4 w-4" /> Sign out
                    </button>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
                    {isDemo && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-[#7a4f12]">
                            <span>You&apos;re exploring a demo account with sample data. It&apos;s deleted after 24 hours.</span>
                            <Link href="/signup" onClick={logout} className="font-semibold underline">
                                Create your own account
                            </Link>
                        </div>
                    )}

                    <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{current.title}</h1>

                    {error && <div className="mb-6"><ErrorNote>{error}</ErrorNote></div>}

                    {loading ? (
                        <div className="space-y-4" aria-busy="true" aria-label="Loading">
                            <div className="h-24 animate-pulse rounded-[var(--radius-panel)] bg-line/60" />
                            <div className="h-56 animate-pulse rounded-[var(--radius-panel)] bg-line/60" />
                        </div>
                    ) : (
                        <>
                            {view === 'overview' && (
                                <Overview
                                    summary={summary}
                                    transactions={transactions}
                                    onAddFirst={() => go('transactions', true)}
                                    onOpenTransactions={() => go('transactions')}
                                />
                            )}
                            {view === 'transactions' && (
                                <Transactions transactions={transactions} onAdd={addTransaction} onDelete={removeTransaction} focusForm={focusForm} />
                            )}
                            {view === 'assistant' && <Assistant hasData={hasData} />}
                            {view === 'agents' && <Agents hasData={hasData} />}
                            {view === 'documents' && <Documents />}
                        </>
                    )}
                </main>
            </div>

            {/* Bottom tabs (mobile) */}
            <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-line bg-surface lg:hidden" aria-label="Main">
                {NAV.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => go(id)}
                        aria-current={view === id ? 'page' : undefined}
                        className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${view === id ? 'text-teal' : 'text-muted'}`}
                    >
                        <Icon className="h-5 w-5" aria-hidden />
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-muted" aria-busy="true">
                Loading your account…
            </div>
        );
    }
    return <Dashboard />;
}
