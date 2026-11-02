// src/components/Overview.tsx
// The home view: totals, where the money went, and recent activity.
'use client';

import { useMemo } from 'react';
import { Transaction, TransactionSummary } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import { Button, Panel, PanelHeader } from './ui';

// Warm and blue hues only, so no category is mistaken for the teal "Saved" band
const PALETTE = ['#b4442b', '#3b6e8f', '#b7791f', '#7a5c99', '#c26a8a', '#4b5d8c', '#8c6d4f'];
const OTHER = '#9aa3af';

function categoryColor(category: string, index: number) {
    return category === 'Other' ? OTHER : PALETTE[index % PALETTE.length];
}

function Stat({ label, value, tone, note }: { label: string; value: string; tone?: 'teal' | 'brick'; note?: string }) {
    const color = tone === 'teal' ? 'text-teal' : tone === 'brick' ? 'text-brick' : 'text-ink';
    return (
        <div className="px-5 py-4">
            <p className="text-sm text-muted">{label}</p>
            <p className={`figures mt-1 text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
            {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
        </div>
    );
}

export function Overview({
    summary,
    transactions,
    onAddFirst,
    onOpenTransactions,
}: {
    summary: TransactionSummary | null;
    transactions: Transaction[];
    onAddFirst: () => void;
    onOpenTransactions: () => void;
}) {
    const income = summary?.total_income ?? 0;
    const expense = summary?.total_expense ?? 0;
    const balance = summary?.balance ?? 0;
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : null;

    // Spending by category, largest first; top 6 shown, the rest grouped
    const categories = useMemo(() => {
        const totals = new Map<string, number>();
        for (const t of transactions) {
            if (t.type === 'expense') totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
        }
        const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 6);
        const rest = sorted.slice(6).reduce((s, [, v]) => s + v, 0);
        if (rest > 0) top.push(['Other', rest]);
        return top;
    }, [transactions]);

    if (!summary || summary.transaction_count === 0) {
        return (
            <Panel className="px-6 py-14 text-center">
                <h2 className="text-xl font-extrabold">Start with your first transaction</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                    Add your salary and a few expenses. Your totals, spending breakdown and AI analysis all build from
                    them.
                </p>
                <Button className="mt-6" onClick={onAddFirst}>
                    Add a transaction
                </Button>
            </Panel>
        );
    }

    const saved = Math.max(income - expense, 0);
    const base = Math.max(income, expense) || 1;

    return (
        <div className="space-y-6">
            <Panel className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line lg:[&>*:nth-child(-n+2)]:border-b-0">
                <Stat label="Income" value={formatINR(income)} tone="teal" />
                <Stat label="Spent" value={formatINR(expense)} tone="brick" />
                <Stat label="Balance" value={formatINR(balance)} tone={balance >= 0 ? undefined : 'brick'} />
                <Stat
                    label="Savings rate"
                    value={savingsRate === null ? 'n/a' : `${savingsRate}%`}
                    note={savingsRate === null ? 'Add income to see it' : savingsRate >= 20 ? 'Above the 20% guideline' : 'Below the 20% guideline'}
                />
            </Panel>

            <Panel>
                <PanelHeader
                    title={`Where your ${formatINR(income)} went`}
                    description="Each band is a share of your total income."
                />
                <div className="px-5 py-5">
                    <div className="flex h-9 overflow-hidden rounded-lg bg-paper" role="img" aria-label="Spending by category as a share of income">
                        {categories.map(([name, value], i) => (
                            <span
                                key={name}
                                title={`${name}: ${formatINR(value)}`}
                                style={{ width: `${(value / base) * 100}%`, background: categoryColor(name, i) }}
                            />
                        ))}
                        {saved > 0 && <span title={`Saved: ${formatINR(saved)}`} style={{ width: `${(saved / base) * 100}%` }} className="bg-teal" />}
                    </div>

                    <ul className="mt-5 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                        {categories.map(([name, value], i) => (
                            <li key={name} className="flex items-center gap-2.5 text-sm">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: categoryColor(name, i) }} />
                                <span className="flex-1">{name}</span>
                                <span className="figures text-muted">{income > 0 ? `${Math.round((value / income) * 100)}%` : ''}</span>
                                <span className="figures w-24 text-right font-semibold">{formatINR(value)}</span>
                            </li>
                        ))}
                        {saved > 0 && (
                            <li className="flex items-center gap-2.5 text-sm">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal" />
                                <span className="flex-1 font-semibold text-teal">Saved</span>
                                <span className="figures text-muted">{savingsRate}%</span>
                                <span className="figures w-24 text-right font-semibold text-teal">{formatINR(saved)}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </Panel>

            <Panel>
                <PanelHeader
                    title="Recent activity"
                    action={
                        <Button variant="ghost" className="-my-1 px-3 py-1.5" onClick={onOpenTransactions}>
                            See all
                        </Button>
                    }
                />
                <ul className="divide-y divide-line">
                    {transactions.slice(0, 5).map((t) => (
                        <li key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold">{t.description || t.category}</p>
                                <p className="text-xs text-muted">
                                    {t.category}, {formatDate(t.date)}
                                </p>
                            </div>
                            <span className={`figures font-bold ${t.type === 'income' ? 'text-teal' : 'text-ink'}`}>
                                {t.type === 'income' ? '+' : '−'}
                                {formatINR(t.amount)}
                            </span>
                        </li>
                    ))}
                </ul>
            </Panel>
        </div>
    );
}
