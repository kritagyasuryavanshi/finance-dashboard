// src/components/ui.tsx
// Small shared building blocks.
'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
    primary: 'bg-teal text-white hover:bg-[#0c625b] disabled:bg-teal/50',
    secondary: 'bg-surface text-ink border border-line hover:border-ink/30 disabled:text-muted',
    ghost: 'text-muted hover:text-ink hover:bg-paper',
    danger: 'bg-brick text-white hover:bg-[#983823]',
};

export function Button({
    variant = 'primary',
    loading = false,
    className = '',
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
    return (
        <button
            {...props}
            disabled={props.disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {children}
        </button>
    );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <section className={`rounded-[var(--radius-panel)] border border-line bg-surface ${className}`}>{children}</section>;
}

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
                <h2 className="text-base font-bold">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function Markdown({ children }: { children: string }) {
    return (
        <div className="prose-ai">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
        </div>
    );
}

export function ErrorNote({ children }: { children: ReactNode }) {
    return (
        <p role="alert" className="rounded-lg border border-brick/25 bg-brick-soft px-4 py-3 text-sm text-brick">
            {children}
        </p>
    );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={htmlFor} className="block text-sm font-semibold">
                {label}
            </label>
            {children}
            {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
    );
}

export const inputClass =
    'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted/70 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20';
