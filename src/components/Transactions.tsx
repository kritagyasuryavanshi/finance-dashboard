// src/components/Transactions.tsx
// Add, find and delete transactions. Table on desktop, stacked rows on phones.
'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { CreateTransactionInput, errorMessage, Transaction } from '@/lib/api';
import { formatDate, formatINR } from '@/lib/format';
import { Button, ErrorNote, Field, inputClass, Panel, PanelHeader } from './ui';

const SUGGESTED = {
    income: ['Salary', 'Freelance', 'Interest', 'Refund', 'Gift'],
    expense: ['Rent', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Subscriptions', 'Shopping', 'Health', 'Travel', 'Investments'],
};

function AddForm({ onAdd, autoFocus }: { onAdd: (d: CreateTransactionInput) => Promise<void>; autoFocus?: boolean }) {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const value = Number(amount);
        if (!category.trim() || !(value > 0)) {
            setError('Enter a category and an amount above zero.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await onAdd({ type, category: category.trim(), amount: value, description: description.trim() });
            setSaved(`Added ${formatINR(value)} ${type === 'income' ? 'income' : 'expense'} in ${category.trim()}.`);
            setCategory('');
            setAmount('');
            setDescription('');
        } catch (err) {
            setError(errorMessage(err, "Couldn't add the transaction."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Panel>
            <PanelHeader title="Add a transaction" />
            <form onSubmit={submit} className="space-y-4 px-5 py-5">
                <div className="inline-flex rounded-lg border border-line bg-paper p-1" role="radiogroup" aria-label="Type">
                    {(['expense', 'income'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={type === t}
                            onClick={() => setType(t)}
                            className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                                type === t ? (t === 'income' ? 'bg-teal text-white' : 'bg-brick text-white') : 'text-muted hover:text-ink'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.4fr]">
                    <Field label="Category" htmlFor="category">
                        <input
                            id="category"
                            list="category-suggestions"
                            autoFocus={autoFocus}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={inputClass}
                            placeholder={type === 'income' ? 'Salary' : 'Groceries'}
                            maxLength={50}
                        />
                        <datalist id="category-suggestions">
                            {SUGGESTED[type].map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </Field>
                    <Field label="Amount (₹)" htmlFor="amount">
                        <input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`${inputClass} figures`}
                            placeholder="0"
                        />
                    </Field>
                    <Field label="Note (optional)" htmlFor="description">
                        <input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={inputClass}
                            placeholder="What was it for?"
                            maxLength={200}
                        />
                    </Field>
                </div>

                {error && <ErrorNote>{error}</ErrorNote>}
                <div className="flex flex-wrap items-center gap-4">
                    <Button type="submit" loading={saving}>
                        Add {type}
                    </Button>
                    {saved && !error && <p className="text-sm text-teal" role="status">{saved}</p>}
                </div>
            </form>
        </Panel>
    );
}

function DeleteButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
    const [armed, setArmed] = useState(false);
    const [busy, setBusy] = useState(false);
    if (!armed) {
        return (
            <button
                onClick={() => setArmed(true)}
                className="rounded-md p-2 text-muted hover:bg-brick-soft hover:text-brick"
                aria-label="Delete transaction"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        );
    }
    return (
        <span className="inline-flex items-center gap-1">
            <Button variant="danger" className="px-3 py-1.5 text-xs" loading={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); setArmed(false); } }}>
                Delete
            </Button>
            <Button variant="ghost" className="px-2 py-1.5 text-xs" onClick={() => setArmed(false)}>
                Keep
            </Button>
        </span>
    );
}

export function Transactions({
    transactions,
    onAdd,
    onDelete,
    focusForm,
}: {
    transactions: Transaction[];
    onAdd: (d: CreateTransactionInput) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    focusForm?: boolean;
}) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [error, setError] = useState('');

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return transactions.filter(
            (t) =>
                (filter === 'all' || t.type === filter) &&
                (!q || t.category.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
        );
    }, [transactions, query, filter]);

    const remove = async (id: string) => {
        setError('');
        try {
            await onDelete(id);
        } catch (err) {
            setError(errorMessage(err, "Couldn't delete the transaction."));
        }
    };

    return (
        <div className="space-y-6">
            <AddForm onAdd={onAdd} autoFocus={focusForm} />

            <Panel>
                <PanelHeader title="All transactions" description={`${transactions.length} in total, newest first`} />
                <div className="flex flex-wrap gap-3 border-b border-line px-5 py-3">
                    <div className="relative min-w-48 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`${inputClass} pl-9`}
                            placeholder="Search category or note"
                            aria-label="Search transactions"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        className={`${inputClass.replace('w-full', '')} w-full sm:w-56`}
                        aria-label="Filter by type"
                    >
                        <option value="all">Income and expenses</option>
                        <option value="income">Income only</option>
                        <option value="expense">Expenses only</option>
                    </select>
                </div>

                {error && <div className="px-5 pt-4"><ErrorNote>{error}</ErrorNote></div>}

                {shown.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-muted">
                        {transactions.length === 0 ? 'No transactions yet. Add one above.' : 'Nothing matches that search.'}
                    </p>
                ) : (
                    <ul className="divide-y divide-line">
                        {shown.map((t) => (
                            <li key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3 text-sm sm:grid-cols-[7.5rem_1fr_9rem_2.5rem]">
                                <span className="order-3 text-xs text-muted sm:order-none sm:text-sm">{formatDate(t.date)}</span>
                                <div className="order-1 min-w-0 sm:order-none">
                                    <p className="truncate font-semibold">{t.category}</p>
                                    {t.description && <p className="truncate text-xs text-muted">{t.description}</p>}
                                </div>
                                <span className={`figures order-2 text-right font-bold sm:order-none ${t.type === 'income' ? 'text-teal' : 'text-ink'}`}>
                                    {t.type === 'income' ? '+' : '−'}
                                    {formatINR(t.amount, true)}
                                </span>
                                <span className="order-4 justify-self-end sm:order-none">
                                    <DeleteButton onConfirm={() => remove(t.id)} />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
}
