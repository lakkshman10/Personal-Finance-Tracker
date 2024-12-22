const Expense = require('../models/expense');
const MonthlySummary = require('../models/MonthlySummary')

// Add Expense
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required.' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Please enter a positive number.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    // Save the expense in the expenses collection
    const newExpense = await Expense.create({
      userId,
      amount,
      category,
      description,
      date: parsedDate,
    });

    // Extract the month in YYYY-MM format
    const month = parsedDate.toISOString().slice(0, 7);

    // Update the monthly summary
    await MonthlySummary.updateOne(
      { userId, month },
      {
        $inc: {
          totalExpenses: amount,
          [`categoriesBreakdown.${category}`]: amount,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

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
    const expenses = await Expense.find({ userId });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

// Edit Expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, date } = req.body;

    const existingExpense = await Expense.findOne({ _id: id, userId });
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    // Calculate the difference in amount and check if the month/category changed
    const month = new Date(date).toISOString().slice(0, 7);
    const oldMonth = new Date(existingExpense.date).toISOString().slice(0, 7);

    // Update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (oldMonth === month) {
      // Same month, update summary
      await MonthlySummary.updateOne(
        { userId, month },
        {
          $inc: {
            totalExpenses: amount - existingExpense.amount,
            [`categoriesBreakdown.${existingExpense.category}`]: -existingExpense.amount,
            [`categoriesBreakdown.${category}`]: amount,
          },
        }
      );
    } else {
      // Different months, adjust summaries for both months
      await MonthlySummary.updateOne(
        { userId, month: oldMonth },
        {
          $inc: {
            totalExpenses: -existingExpense.amount,
            [`categoriesBreakdown.${existingExpense.category}`]: -existingExpense.amount,
          },
        }
      );
      await MonthlySummary.updateOne(
        { userId, month },
        {
          $inc: {
            totalExpenses: amount,
            [`categoriesBreakdown.${category}`]: amount,
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
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

    // Update monthly summary
    await MonthlySummary.updateOne(
      { userId, month },
      {
        $inc: {
          totalExpenses: -expense.amount,
          [`categoriesBreakdown.${expense.category}`]: -expense.amount,
        },
      }
    );

    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
};


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

    // Ensure all months are included in the response
    const response = months.map((month) => {
      const summary = summaries.find((s) => s.month === month);
      return {
        month,
        totalExpenses: summary?.totalExpenses || 0,
        categoriesBreakdown: summary?.categoriesBreakdown || {},
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monthly trends.' });
  }
};

