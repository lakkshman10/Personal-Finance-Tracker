# Personal Finance Tracker

A full-stack personal finance application for tracking expenses, budgets, accounts, debts, savings goals, income, reports, and financial information.

## Architecture

```text
React frontend
      │
      ▼
Node.js / Express REST API
      │
      ▼
Controllers → Services → Repositories
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
```

PostgreSQL is the application's datastore. Prisma manages the database schema and migrations.

## Tech stack

- **Frontend:** React, React Router, Redux Toolkit, Bootstrap, Recharts
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT access tokens + HttpOnly refresh-token cookies
- **PWA:** Create React App service worker

## Current features

- User signup, signin, session refresh, logout, and account management
- Expense tracking with categories, accounts, editing, deletion, and visualizations
- Income tracking
- Budget creation, alerts, adjustments, and spending analysis
- Savings goals and contributions
- Debt management and debt payments
- Account and category management
- Reports and spending insights
- Finance news integration
- Dashboard with financial summaries and charts
- Community, Contact, and Finance Assistant UI foundations

## Security and reliability

The backend currently includes:

- Persistent refresh-session storage with token rotation and revocation
- User-scoped database access and ownership checks
- Atomic operations for sensitive financial/authentication workflows
- Database constraints for key financial invariants
- Centralized API error handling
- Request body size limits
- Authentication and global API rate limiting
- Input and amount validation
- Protected transaction, transfer, debt-payment, budget, and savings-goal workflows

## Database

Prisma schema and migrations are located in `finance-tracker-backend/prisma`.

Core entities include:

- Users and refresh sessions
- Accounts
- Categories
- Transactions and transfers
- Budgets and budget adjustments
- Savings goals and contributions
- Debts and debt payments

Financial amounts use PostgreSQL `NUMERIC(14,2)` and identifiers use UUIDs.

## Local development

### Backend

```bash
cd finance-tracker-backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Configure the required environment variables using `.env.example`.

### Frontend

```bash
cd finance-tracker
npm install
npm start
```

The frontend expects the backend API URL through `REACT_APP_API_URL`. If it is not set, development defaults to `http://localhost:5000/api`.

## Testing

Backend tests:

```bash
cd finance-tracker-backend
npm test
```

Frontend tests:

```bash
cd finance-tracker
npm test
```

Build the production frontend with:

```bash
npm run build
```

## Project structure

```text
Personal-Finance-Tracker/
├── finance-tracker/                 # React frontend
└── finance-tracker-backend/         # Express API, Prisma and PostgreSQL
```

## Roadmap

Remaining work is primarily stabilization, testing, UX refinement, and production readiness. New financial features should be added only after the existing workflows are sufficiently tested and stable.
