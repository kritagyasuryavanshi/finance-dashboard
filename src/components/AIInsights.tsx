// src/components/AIInsights.tsx
'use client';

import { useState } from 'react';
import { aiAPI, ChatMessage } from '@/lib/api';
// ↑ Import ChatMessage type

export function AIInsights() {
    const [insights, setInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // ↑ Was Message[], now ChatMessage[] from api.ts
    const [input, setInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [error, setError] = useState('');

    const fetchInsights = async () => {
        setLoadingInsights(true);
        setError('');
        try {
            const data = await aiAPI.getInsights();
            setInsights(data.response);
        } catch {
            setError('Failed to get insights. Add some transactions first!');
        } finally {
            setLoadingInsights(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');

        const updatedMessages: ChatMessage[] = [
            ...messages,
            { role: 'user', content: userMessage }
        ];
        setMessages(updatedMessages);
        setLoadingChat(true);

        try {
            const data = await aiAPI.chat(userMessage, updatedMessages);
            // ↑ Pass updatedMessages (includes current message)
            setMessages([
                ...updatedMessages,
                { role: 'assistant', content: data.response }
            ]);
        } catch {
            setMessages([
                ...updatedMessages,
                { role: 'assistant', content: '❌ Failed to respond. Try again!' }
            ]);
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            🤖 AI Financial Insights
                        </h2>
                        <p className="text-sm text-gray-500">AI analyzes your spending</p>
                    </div>
                    <button
                        onClick={fetchInsights}
                        disabled={loadingInsights}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-medium"
                    >
                        {loadingInsights ? '🔄 Analyzing...' : '✨ Analyze My Finances'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {insights ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                            {insights}
                        </p>
                    </div>
                ) : (
                    !loadingInsights && (
                        <div className="text-center text-gray-400 py-8">
                            <p className="text-4xl mb-3">✨</p>
                            <p>Click to get AI insights</p>
                        </div>
                    )
                )}
            </div>

            {/* AI Chat */}
            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    💬 Chat With Your Finance AI
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Ask anything about your finances
                </p>

                <div className="bg-gray-50 rounded-lg p-4 h-72 overflow-y-auto mb-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-3xl mb-2">💬</p>
                            <p className="text-sm">Ask me about your finances!</p>
                            <div className="mt-3 space-y-1 text-xs text-center">
                                <p>&ldquo;Where am I overspending?&rdquo;</p>
                                <p>&ldquo;How can I save more money?&rdquo;</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.role === 'assistant' && (
                                    <span className="text-purple-600 font-medium text-xs block mb-1">
                                        🤖 FinanceAI
                                    </span>
                                )}
                                <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {loadingChat && (
                        <div className="flex justify-start">
                            <div className="bg-white border px-4 py-3 rounded-lg text-sm text-gray-500">
                                <span className="animate-pulse">🤖 Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about your finances..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loadingChat || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 font-medium"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}