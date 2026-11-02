// src/app/layout.tsx
import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
    title: 'Finance Tracker: personal finance with AI agents',
    description:
        'Track income and spending, then ask an AI about it: RAG over your statements, a LangGraph agent and a CrewAI crew.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={manrope.variable}>
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
