# Finance Dashboard

The web frontend for an AI-powered personal finance app. Track income and expenses, then ask an AI assistant about your spending, run agent-based financial analyses, and query your own bank statements with RAG.

**Live demo:** [finance-dashboard-topaz-seven.vercel.app](https://finance-dashboard-topaz-seven.vercel.app) · **Backend:** [finance-tracker-api](https://github.com/kritagyasuryavanshi/finance-tracker-api) (FastAPI, LangChain, LangGraph, CrewAI)

![Overview with income, spending, savings rate and a breakdown of where the money went](docs/dashboard.png)

## Features

**Try it without signing up.** "Try the demo with sample data" opens a private demo account with two months of transactions.

**Overview**
- Income, spending, balance and savings rate in rupees
- "Where your money went": every category as a share of income, with what's left saved

**Transactions**
- Add income and expenses with category suggestions; search and filter; delete with confirmation

**AI assistant**
- Chat about your own finances (Gemini), with suggested questions and formatted answers
- One-click summary of patterns and next steps

**AI agents**
- **Health check:** a LangGraph agent scores your finances and takes a different path for healthy vs at-risk results
- **Crew report:** three CrewAI agents (analyst, advisor, writer) produce a monthly report, with live progress

**Bank statements**
- Upload a CSV (sample included), then ask questions answered from the matching rows (RAG) or by a ReAct agent with tools; answers show which rows they used

**Built for real use**
- Works on phones (bottom tab bar, stacked rows), keyboard accessible, wakes a sleeping free-tier server with a clear notice

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**, Manrope, lucide icons
- **react-markdown** for AI answers
- **Axios** client with JWT interceptor, timeouts and friendly error messages
- React Context for auth, `useTransactions` hook for data

## Project structure

```
src/
├── app/
│   ├── page.tsx            # app shell: sidebar / mobile tabs + views
│   ├── login/page.tsx
│   └── signup/page.tsx
├── components/
│   ├── AuthScreen.tsx      # sign in / sign up / demo, server wake-up notice
│   ├── Overview.tsx        # totals and "where your money went"
│   ├── Transactions.tsx
│   ├── Assistant.tsx       # chat + summary
│   ├── Agents.tsx          # LangGraph and CrewAI runs with progress
│   ├── Documents.tsx       # CSV upload + RAG / agent questions
│   └── ui.tsx              # shared buttons, panels, markdown
├── context/AuthContext.tsx
├── hooks/useTransactions.ts
└── lib/
    ├── api.ts              # typed API client
    └── format.ts           # rupee and date formatting
```

## Run it locally

Start the [backend](https://github.com/kritagyasuryavanshi/finance-tracker-api) first, then:

```bash
git clone https://github.com/kritagyasuryavanshi/finance-dashboard
cd finance-dashboard
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                   # http://localhost:3000
```
