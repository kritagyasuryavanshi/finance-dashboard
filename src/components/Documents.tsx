// src/components/Documents.tsx
// Upload a CSV statement, then ask questions about it (RAG or the ReAct agent).
'use client';

import { DragEvent, FormEvent, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { aiAPI, errorMessage } from '@/lib/api';
import { Button, ErrorNote, inputClass, Markdown, Panel, PanelHeader } from './ui';

export function Documents() {
    const fileInput = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState('');
    const [uploadError, setUploadError] = useState('');

    const [question, setQuestion] = useState('');
    const [mode, setMode] = useState<'rag' | 'agent'>('rag');
    const [asking, setAsking] = useState(false);
    const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
    const [askError, setAskError] = useState('');

    const pick = (f: File | undefined) => {
        if (!f) return;
        setUploadError('');
        if (!f.name.toLowerCase().endsWith('.csv')) return setUploadError('Choose a .csv file.');
        if (f.size > 5 * 1024 * 1024) return setUploadError('That file is over 5 MB.');
        setFile(f);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        pick(e.dataTransfer.files?.[0]);
    };

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadError('');
        try {
            const res = await aiAPI.uploadDocument(file);
            if (res.success) {
                setUploaded(res.message);
                setFile(null);
                setAnswer(null);
            } else setUploadError(res.message);
        } catch (err) {
            setUploadError(errorMessage(err, "Couldn't upload the file."));
        } finally {
            setUploading(false);
        }
    };

    const ask = async (e: FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;
        setAsking(true);
        setAskError('');
        try {
            const res = await aiAPI.queryDocuments(question.trim(), mode === 'agent');
            setAnswer({ text: res.answer, sources: res.sources ?? [] });
        } catch (err) {
            setAskError(errorMessage(err, "Couldn't answer that. Try again."));
        } finally {
            setAsking(false);
        }
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
            <Panel className="h-fit">
                <PanelHeader title="Your statement" description="Upload a bank statement as CSV. It replaces any earlier upload." />
                <div className="space-y-4 px-5 py-5">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInput.current?.click()}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
                        role="button"
                        tabIndex={0}
                        className={`flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                            dragging ? 'border-teal bg-teal-soft' : 'border-line hover:border-teal/60'
                        }`}
                    >
                        <UploadCloud className="h-7 w-7 text-muted" aria-hidden />
                        <p className="mt-2 text-sm font-semibold">{file ? file.name : 'Drop a CSV here or click to choose'}</p>
                        <p className="mt-0.5 text-xs text-muted">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Up to 5 MB, with a header row'}</p>
                        <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
                    </div>

                    {uploadError && <ErrorNote>{uploadError}</ErrorNote>}
                    {uploaded && !file && (
                        <p className="flex items-center gap-2 text-sm text-teal" role="status">
                            <FileText className="h-4 w-4" /> {uploaded}
                        </p>
                    )}

                    <Button className="w-full" onClick={upload} loading={uploading} disabled={!file}>
                        Upload and index
                    </Button>
                    <a href="/sample-statement.csv" download className="block text-center text-sm font-semibold text-teal hover:underline">
                        Download a sample statement
                    </a>
                </div>
            </Panel>

            <Panel>
                <PanelHeader title="Ask about your statement" description="Answers cite the rows they came from." />
                <form onSubmit={ask} className="space-y-4 px-5 py-5">
                    <div className="inline-flex rounded-lg border border-line bg-paper p-1" role="radiogroup" aria-label="Answer mode">
                        {[
                            { id: 'rag' as const, label: 'Search and answer' },
                            { id: 'agent' as const, label: 'Agent with tools' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                role="radio"
                                aria-checked={mode === m.id}
                                onClick={() => setMode(m.id)}
                                className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                                    mode === m.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted">
                        {mode === 'rag'
                            ? 'Finds the most relevant rows and answers from them (RAG). Best for specific questions.'
                            : 'A ReAct agent picks tools to search, total by category or summarise. Best for multi-step questions.'}
                    </p>
                    <div className="flex gap-2">
                        <input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className={inputClass}
                            placeholder="How much did I spend on food delivery?"
                            aria-label="Question"
                            maxLength={1000}
                        />
                        <Button type="submit" loading={asking} disabled={!question.trim()}>
                            Ask
                        </Button>
                    </div>
                    {askError && <ErrorNote>{askError}</ErrorNote>}
                    {answer && (
                        <div className="rounded-lg border border-line bg-paper px-4 py-4">
                            <Markdown>{answer.text}</Markdown>
                            {answer.sources.length > 0 && (
                                <div className="mt-4 border-t border-line pt-3">
                                    <p className="text-xs font-semibold text-muted">Based on</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {answer.sources.map((s) => (
                                            <span key={s} className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-muted">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </Panel>
        </div>
    );
}
