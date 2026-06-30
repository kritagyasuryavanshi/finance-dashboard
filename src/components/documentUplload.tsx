// src/components/DocumentUpload.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UploadStatus {
  loading: boolean;
  success: boolean;
  message: string;
  documentsLoaded: number;
}

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({
    loading: false,
    success: false,
    message: '',
    documentsLoaded: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setStatus({
        loading: false,
        success: false,
        message: '',
        documentsLoaded: 0
      });
    } else {
      setStatus({
        loading: false,
        success: false,
        message: '❌ Please select a CSV file',
        documentsLoaded: 0
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus({
      loading: true,
      success: false,
      message: '📤 Uploading...',
      documentsLoaded: 0
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/ai/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setStatus({
          loading: false,
          success: true,
          message: `✅ ${response.data.message}`,
          documentsLoaded: response.data.documents_loaded
        });
        setFile(null);
      } else {
        setStatus({
          loading: false,
          success: false,
          message: `❌ ${response.data.message}`,
          documentsLoaded: 0
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message: '❌ Upload failed. Please try again.',
        documentsLoaded: 0
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        📁 Upload Financial Data
      </h2>

      <div className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label className="flex flex-col items-center cursor-pointer">
            <span className="text-2xl mb-2">📄</span>
            <span className="text-sm font-medium text-gray-700">
              Click to select CSV file
            </span>
            <span className="text-xs text-gray-500 mt-1">
              or drag and drop
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">
              ✓ Selected: {file.name}
            </p>
            <p className="text-xs text-blue-700">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Status Message */}
        {status.message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status.success
                ? 'bg-green-50 border border-green-200 text-green-800'
                : status.loading
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || status.loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 font-medium"
        >
          {status.loading ? '⏳ Uploading...' : '📤 Upload File'}
        </button>

        {/* Tips */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">📝 CSV Format:</p>
          <code className="text-xs text-gray-600 block">
            Date,Category,Amount,Type{'\n'}
            2024-01-01,Food,500,expense{'\n'}
            2024-01-02,Salary,5000,income
          </code>
        </div>
      </div>
    </div>
  );
}