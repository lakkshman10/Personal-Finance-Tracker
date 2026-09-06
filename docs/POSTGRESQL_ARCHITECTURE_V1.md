# Finance Tracker — PostgreSQL Architecture Specification v1

**Status:** Proposed
**Date:** 2026-09-06
**Target branch:** `architecture/postgresql-foundation`

## 1. Objective

Move the financial data foundation from MongoDB/Mongoose to PostgreSQL without rewriting the working React application unnecessarily.

The new design must support the current Expense + Budget functionality and provide a stable foundation for Accounts, Income, Savings Goals, Reports, Debts, Recurring Transactions, Financial Health, and future bank/UPI integrations.

## 2. Core architectural decision

PostgreSQL becomes the authoritative financial datastore. Financial facts are represented by a transaction ledger. Dashboard and reporting values are derived from transactions rather than stored as independent financial truth.

Target application flow:

```text
React
  -> REST API
  -> Controllers
  -> Services
  -> Repositories / Prisma
  -> PostgreSQL
```

The frontend API contract should remain as stable as practical during the migration.

## 3. Technology choice

### Database

PostgreSQL.

### ORM / data access

Prisma is the proposed ORM because it provides explicit schema management, migrations, typed access, relations, and a clean Node.js integration.

### Money

Use PostgreSQL `NUMERIC(14,2)` for monetary amounts. Do not use JavaScript floating-point arithmetic as the database representation of financial values.

### IDs

Use UUID primary keys. Do not carry MongoDB ObjectId semantics into the new model.

### Time

Store timestamps as PostgreSQL `TIMESTAMPTZ`. Financial transaction dates should be represented separately from audit timestamps so a transaction can have a business date independent of when it was created.

## 4. Phase-1 schema

Only the following six core tables are required for the first migration:

1. `users`
2. `accounts`
3. `categories`
4. `transactions`
5. `budgets`
6. `budget_adjustments`

### 4.1 users

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | User identifier |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| email | VARCHAR(320) | NOT NULL, UNIQUE | Login identity |
| password_hash | TEXT | NOT NULL | Bcrypt/compatible password hash |
| currency | CHAR(3) | NOT NULL, default `INR` | Preferred currency |
| timezone | VARCHAR(64) | NOT NULL, default `Asia/Kolkata` | Financial date interpretation |
| created_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |

Do not store raw passwords.

### 4.2 accounts

An account represents where money is held or from which a transaction is funded.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | Account identifier |
| user_id | UUID | FK users, NOT NULL | Owner |
| name | VARCHAR(120) | NOT NULL | User-facing account name |
| type | ENUM | NOT NULL | BANK, CASH, CREDIT_CARD, WALLET, UPI, INVESTMENT, OTHER |
| institution | VARCHAR(160) | NULL | Bank/provider name |
| currency | CHAR(3) | NOT NULL | Account currency |
| opening_balance | NUMERIC(14,2) | NOT NULL, default 0 | Starting balance |
| is_active | BOOLEAN | NOT NULL, default true | Soft-disable account |
| created_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |

Indexes:
- `(user_id, is_active)`
- `(user_id, name)`

### 4.3 categories

Categories replace the current hardcoded Expense enum and allow user-specific and system categories.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | Category identifier |
| user_id | UUID | FK users, NULL | NULL means system category |
| name | VARCHAR(100) | NOT NULL | Category name |
| type | ENUM | NOT NULL | EXPENSE or INCOME |
| parent_id | UUID | FK categories, NULL | Hierarchical categories |
| is_system | BOOLEAN | NOT NULL, default false | System-owned category |
| is_active | BOOLEAN | NOT NULL, default true | Disable without deleting history |
| created_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |

Do not retain a database enum containing only `Food`, `Travel`, `Bills`, `Entertainment`, and `Others`. Those become seeded system categories and can later be extended.

### 4.4 transactions

This is the primary financial ledger.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | Transaction identifier |
| user_id | UUID | FK users, NOT NULL | Owner |
| account_id | UUID | FK accounts, NOT NULL | Source/destination account |
| category_id | UUID | FK categories, NULL | Expense/income category |
| type | ENUM | NOT NULL | INCOME, EXPENSE, TRANSFER |
| amount | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Transaction amount |
| description | VARCHAR(255) | NULL | Description |
| transaction_date | DATE | NOT NULL | Business date |
| notes | TEXT | NULL | Additional information |
| transfer_group_id | UUID | NULL | Links both sides of a transfer |
| created_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |

