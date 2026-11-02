// src/lib/format.ts
// Display helpers: Indian rupee formatting and browser-safe dates.

const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/** ₹1,85,000 (whole rupees) or ₹1,85,000.50 when precise */
export function formatINR(amount: number, precise = false): string {
    return (precise ? inrPrecise : inr).format(amount || 0);
}

/**
 * Parse API timestamps. Accepts ISO ("2026-10-30T21:13:00Z") and the older
 * "2026-10-30 21:13:00" form, which Safari cannot parse on its own.
 */
export function parseDate(value: string): Date {
    if (!value) return new Date(NaN);
    let v = value.trim().replace(' ', 'T');
    if (!/[zZ]|[+-]\d\d:?\d\d$/.test(v)) v += 'Z';
    return new Date(v);
}

export function formatDate(value: string): string {
    const d = parseDate(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function monthKey(value: string): string {
    const d = parseDate(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string): string {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
