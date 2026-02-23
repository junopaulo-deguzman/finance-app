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
