// src/components/DocumentUpload.tsx
'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';

export function DocumentUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected?.name.endsWith('.csv')) {
            setFile(selected);
            setMessage('');
        } else {
            setMessage('❌ Please select a CSV file');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setMessage('');

        try {
            const data = await aiAPI.uploadDocument(file);
            setSuccess(data.success);
            setMessage(data.success ? `✅ ${data.message}` : `❌ ${data.message}`);
            if (data.success) setFile(null);
        } catch {
            setMessage('❌ Upload failed. Please try again.');
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📁 Upload Financial Data
            </h2>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <label className="flex flex-col items-center cursor-pointer">
                        <span className="text-2xl mb-2">📄</span>
                        <span className="text-sm font-medium text-gray-700">
                            Click to select CSV file
                        </span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {file && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900">✓ {file.name}</p>
                        <p className="text-xs text-blue-700">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                        success
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-medium"
                >
                    {loading ? '⏳ Uploading...' : '📤 Upload File'}
                </button>

                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                        📝 Any CSV format works! Examples:
                    </p>
                    <code className="text-xs text-gray-600 block">
                        Date,Category,Amount,Type{'\n'}
                        2024-01-01,Food,500,expense
                    </code>
                </div>
            </div>
        </div>
    );
}