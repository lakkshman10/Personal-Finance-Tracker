-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'PAID_OFF', 'ARCHIVED');

-- CreateTable
CREATE TABLE "debts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "principal_amount" DECIMAL(14,2) NOT NULL,
    "outstanding_amount" DECIMAL(14,2) NOT NULL,
    "interest_rate" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "minimum_payment" DECIMAL(14,2),
    "due_day" INTEGER,
    "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_payments" (
    "id" UUID NOT NULL,
    "debt_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "debt_payments_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "debts_user_id_status_idx" ON "debts"("user_id", "status");
CREATE INDEX "debts_user_id_due_day_idx" ON "debts"("user_id", "due_day");
CREATE UNIQUE INDEX "debt_payments_transaction_id_key" ON "debt_payments"("transaction_id");
CREATE INDEX "debt_payments_user_id_debt_id_payment_date_idx" ON "debt_payments"("user_id", "debt_id", "payment_date" DESC);
CREATE INDEX "debt_payments_debt_id_created_at_idx" ON "debt_payments"("debt_id", "created_at" DESC);

-- Foreign keys
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Financial invariants
ALTER TABLE "debts" ADD CONSTRAINT "debts_principal_amount_positive" CHECK ("principal_amount" > 0);
ALTER TABLE "debts" ADD CONSTRAINT "debts_outstanding_amount_valid" CHECK ("outstanding_amount" >= 0 AND "outstanding_amount" <= "principal_amount");
ALTER TABLE "debts" ADD CONSTRAINT "debts_interest_rate_valid" CHECK ("interest_rate" >= 0 AND "interest_rate" <= 100);
ALTER TABLE "debts" ADD CONSTRAINT "debts_minimum_payment_positive" CHECK ("minimum_payment" IS NULL OR "minimum_payment" > 0);
ALTER TABLE "debts" ADD CONSTRAINT "debts_due_day_valid" CHECK ("due_day" IS NULL OR ("due_day" >= 1 AND "due_day" <= 31));
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_amount_positive" CHECK ("amount" > 0);
