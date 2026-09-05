const Expense = require('../models/expense');
const MonthlySummary = require('../models/MonthlySummary');

const ALLOWED_CATEGORIES = ['Food', 'Travel', 'Bills', 'Entertainment', 'Others'];

// Helper to synchronize MonthlySummary with actual Expense records for a month.
// This guarantees that totalExpenses and category breakdowns are never negative.
const syncMonthlySummary = async (userId, month) => {
  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));

  const expenses = await Expense.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  let totalExpenses = 0;
  const categoriesBreakdown = {};

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    totalExpenses += amt;
    categoriesBreakdown[exp.category] = (categoriesBreakdown[exp.category] || 0) + amt;
  }

  // Ensure totalExpenses is never negative and rounded to 2 decimal places
  totalExpenses = Math.max(0, Math.round(totalExpenses * 100) / 100);

  await MonthlySummary.findOneAndUpdate(
    { userId, month },
    {
      $set: {
        totalExpenses,
        categoriesBreakdown,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
};

// Add Expense
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required.' });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Please enter a positive number.' });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    // Save the expense in the expenses collection with whitelisted fields
    const newExpense = await Expense.create({
      userId,
      amount: Number(amount),
      category,
      description: description ? String(description).trim() : '',
      date: parsedDate,
    });

    // Extract the month in YYYY-MM format
    const month = parsedDate.toISOString().slice(0, 7);

    // Synchronize the monthly summary (prevents negative values and maintains consistency)
    await syncMonthlySummary(userId, month);

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error in addExpense:', error);
    res.status(500).json({ error: 'Failed to add expense.' });
  }
};

// Get All Expenses for a User
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error in getExpenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// Edit Expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, description, date } = req.body;

    const existingExpense = await Expense.findOne({ _id: id, userId });
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    // Validate and whitelist fields for update (prevent arbitrary field injection)
    const updateData = {};

    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Invalid amount. Please enter a positive number.' });
      }
      updateData.amount = Number(amount);
    }

    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
      }
      updateData.category = category;
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format.' });
      }
      updateData.date = parsedDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const oldMonth = new Date(existingExpense.date).toISOString().slice(0, 7);

    // Update the expense with ONLY whitelisted fields
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );

    const newMonth = new Date(updatedExpense.date).toISOString().slice(0, 7);

    // Synchronize monthly summary for old and new month (recalculating prevents negative values)
    await syncMonthlySummary(userId, oldMonth);
    if (oldMonth !== newMonth) {
      await syncMonthlySummary(userId, newMonth);
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error in updateExpense:', error);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const month = new Date(expense.date).toISOString().slice(0, 7);

    // Synchronize monthly summary after deletion (ensures non-negative values)
    await syncMonthlySummary(userId, month);

    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
};

// Get Monthly Trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the current and last 3 months
    const currentMonth = new Date();
    const months = Array.from({ length: 4 }, (_, i) => {
      const date = new Date(currentMonth);
      date.setMonth(currentMonth.getMonth() - i);
      return date.toISOString().slice(0, 7); // Format YYYY-MM
    });

    // Fetch data from MonthlySummary
    const summaries = await MonthlySummary.find({
      userId,
      month: { $in: months },
    });

    // Ensure all months are included in the response with non-negative totalExpenses
    const response = months.map((month) => {
      const summary = summaries.find((s) => s.month === month);
      return {
        month,
        totalExpenses: Math.max(0, summary?.totalExpenses || 0),
        categoriesBreakdown: summary?.categoriesBreakdown || {},
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getMonthlyTrends:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends.' });
  }
};
