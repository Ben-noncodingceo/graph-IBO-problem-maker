# BioOlyAI - Biology Olympiad Intelligent Question Generator

BioOlyAI is an intelligent auxiliary training tool designed for Biology Olympiads (IBO level). It leverages multi-modal large models (Gemini, GPT-4, DeepSeek, etc.) to automatically generate high-quality competition questions based on the latest academic literature.

## Project Structure

- `frontend/`: React + Vite + Tailwind CSS application hosted on Cloudflare Pages.
- `backend/`: Cloudflare Workers (TypeScript) handling API requests, AI model routing, and database interactions.
- `.github/workflows/`: CI/CD pipeline for automated deployment to Cloudflare.

## Setup Instructions

### Prerequisites

- Node.js & npm
- Cloudflare Account
- Wrangler CLI (`npm install -g wrangler`)

### 1. Database Setup (Cloudflare D1)

Initialize the D1 database:

```bash
cd backend
wrangler d1 create bio-db
```

Copy the `database_id` from the output and update `backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "bio-db"
database_id = "YOUR-DATABASE-ID-HERE"
```

Apply the schema:

```bash
wrangler d1 execute bio-db --local --file=schema.sql
# For remote
wrangler d1 execute bio-db --remote --file=schema.sql
```

### 2. Storage Setup (Cloudflare R2)

Create the R2 bucket:

```bash
wrangler r2 bucket create bio-images
```

### 3. Environment Variables

Set the following secrets in your Cloudflare Worker:

```bash
cd backend
wrangler secret put GEMINI_API_KEY
wrangler secret put OPENAI_API_KEY
# ... other keys
```

### 4. Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

## Deployment

Push to the `main` branch to trigger the GitHub Action deployment.
Ensure you have set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in your GitHub Repository Secrets.
