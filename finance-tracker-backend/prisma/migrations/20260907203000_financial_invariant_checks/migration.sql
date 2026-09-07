ALTER TABLE "budgets"
  ADD CONSTRAINT "budgets_amount_positive_check" CHECK (amount > 0),
  ADD CONSTRAINT "budgets_alert_percent_range_check" CHECK (alert_percent >= 0 AND alert_percent <= 100),
  ADD CONSTRAINT "budgets_dates_consistent_check" CHECK (
    (duration = 'MONTHLY' AND start_date IS NULL AND end_date IS NULL)
    OR (duration = 'CUSTOM' AND start_date IS NOT NULL AND end_date IS NOT NULL AND start_date <= end_date)
  );

ALTER TABLE "savings_goals"
  ADD CONSTRAINT "savings_goals_target_amount_positive_check" CHECK (target_amount > 0);

ALTER TABLE "savings_goal_contributions"
  ADD CONSTRAINT "savings_goal_contributions_amount_positive_check" CHECK (amount > 0);

ALTER TABLE "debts"
  ADD CONSTRAINT "debts_principal_positive_check" CHECK (principal_amount > 0),
  ADD CONSTRAINT "debts_outstanding_range_check" CHECK (outstanding_amount >= 0 AND outstanding_amount <= principal_amount),
  ADD CONSTRAINT "debts_interest_rate_range_check" CHECK (interest_rate >= 0 AND interest_rate <= 100),
  ADD CONSTRAINT "debts_minimum_payment_nonnegative_check" CHECK (minimum_payment IS NULL OR minimum_payment >= 0),
  ADD CONSTRAINT "debts_due_day_range_check" CHECK (due_day IS NULL OR (due_day >= 1 AND due_day <= 31));
