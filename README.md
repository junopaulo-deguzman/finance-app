# Home Finance Tracker (Next.js)

A starter Next.js app to migrate household finances from Excel into a lightweight web app.

## Features

- Dashboard cards for income, expenses, and remaining balance
- Add transactions manually
- Paste CSV copied from Excel (`date,category,note,amount,type`)
- View transaction history and expense breakdown by category

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Suggested next steps

- Add persistent storage with SQLite/Supabase/Firebase
- Add authentication for both partners
- Add monthly budgets and recurring transactions
