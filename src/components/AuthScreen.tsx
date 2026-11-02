// src/components/AuthScreen.tsx
// Shared sign-in / sign-up screen: a real form, server wake-up notice and a one-click demo.
'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { errorMessage, pingServer } from '@/lib/api';
import { Button, ErrorNote, Field, inputClass } from './ui';

type Mode = 'login' | 'signup';

// Proportions for the illustrative strip on the brand panel
const STRIP = [
    { label: 'Rent', share: 24, color: '#b4442b' },
    { label: 'Investments', share: 11, color: '#3b6e8f' },
    { label: 'Groceries', share: 7, color: '#b7791f' },
    { label: 'Everything else', share: 17, color: '#8a94a3' },
    { label: 'Saved', share: 41, color: '#0f766e' },
];

export function AuthScreen({ mode }: { mode: Mode }) {
    const { login, signup, startDemo } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState<'form' | 'demo' | null>(null);
    const [waking, setWaking] = useState(false);

    // Free hosting sleeps when idle. Start waking it as soon as the page opens,
    // and say so if it takes more than a couple of seconds.
    useEffect(() => {
        let done = false;
        const timer = setTimeout(() => !done && setWaking(true), 2500);
        pingServer().finally(() => {
            done = true;
            clearTimeout(timer);
            setWaking(false);
        });
        return () => clearTimeout(timer);
    }, []);

    const run = async (kind: 'form' | 'demo', action: () => Promise<void>) => {
        setError('');
        setBusy(kind);
        try {
            await action();
            router.push('/');
        } catch (err) {
            setError(errorMessage(err, mode === 'login' ? 'Sign-in failed. Try again.' : 'Sign-up failed. Try again.'));
            setBusy(null);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (mode === 'signup' && password.length < 6) {
            setError('Use at least 6 characters for your password.');
            return;
        }
        run('form', () => (mode === 'login' ? login(email, password) : signup(email, password)));
    };

    const isLogin = mode === 'login';

    return (
        <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            {/* Brand panel */}
            <aside className="hidden flex-col justify-between bg-ink px-12 py-12 text-white lg:flex">
                <p className="text-lg font-bold">Finance Tracker</p>
                <div className="max-w-md">
                    <h1 className="text-[2.6rem] font-extrabold leading-[1.1] tracking-tight">
                        See where every rupee goes, then ask why.
                    </h1>
                    <p className="mt-5 text-base leading-relaxed text-white/70">
                        Track income and spending, and let AI explain it: answers grounded in your own bank
                        statements, a health check that adapts its advice, and a team of AI agents that writes your
                        monthly report.
                    </p>
                    <figure className="mt-10">
                        <div className="flex h-4 overflow-hidden rounded-full" aria-hidden>
                            {STRIP.map((s) => (
                                <span key={s.label} style={{ width: `${s.share}%`, background: s.color }} />
                            ))}
                        </div>
                        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                            {STRIP.map((s) => (
                                <span key={s.label} className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                                    {s.label} {s.share}%
                                </span>
                            ))}
                        </figcaption>
                    </figure>
                </div>
                <p className="text-sm text-white/50">Built with FastAPI, LangGraph, CrewAI and Next.js</p>
            </aside>

            {/* Form */}
            <section className="flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-sm">
                    <p className="mb-8 text-lg font-bold lg:hidden">Finance Tracker</p>
                    <h2 className="text-2xl font-extrabold tracking-tight">{isLogin ? 'Sign in' : 'Create your account'}</h2>
                    <p className="mt-1.5 text-sm text-muted">
                        {isLogin ? 'Welcome back.' : 'Free, and it takes under a minute.'}
                    </p>

                    {waking && (
                        <p className="mt-6 rounded-lg border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-[#7a4f12]">
                            Waking up the server. It sleeps when idle on free hosting, so the first request can take
                            up to a minute.
                        </p>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                        <Field label="Email" htmlFor="email">
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="you@example.com"
                            />
                        </Field>
                        <Field label="Password" htmlFor="password" hint={isLogin ? undefined : 'At least 6 characters'}>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${inputClass} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </Field>

                        {error && <ErrorNote>{error}</ErrorNote>}

                        <Button
                            type="submit"
                            className="w-full"
                            loading={busy === 'form'}
                            disabled={!email || !password || busy !== null}
                        >
                            {isLogin ? 'Sign in' : 'Create account'}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center gap-3 text-xs text-muted">
                        <span className="h-px flex-1 bg-line" />
                        or
                        <span className="h-px flex-1 bg-line" />
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full"
                        loading={busy === 'demo'}
                        disabled={busy !== null}
                        onClick={() => run('demo', startDemo)}
                    >
                        Try the demo with sample data
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted">No sign-up. A private demo account, deleted after 24 hours.</p>

                    <p className="mt-8 text-center text-sm text-muted">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <Link href={isLogin ? '/signup' : '/login'} className="font-semibold text-teal hover:underline">
                            {isLogin ? 'Create one' : 'Sign in'}
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