Rules:
- Amount is always positive; `type` determines its financial meaning.
- Expense transactions require an expense category.
- Income transactions require an income category.
- Transfers must not be treated as income or expense in reports.
- Transfer records should be paired using `transfer_group_id` when money moves between two accounts.
- A transaction belongs to exactly one user.

Indexes:
- `(user_id, transaction_date DESC)`
- `(user_id, type, transaction_date DESC)`
- `(user_id, category_id, transaction_date DESC)`
- `(account_id, transaction_date DESC)`
- `(transfer_group_id)` where applicable

### 4.5 budgets

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | Budget identifier |
| user_id | UUID | FK users, NOT NULL | Owner |
| category_id | UUID | FK categories, NOT NULL | Budget category |
| month | DATE | NOT NULL | First day of budget month |
| amount | NUMERIC(14,2) | NOT NULL, CHECK > 0 | Budget limit |
| alert_percent | NUMERIC(5,2) | NOT NULL, CHECK 0-100 | Alert threshold |
| duration | ENUM | NOT NULL, default `MONTHLY` | MONTHLY or CUSTOM |
| start_date | DATE | NULL | Custom period start |
| end_date | DATE | NULL | Custom period end |
| created_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Audit timestamp |

For standard monthly category budgets, enforce one active budget per `(user_id, category_id, month)`.

The current special `Others` behavior should be implemented as multiple user-visible categories/items rather than weakening core uniqueness rules.

### 4.6 budget_adjustments

Budget changes are historical events, not silent overwrites.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | PK | Adjustment identifier |
| budget_id | UUID | FK budgets, NOT NULL | Budget being changed |
| old_amount | NUMERIC(14,2) | NOT NULL | Previous amount |
| new_amount | NUMERIC(14,2) | NOT NULL | New amount |
| old_alert_percent | NUMERIC(5,2) | NULL | Previous threshold |
| new_alert_percent | NUMERIC(5,2) | NULL | New threshold |
| reason | VARCHAR(500) | NOT NULL | Required explanation |
| created_at | TIMESTAMPTZ | NOT NULL | Adjustment time |

Business rule for the current product design:
- Initial budget creation is the first setting.
- At most one additional adjustment is allowed for a budget/month.
- The additional adjustment requires a reason.
- The API/service layer must enforce this rule transactionally.

## 5. Relationships

```text
users
  |
  +---- accounts
  |
  +---- categories
  |        |
  |        +---- categories (parent/child)
  |
  +---- transactions ---- accounts
  |          |
  |          +---- categories
  |
  +---- budgets -------- categories
             |
             +---- budget_adjustments
```

## 6. Data integrity rules

PostgreSQL must enforce what is naturally a database invariant; application services enforce multi-step business rules.

Database-level rules:
- Foreign keys for ownership relationships.
- `NOT NULL` for required financial fields.
- Positive monetary amounts.
- Valid alert percentage range.
- Unique user email.
- Unique standard monthly budget key.
- Appropriate indexes for user-scoped queries.
- Cascading behavior must be deliberate; financial history should not be accidentally deleted by deleting a parent object.

Service-level rules:
- Authenticated user ownership.
- Expense date cannot be in the future, according to the user's timezone.
- Transfer pairing.
- Budget adjustment limit.
- Required adjustment reason.
- Category compatibility with transaction type.

## 7. Dashboard/reporting model

Do not create a `monthly_summaries` table during the initial migration.

Dashboard queries should derive values from `transactions`:

```text
transactions
   |
   +--> current-month expense total
   +--> category breakdown
   +--> monthly trends
   +--> income total
   +--> net cash flow
   +--> budget usage
   +--> historical comparisons
```

If query performance later requires precomputation, introduce a dedicated read model/materialized view only after measuring the need.

## 8. Future schema extensions

These are intentionally excluded from Phase 1 but are compatible with this design.

### Savings

`savings_goals`
- id
- user_id
- name
- target_amount
- target_date
- status
- created_at
- updated_at

`savings_contributions`
- id
- goal_id
- transaction_id
- amount
- contribution_date
- created_at

### Debts

