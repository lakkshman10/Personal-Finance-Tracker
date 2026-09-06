# Personal Finance Tracker

A full-stack personal finance application for tracking expenses, managing budgets, visualizing spending, and progressively adding income, savings, reports, and financial assistance features.

## Current architecture

```text
React frontend
      │
      ▼
Node.js / Express REST API
      │
      ▼
Services + Repositories
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
```

**PostgreSQL is now the single application datastore for authentication and financial data. MongoDB/Mongoose is no longer used by the backend runtime.**

## Implemented

- React Router application and PWA foundation
- Signup/signin with JWT authentication
- PostgreSQL user accounts via Prisma
- Access-token refresh with HttpOnly refresh cookie
- Expense Tracker backed by PostgreSQL transactions
- Expense CRUD and current-month/category visualizations
- Monthly expense trends derived from transactions
- PostgreSQL accounts and categories
- Budget CRUD backed by PostgreSQL
- Budget adjustment history and one-adjustment business rule
- Dashboard derived from PostgreSQL transactions and budgets
- Finance News page and backend proxy
- Redux state-management foundation
- Community, Contact, and Finance Assistant foundations

## Database

Prisma schema and migrations live under `finance-tracker-backend/prisma`.

Core tables:

- `users`
- `accounts`
- `categories`
- `transactions`
- `budgets`
- `budget_adjustments`

Money is stored as PostgreSQL `NUMERIC(14,2)`, identifiers are UUIDs, and transaction dates are stored separately from timestamps.

## Local setup

### Backend

```bash
cd finance-tracker-backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Configure `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and any required news API key in `.env` using `.env.example` as the template.

### Frontend

```bash
cd finance-tracker
npm install
npm start
```

## PostgreSQL migration verification

After the migration, sign in again so the browser receives a JWT containing the PostgreSQL user UUID. Then verify:

1. Signup/signin
2. Protected route after refresh
3. Expense create/edit/delete and persistence
4. Dashboard updates
5. Budget create/delete and persistence
6. Token refresh
7. `GET /api/health/db`
8. Backend startup with MongoDB stopped

## Future work

Income tracking, savings goals, reports and insights, debt management, recurring transactions, richer account management, and production hardening remain separate feature work.
