# Project Status

**Project:** Personal Finance Tracker  
**Repository:** `lakkshman10/Personal-Finance-Tracker`  
**Branch:** `main`  
**Last reviewed:** 2026-09-06

## Current state

The application uses **PostgreSQL + Prisma as its financial and authentication datastore**. MongoDB/Mongoose has been removed from the runtime architecture.

- React frontend
- Node.js/Express backend
- PostgreSQL via Prisma
- JWT authentication with PostgreSQL user IDs
- Expense Tracker backed by PostgreSQL transactions
- Dashboard backed by PostgreSQL transactions and budgets
- Budgeting backed by PostgreSQL budgets/categories
- PostgreSQL accounts and categories
- Finance news proxy
- Redux/PWA foundation

## Financial migration status

| Area | Status | Notes |
| --- | --- | --- |
| PostgreSQL schema | ✅ Complete | Users, accounts, categories, transactions, budgets, budget adjustments |
| Prisma migrations | ✅ Complete | Foundation migration applied |
| System categories | ✅ Complete | Default expense categories seeded |
| Authentication | ✅ Migrated | Signup, signin, check, refresh and logout use PostgreSQL |
| Expense Tracker | ✅ Migrated | Create, read, edit, delete, charts and trends use PostgreSQL |
| Dashboard | ✅ Migrated | Derived from PostgreSQL transactions/budgets |
| Budgeting | ✅ Migrated | PostgreSQL CRUD with adjustment history/rules |
| Finance API client | ✅ Complete | Centralized PostgreSQL financial API access |
| MongoDB runtime connection | ✅ Removed | No connection is started by the server |
| MongoDB financial models | ✅ Removed | Legacy models/controllers/routes deleted |
| Mongoose dependency | ✅ Removed | Removed from backend package manifest |

## Pages

- Dashboard — active, PostgreSQL-backed
- Expense Tracker — active, PostgreSQL-backed
- Budgeting — active, PostgreSQL-backed
- Finance News — active
- Finance Assistant — foundation
- Community — active UI
- Contact — active UI
- Income Tracking — placeholder for future income features
- Savings Goals — placeholder for future savings-goal features
- Reports & Insights — placeholder for future reporting features

## Architecture

```text
React Frontend
    │
    ▼
REST API / Express
    │
    ▼
Controllers / Services / Repositories
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
```

MongoDB is no longer part of this request path.

## Important post-migration test

After pulling/running the latest code, sign in again so the browser receives a JWT containing the PostgreSQL UUID. Then verify signup/signin, Expense Tracker CRUD, Dashboard, Budgeting CRUD, refresh-token flow, and `/api/health/db` with MongoDB stopped.

## Future work

Income tracking, savings goals, reports/insights, debt management, richer account management, recurring transactions, and production hardening remain separate feature work and are not required for the PostgreSQL cutover.
