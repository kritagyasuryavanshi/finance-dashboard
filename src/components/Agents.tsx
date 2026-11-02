// src/components/Agents.tsx
// The two agent-based analyses, each explaining how it works while it runs.
'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { aiAPI, DeepAnalysis, errorMessage } from '@/lib/api';
import { Button, ErrorNote, Markdown, Panel, PanelHeader } from './ui';

interface Step {
    label: string;
    at: number; // seconds after start when this step is likely running
}

const GRAPH_STEPS: Step[] = [
    { label: 'Load your transactions', at: 0 },
    { label: 'Analyse spending by category', at: 2 },
    { label: 'Score financial health', at: 9 },
    { label: 'Write the report for that result', at: 11 },
];

const CREW_STEPS: Step[] = [
    { label: 'Data analyst crunches the numbers', at: 0 },
    { label: 'Financial advisor drafts recommendations', at: 22 },
    { label: 'Report writer assembles the final report', at: 42 },
];

function Progress({ steps }: { steps: Step[] }) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const started = Date.now();
        const id = setInterval(() => setElapsed((Date.now() - started) / 1000), 500);
        return () => clearInterval(id);
    }, []);
    const current = steps.reduce((idx, s, i) => (elapsed >= s.at ? i : idx), 0);

    return (
        <ol className="space-y-2.5" aria-live="polite">
            {steps.map((s, i) => (
                <li key={s.label} className={`flex items-center gap-3 text-sm ${i > current ? 'text-muted' : ''}`}>
                    {i < current ? (
                        <Check className="h-4 w-4 text-teal" aria-hidden />
                    ) : i === current ? (
                        <span className="mx-[3px] h-2.5 w-2.5 animate-pulse rounded-full bg-teal" aria-hidden />
                    ) : (
                        <span className="mx-[3px] h-2.5 w-2.5 rounded-full border border-line" aria-hidden />
                    )}
                    {s.label}
                </li>
            ))}
            <li className="pt-1 text-xs text-muted">{Math.floor(elapsed)} s elapsed</li>
        </ol>
    );
}

function AgentPanel({
    title,
    description,
    how,
    duration,
    steps,
    hasData,
    run,
}: {
    title: string;
    description: string;
    how: string[];
    duration: string;
    steps: Step[];
    hasData: boolean;
    run: () => Promise<{ text: string; badge?: { label: string; good: boolean } }>;
}) {
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<{ text: string; badge?: { label: string; good: boolean } } | null>(null);
    const [error, setError] = useState('');

    const start = async () => {
        setBusy(true);
        setError('');
        try {
            setResult(await run());
        } catch (err) {
            setError(errorMessage(err, 'The analysis failed. Try again.'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Panel>
            <PanelHeader title={title} description={description} />
            <div className="space-y-5 px-5 py-5">
                {!result && !busy && (
                    <>
                        <div>
                            <p className="text-sm font-semibold">How it works</p>
                            <ul className="mt-2 space-y-1.5 text-sm text-muted">
                                {how.map((h) => (
                                    <li key={h} className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={start} disabled={!hasData}>
                                Run {title.toLowerCase()}
                            </Button>
                            <span className="text-xs text-muted">Takes {duration}</span>
                        </div>
                        {!hasData && <p className="text-sm text-muted">Add some transactions first.</p>}
                    </>
                )}
                {busy && <Progress steps={steps} />}
                {error && <ErrorNote>{error}</ErrorNote>}
                {result && (
                    <>
                        {result.badge && (
                            <p
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                    result.badge.good ? 'bg-teal-soft text-teal' : 'bg-amber-soft text-[#7a4f12]'
                                }`}
                            >
                                {result.badge.label}
                            </p>
                        )}
                        <Markdown>{result.text}</Markdown>
                        <Button variant="secondary" onClick={start} loading={busy}>
                            Run again
                        </Button>
                    </>
                )}
            </div>
        </Panel>
    );
}

export function Agents({ hasData }: { hasData: boolean }) {
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <AgentPanel
                title="Health check"
                description="A LangGraph agent that adapts its report to your result."
                how={[
                    'Loads your transactions and analyses spending by category',
                    'Scores your financial health from your savings rate',
                    'Takes a different path depending on the score: encouragement if healthy, an action plan if not',
                ]}
                duration="about 15 seconds"
                steps={GRAPH_STEPS}
                hasData={hasData}
                run={async () => {
                    const r: DeepAnalysis = await aiAPI.deepAnalysis();
                    const healthy = r.financial_health === 'healthy';
                    return {
                        text: r.final_output,
                        badge: { label: healthy ? 'Healthy finances' : 'Needs attention', good: healthy },
                    };
                }}
            />
            <AgentPanel
                title="Crew report"
                description="Three CrewAI agents with different roles write one report together."
                how={[
                    'A data analyst totals your spending by category and spots patterns',
                    'A financial advisor turns those findings into recommendations',
                    'A report writer combines both into a monthly report',
                ]}
                duration="about a minute"
                steps={CREW_STEPS}
                hasData={hasData}
                run={async () => ({ text: (await aiAPI.crewAnalysis()).report })}
            />
        </div>
    );
}
