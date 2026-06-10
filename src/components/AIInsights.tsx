// src/components/AIInsights.tsx
/**
 * AI Features Component
 * 
 * Contains:
 * 1. AI Insights button + display
 * 2. AI Chat interface
 * 
 * This is a CLIENT component (has interactivity)
 * 'use client' = runs in browser, not server
 */

'use client';

import { useState } from 'react';
// useState = React hook for managing component state
// We need it because this component has:
// - Loading states
// - User input
// - AI responses

import axios from 'axios';
// axios = HTTP client
// Same library we used in useTransactions hook

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────
interface Message {
    role: 'user' | 'assistant';
    // ↑ Only these two values allowed
    content: string;
}
// This represents one chat message
// Same pattern as OpenAI/Gemini message format


// ─────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────
export function AIInsights() {
    
    // ── STATE ──────────────────────────
    
    const [insights, setInsights] = useState<string>('');
    // ↑ Stores the AI insights text
    // Starts empty, filled when user clicks analyze
    
    const [loadingInsights, setLoadingInsights] = useState(false);
    // ↑ True while waiting for AI response
    // Shows "Analyzing..." on button
    
    const [messages, setMessages] = useState<Message[]>([]);
    // ↑ Array of all chat messages
    // Grows as user chats with AI
    
    const [input, setInput] = useState('');
    // ↑ Current text in chat input box
    // Clears after each message sent
    
    const [loadingChat, setLoadingChat] = useState(false);
    // ↑ True while waiting for AI chat response
    // Shows "Thinking..." bubble
    
    const [error, setError] = useState<string>('');
    // ↑ Error message if AI fails
    

    // ── FUNCTION 1: Get AI Insights ────
    
    const fetchInsights = async () => {
        setLoadingInsights(true);
        // ↑ Show loading state on button
        
        setError('');
        // ↑ Clear any previous errors
        
        try {
            const res = await axios.get(`${API_URL}/ai/insights`);
            // ↑ Call our FastAPI endpoint
            // GET /ai/insights
            // This triggers our Python code
            // which calls Gemini
            // which returns insights
            
            setInsights(res.data.response);
            // ↑ res.data = { response: "...", success: true }
            // .response = the AI text
            // setInsights = update state → re-render component
            
        } catch (err) {
            setError('Failed to get insights. Make sure you have transactions!');
            // ↑ Show user-friendly error
        } finally {
            setLoadingInsights(false);
            // ↑ ALWAYS runs (success or error)
            // Removes loading state from button
        }
    };
    

    // ── FUNCTION 2: Send Chat Message ──
    
    const sendMessage = async () => {
        
        // Don't send empty messages
        if (!input.trim()) return;
        // .trim() removes whitespace
        // "   " becomes "" which is falsy
        
        const userMessage = input.trim();
        // Save message text before clearing input
        
        setInput('');
        // ↑ Clear input box immediately
        // Good UX - feels responsive
        
        // Add user message to chat display
        const updatedMessages: Message[] = [
            ...messages,
            // ↑ spread = copy existing messages
            { role: 'user', content: userMessage }
            // Add new user message
        ];
        setMessages(updatedMessages);
        
        setLoadingChat(true);
        // ↑ Show "Thinking..." bubble
        
        try {
            const res = await axios.post(`${API_URL}/ai/chat`, {
                // ↑ POST request with body
                
                message: userMessage,
                // ↑ What user asked
                
                chat_history: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
                // ↑ Send previous messages as history
                // AI uses this for memory/context
                // Without this, AI forgets previous messages
            });
            
            // Add AI response to chat
            setMessages([
                ...updatedMessages,
                // ↑ Include user message we just added
                { role: 'assistant', content: res.data.response }
                // Add AI response
            ]);
            
        } catch (err) {
            // Show error as chat message
            setMessages([
                ...updatedMessages,
                {
                    role: 'assistant',
                    content: '❌ Sorry, I had trouble responding. Please try again!'
                }
            ]);
        } finally {
            setLoadingChat(false);
            // ↑ Remove "Thinking..." bubble
        }
    };
    

    // ── RENDER ─────────────────────────
    
    return (
        <div className="space-y-6">
        {/* space-y-6 = vertical spacing between children */}


            {/* ═══════════════════════════════ */}
            {/* SECTION 1: AI INSIGHTS         */}
            {/* ═══════════════════════════════ */}
            <div className="bg-white rounded-lg border p-6">
                
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                    
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            🤖 AI Financial Insights
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            AI analyzes your spending patterns
                        </p>
                    </div>
                    
                    {/* Analyze Button */}
                    <button
                        onClick={fetchInsights}
                        // ↑ Calls fetchInsights when clicked
                        
                        disabled={loadingInsights}
                        // ↑ Disable during loading (prevent double clicks)
                        
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-medium transition-colors"
                        // disabled:opacity-50 = faded when disabled
                        // transition-colors = smooth color change on hover
                    >
                        {loadingInsights ? '🔄 Analyzing...' : '✨ Analyze My Finances'}
                        {/* ↑ Ternary: show different text based on loading state */}
                    </button>
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                {/* AI Insights Display */}
                {insights ? (
                    // ↑ Only show if insights is not empty
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
                            {insights}
                            {/* whitespace-pre-line = respects line breaks in AI response */}
                            {/* leading-relaxed = more space between lines */}
                        </p>
                    </div>
                ) : (
                    // Empty state
                    !loadingInsights && (
                        <div className="text-center text-gray-400 py-8">
                            <p className="text-4xl mb-3">✨</p>
                            <p>Click "Analyze My Finances" to get AI insights</p>
                            <p className="text-xs mt-1">
                                Make sure you have transactions added first!
                            </p>
                        </div>
                    )
                )}
            </div>


            {/* ═══════════════════════════════ */}
            {/* SECTION 2: AI CHAT             */}
            {/* ═══════════════════════════════ */}
            <div className="bg-white rounded-lg border p-6">
                
                {/* Header */}
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    💬 Chat With Your Finance AI
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Ask anything about your finances
                </p>

                {/* Chat Messages Area */}
                <div className="bg-gray-50 rounded-lg p-4 h-72 overflow-y-auto mb-4 space-y-3">
                {/* h-72 = fixed height with scroll */}
                {/* overflow-y-auto = scroll when overflow */}
                
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-3xl mb-2">💬</p>
                            <p className="text-sm">Ask me about your finances!</p>
                            <div className="mt-3 space-y-1 text-xs text-center">
                                <p>"Where am I overspending?"</p>
                                <p>"How much did I spend on food?"</p>
                                <p>"How can I save more money?"</p>
                                <p>"What is my savings rate?"</p>
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            // ↑ key = unique identifier for React
                            
                            className={`flex ${
                                msg.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                                // ↑ User messages = right side
                                //   AI messages = left side
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border text-gray-800 rounded-bl-none'
                                    // ↑ User = blue bubble
                                    //   AI = white bubble
                                }`}
                            >
                                {/* AI label */}
                                {msg.role === 'assistant' && (
                                    <span className="text-purple-600 font-medium text-xs block mb-1">
                                        🤖 FinanceAI
                                    </span>
                                )}
                                
                                <p className="whitespace-pre-line leading-relaxed">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Thinking indicator */}
                    {loadingChat && (
                        <div className="flex justify-start">
                            <div className="bg-white border px-4 py-3 rounded-lg text-sm text-gray-500 rounded-bl-none">
                                <span className="animate-pulse">🤖 Thinking...</span>
                                {/* animate-pulse = fading animation */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        // ↑ Controlled input = React controls the value
                        
                        onChange={(e) => setInput(e.target.value)}
                        // ↑ Update state on every keystroke
                        
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') sendMessage();
                            // ↑ Send on Enter key press
                            // Better UX than only clicking button
                        }}
                        
                        placeholder="Ask about your finances..."
                        
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        // flex-1 = takes all available width
                        // focus:ring = purple border when focused
                    />
                    
                    <button
                        onClick={sendMessage}
                        disabled={loadingChat || !input.trim()}
                        // ↑ Disabled when loading OR input is empty
                        
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}