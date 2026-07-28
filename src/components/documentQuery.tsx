// src/components/DocumentQuery.tsx
'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';

export function DocumentQuery() {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [sources, setSources] = useState<string[]>([]);
    const [fromAgent, setFromAgent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [useAgent, setUseAgent] = useState(false);

    const handleQuery = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setAnswer('');

        try {
            const data = await aiAPI.queryDocuments(query, useAgent);
            setAnswer(data.answer);
            setSources(data.sources || []);
            setFromAgent(data.from_agent);
        } catch {
            setAnswer('❌ Failed to query. Make sure you uploaded a file first!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🔍 Ask About Your Data
            </h2>

            <div className="space-y-3 mb-4">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything about your uploaded data..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                />

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useAgent}
                            onChange={(e) => setUseAgent(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">
                            Use AI Agent (complex analysis)
                        </span>
                    </label>

                    <button
                        onClick={handleQuery}
                        disabled={!query.trim() || loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 font-medium"
                    >
                        {loading ? '⏳ Analyzing...' : '🔍 Search'}
                    </button>
                </div>
            </div>

            {answer && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-purple-600 mb-2">
                        {fromAgent ? '🤖 AI Agent Analysis' : '🔍 Search Result'}
                    </p>
                    <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                        {answer}
                    </p>
                    {sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-xs font-medium text-gray-600 mb-1">Sources:</p>
                            {sources.map((s, i) => (
                                <p key={i} className="text-xs text-gray-500">📄 {s}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}