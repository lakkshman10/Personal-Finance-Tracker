-- Financial amounts must never be zero or negative.
ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_amount_positive_check" CHECK ("amount" > 0);