`debts`
- id
- user_id
- name
- principal_amount
- outstanding_amount
- interest_rate
- minimum_payment
- due_day
- status
- created_at
- updated_at

`debt_payments`
- id
- debt_id
- transaction_id
- amount
- payment_date
- created_at

### Recurring transactions

`recurring_transactions`
- id
- user_id
- account_id
- category_id
- type
- amount
- frequency
- next_run_date
- end_date
- is_active
- created_at
- updated_at

A recurring definition creates actual `transactions`; it is not itself a financial ledger entry.

## 9. MongoDB migration map

| MongoDB | PostgreSQL |
|---|---|
| User | users |
| Expense | transactions where type = EXPENSE |
| Budget | budgets |
| MonthlySummary | Regenerate from transactions; do not migrate as financial truth |
| User preferences | users initially; split into a dedicated preferences table only if preferences grow substantially |

Migration requirements:
1. Export/read existing Mongo data.
2. Normalize and validate IDs.
3. Create PostgreSQL schema.
4. Insert users first.
5. Seed categories.
6. Create default account(s) for existing users where necessary.
7. Convert every Expense into an EXPENSE transaction.
8. Convert Budget documents into budgets.
9. Recalculate historical analytics from transactions.
10. Compare Mongo and PostgreSQL totals before cutover.
11. Keep Mongo read-only during validation.
12. Remove Mongoose only after the new path is verified.

## 10. API migration strategy

Keep existing endpoints initially:

```text
POST   /api/expenses
GET    /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/trends

POST   /api/budgets
GET    /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

Internally, change the implementation to services/repositories backed by Prisma.

Later introduce transaction-oriented endpoints:

```text
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/accounts
POST   /api/accounts
PUT    /api/accounts/:id
DELETE /api/accounts/:id

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

Existing Expense endpoints can become compatibility wrappers around the transaction service until the frontend is migrated.

## 11. Implementation order

### Stage A — Preparation

- Freeze current financial behavior.
- Add backend test framework.
- Capture current API response contracts.
- Record current Mongo counts/totals.
- Verify Expense and Budget behavior.

### Stage B — PostgreSQL foundation

- Add PostgreSQL connection configuration.
- Add Prisma.
- Add Prisma schema.
- Generate first migration.
- Add development seed data.

### Stage C — New data layer

- Create repositories.
- Create financial services.
- Add transaction boundaries where needed.
- Add tests for repositories/services.

### Stage D — Migration tooling

- Build one-time Mongo-to-PostgreSQL migration script.
- Run against a copy/test database.
- Validate counts and totals.

### Stage E — API cutover

- Switch Expense API to PostgreSQL.
- Switch Budget API to PostgreSQL.
- Implement dashboard data API.
- Keep frontend changes minimal initially.

### Stage F — Product foundation

- Replace dashboard mock data.
- Implement Accounts UI/API.
- Implement Income as transaction type.
- Implement Savings Goals and contribution history.
- Implement Reports from transaction queries.

## 12. Explicit non-goals for this migration

Do not combine the database migration with:
- React framework migration.
- JavaScript-to-TypeScript rewrite.
- UI redesign.
- Complete Redux rewrite.
- AI integration.
- Bank/UPI integration.
- Offline-first synchronization.

Those can be addressed independently after the financial foundation is stable.

## 13. Acceptance criteria

The PostgreSQL migration is successful only when:

- Existing users can authenticate.
- Existing expenses are preserved.
- Expense totals match pre-migration totals.
- Existing budgets are preserved.
- Expense CRUD works through PostgreSQL.
- Budget CRUD works through PostgreSQL.
- User isolation remains correct.
- Dashboard values are derived from real transactions.
- Monthly trends do not require a duplicated summary table.
- Automated tests cover critical financial services.
- MongoDB can be disabled without breaking the application.

## 14. Decision summary

**Decision:** Proceed with PostgreSQL + Prisma as the next architecture.

**Primary reason:** The product is evolving from a simple expense recorder into a transaction-oriented personal finance platform. Accounts, transactions, budgets, historical changes, reporting, debts, recurring activity, and future integrations benefit from relational constraints and transactional consistency.

**Migration principle:** Preserve working behavior, replace the data foundation incrementally, and avoid rewriting unrelated frontend technology at the same time.
