CREATE TABLE "savings_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "target_amount" DECIMAL(14,2) NOT NULL,
    "target_date" DATE,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "savings_goal_contributions" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "contribution_date" DATE NOT NULL,
    "note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "savings_goal_contributions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "savings_goals_user_id_is_active_idx" ON "savings_goals"("user_id", "is_active");
CREATE INDEX "savings_goals_user_id_target_date_idx" ON "savings_goals"("user_id", "target_date");
CREATE INDEX "savings_goal_contributions_user_id_goal_id_contribution_date_idx" ON "savings_goal_contributions"("user_id", "goal_id", "contribution_date" DESC);
CREATE INDEX "savings_goal_contributions_goal_id_created_at_idx" ON "savings_goal_contributions"("goal_id", "created_at" DESC);

ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_goal_contributions" ADD CONSTRAINT "savings_goal_contributions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_goal_contributions" ADD CONSTRAINT "savings_goal_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
