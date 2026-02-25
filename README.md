# Home Finance Tracker (Next.js + Turso + Drizzle)

A Next.js app to migrate household finances from Excel into a lightweight web app, now backed by Turso with Drizzle ORM.

## Features

- Dashboard cards for income, expenses, and remaining balance
- Add transactions manually
- Paste CSV copied from Excel (`date,category,note,amount,type`)
- View transaction history and expense breakdown by category
- Turso database integration with Drizzle schema and query layer
- Scripts to create tables and seed starter data

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Turso credentials in `.env.local`:

   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `HOUSE_ID`
   - `JWT_SECRET`
   - `JWT_ISSUER` (optional)
   - `JWT_AUDIENCE` (optional)
   - `AUTH_USERNAME`
   - `AUTH_PASSWORD`
   - `AUTH_SESSION_TTL_HOURS` (optional)

4. Initialize the database schema and seed data:

   ```bash
   npm run db:init
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Then open <http://localhost:3000>.

## Database scripts

- `npm run db:push` — create/update tables in Turso from the Drizzle schema
- `npm run db:seed` — clear and seed transactions
- `npm run db:init` — run `db:push` then `db:seed`

## Auth bootstrap

All routes are protected by auth middleware except the public sign-in route (`/sign-in`) and sign-in API (`/api/sign-in`).

- Sign-in credentials are read from env (`AUTH_USERNAME` and `AUTH_PASSWORD`).
- Successful sign-in issues an HTTP-only JWT cookie signed using `JWT_SECRET` (+ optional issuer/audience).
- Account reads/writes are scoped to `HOUSE_ID` to future-proof multi-household data separation.
