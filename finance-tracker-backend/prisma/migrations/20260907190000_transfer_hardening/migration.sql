-- Add explicit direction metadata so a transfer can be represented as a
-- balanced pair: one OUT transaction and one IN transaction.
CREATE TYPE "TransferDirection" AS ENUM ('OUT', 'IN');

ALTER TABLE "transactions"
ADD COLUMN "transfer_direction" "TransferDirection";

CREATE INDEX "transactions_transfer_group_direction_idx"
ON "transactions"("transfer_group_id", "transfer_direction");
