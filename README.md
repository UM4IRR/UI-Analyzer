# AI UX Analyzer

A production-ready SaaS application for automated UI/UX analysis using advanced heuristics, built with Next.js App Router, Tailwind CSS, Prisma, and BullMQ.

## 🧱 Architecture Overview

This platform utilizes a robust microservice-like architecture on top of Next.js:
- **Frontend Layer**: Next.js 14 App Router, ShadCN UI for premium SaaS components, and Framer Motion for animations.
- **API Layer**: Route handlers to authenticate requests and enqueue jobs.
- **Service & Worker Layer**: A background worker (`workers/analysis-worker.ts`) using BullMQ processes heavy UX analysis jobs (e.g., launching headless Puppeteer instances) without blocking the main web server.
- **Cache Layer**: Upstash Redis handles BullMQ messaging and aggressive caching for duplicate URL analysis requests.
- **Database Layer**: PostgreSQL (Supabase) accessed via Prisma ORM for type-safe database queries.

## 🚀 Setup & Deployment

### 1. Prerequisites
- Node.js 18+ (20.x recommended)
- A Supabase account (Free Tier) to get a PostgreSQL connection string
- An Upstash account (Free Tier) to get a Redis connection string
- Google Cloud Console for NextAuth Google OAuth Setup

### 2. Environment Variables
Clone the `.env.example` file to `.env` and fill in your variables:
```bash
cp .env.example .env
```
Ensure you have the following populated:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_URL`: Your Upstash Redis connection string.
- `NEXTAUTH_SECRET`: A secure random string (can be generated via `openssl rand -base64 32`).

### 3. Database Initialization
Run the Prisma migrations to set up the DB schema:
```bash
npx prisma generate
npx prisma db push
```

### 4. Running the Project Locally
Start the Next.js frontend and API routes:
```bash
npm install
npm run dev
```

**IMPORTANT:** The analysis engine relies on a background worker. You must run the worker in a separate terminal:
```bash
npm run worker
```

### 5. Deployment
This project is configured out-of-the-box for deployment on **Vercel**.
1. Connect your Github repository to Vercel.
2. Add your environment variables in the Vercel dashboard.
3. Deploy the application.
4. Remember that the **worker** must be deployed somewhere that supports long-running Node.js processes (e.g., a small Render/Railway instance or a custom VPS) using the command `npm run worker`.

## 📜 Core Workflow
1. User logs in (Google / Credentials).
2. User submits a URL on the `/dashboard/new` page.
3. The API checks the Redis **Cache**. If a cached report exists for that URL, it is returned instantly.
4. If not, the API enqueues a job in BullMQ and responds with a `jobId`.
5. The frontend polls `/api/status/:jobId`.
6. Concurrently, the worker process picks up the job, captures a screenshot using **Puppeteer**, evaluates UX heuristically, and saves the data to Prisma.
7. Upon completion, the UI redirects to the heavily detailed **Results Page** featuring animated radial scores and export-to-PDF functionality.
