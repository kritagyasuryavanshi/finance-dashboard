// src/components/Assistant.tsx
// Chat about your own finances, plus a one-click summary.
'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { aiAPI, ChatMessage, errorMessage } from '@/lib/api';
import { Button, ErrorNote, inputClass, Markdown, Panel, PanelHeader } from './ui';

const STARTERS = [
    'Where am I spending the most?',
    'How much could I save each month?',
    'Is my rent too high for my income?',
    'Suggest a monthly budget for me',
];

export function Assistant({ hasData }: { hasData: boolean }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const [summary, setSummary] = useState('');
    const [summaryBusy, setSummaryBusy] = useState(false);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, thinking]);

    const send = async (text: string) => {
        const message = text.trim();
        if (!message || thinking) return;
        const history = messages;
        setMessages([...history, { role: 'user', content: message }]);
        setInput('');
        setError('');
        setThinking(true);
        try {
            const { response } = await aiAPI.chat(message, history);
            setMessages((m) => [...m, { role: 'assistant', content: response }]);
        } catch (err) {
            setError(errorMessage(err, "The assistant couldn't answer. Try again."));
            setMessages(history);
            setInput(message);
        } finally {
            setThinking(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        send(input);
    };

    const getSummary = async () => {
        setSummaryBusy(true);
        setError('');
        try {
            setSummary((await aiAPI.getInsights()).response);
        } catch (err) {
            setError(errorMessage(err, "Couldn't get a summary. Try again."));
        } finally {
            setSummaryBusy(false);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <Panel className="flex min-h-[32rem] flex-col">
                <PanelHeader title="Ask about your money" description="Answers use your own transactions. Powered by Gemini." />

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
                    {messages.length === 0 && (
                        <div className="py-6">
                            <p className="text-sm text-muted">Try one of these, or ask anything:</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {STARTERS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        disabled={!hasData}
                                        className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:border-teal hover:text-teal disabled:opacity-50"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            {!hasData && <p className="mt-4 text-sm text-muted">Add a few transactions first so the assistant has something to work with.</p>}
                        </div>
                    )}

                    {messages.map((m, i) =>
                        m.role === 'user' ? (
                            <div key={i} className="flex justify-end">
                                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-white">{m.content}</p>
                            </div>
                        ) : (
                            <div key={i} className="max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-paper px-4 py-3">
                                <Markdown>{m.content}</Markdown>
                            </div>
                        )
                    )}
                    {thinking && (
                        <p className="inline-flex items-center gap-2 rounded-2xl border border-line bg-paper px-4 py-2.5 text-sm text-muted">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" /> Reading your transactions…
                        </p>
                    )}
                    <div ref={endRef} />
                </div>

                {error && <div className="px-5 pb-3"><ErrorNote>{error}</ErrorNote></div>}

                <form onSubmit={onSubmit} className="flex gap-2 border-t border-line px-5 py-4">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className={inputClass}
                        placeholder="Ask a question about your spending"
                        aria-label="Message"
                        maxLength={2000}
                        disabled={thinking}
                    />
                    <Button type="submit" className="px-3" disabled={!input.trim() || thinking} aria-label="Send">
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                </form>
            </Panel>

            <Panel className="h-fit">
                <PanelHeader title="Quick summary" description="Patterns, top spending areas and three things to do next." />
                <div className="px-5 py-5">
                    {summary ? (
                        <Markdown>{summary}</Markdown>
                    ) : (
                        <Button variant="secondary" className="w-full" loading={summaryBusy} disabled={!hasData} onClick={getSummary}>
                            <Sparkles className="h-4 w-4" /> Summarise my finances
                        </Button>
                    )}
                    {summary && (
                        <Button variant="ghost" className="mt-3 -ml-3" loading={summaryBusy} onClick={getSummary}>
                            Refresh summary
                        </Button>
                    )}
                </div>
            </Panel>
        </div>
    );
}
