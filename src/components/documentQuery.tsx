// src/components/DocumentQuery.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface QueryResult {
  answer: string;
  sources: string[];
  fromAgent: boolean;
}

export function DocumentQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [useAgent, setUseAgent] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/ai/query-documents`, {
        question: query,
        use_agent: useAgent
      });

      setResult({
        answer: response.data.answer,
        sources: response.data.sources || [],
        fromAgent: response.data.from_agent
      });
    } catch (error) {
      setResult({
        answer: '❌ Failed to query documents. Make sure you uploaded a file first!',
        sources: [],
        fromAgent: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        🔍 Ask About Your Data
      </h2>

      {/* Query Input */}
      <div className="space-y-3 mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleQuery();
          }}
          placeholder="Ask anything about your uploaded data..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useAgent}
              onChange={(e) => setUseAgent(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">
              Use AI Agent (for complex analysis)
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

      {/* Result */}
      {result && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-xs font-medium text-purple-600 mb-2">
              {result.fromAgent ? '🤖 AI Agent Analysis' : '🔍 Search Results'}
            </p>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {result.answer}
            </p>
          </div>

          {result.sources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
              <div className="space-y-1">
                {result.sources.map((source, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    📄 {source}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}