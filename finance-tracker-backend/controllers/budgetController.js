const Budget = require('../models/budgets');

// Create a new budget
exports.postbudget = async (req, res) => {
  try {
    const { category, amount, month, alerts, duration, startDate, endDate } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Ensure all required fields are present
    if (!category || amount === undefined || !month || alerts === undefined) {
      return res.status(400).json({ error: "Category, amount, month, and alerts are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount. Please enter a positive number." });
    }

    if (isNaN(alerts) || Number(alerts) < 0 || Number(alerts) > 100) {
      return res.status(400).json({ error: "Alert percentage must be between 0 and 100." });
    }

    const budgetData = {
      userId: req.user.id,
      category: String(category).trim(),
      amount: Number(amount),
      month: String(month).trim(),
      alerts: Number(alerts),
    };

    if (duration && ['monthly', 'custom'].includes(duration)) {
      budgetData.duration = duration;
    }
    if (startDate) {
      const parsedStart = new Date(startDate);
      if (!isNaN(parsedStart.getTime())) budgetData.startDate = parsedStart;
    }
    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (!isNaN(parsedEnd.getTime())) budgetData.endDate = parsedEnd;
    }

    const budget = new Budget(budgetData);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: "Error creating budget.", details: error.message });
  }
};

// Get budgets for the logged-in user
exports.getbudget = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Error fetching budgets." });
  }
};

// Update a budget
exports.updatedBudget = async (req, res) => {
  try {
    const { category, amount, month, alerts, duration, startDate, endDate } = req.body;

    // Validate and whitelist fields for update (prevents arbitrary field injection)
    const updateData = {};

    if (category !== undefined) {
      updateData.category = String(category).trim();
    }
    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Invalid amount. Please enter a positive number." });
      }
      updateData.amount = Number(amount);
    }
    if (month !== undefined) {
      updateData.month = String(month).trim();
    }
    if (alerts !== undefined) {
      if (isNaN(alerts) || Number(alerts) < 0 || Number(alerts) > 100) {
        return res.status(400).json({ error: "Alert percentage must be between 0 and 100." });
      }
      updateData.alerts = Number(alerts);
    }
    if (duration !== undefined) {
      if (['monthly', 'custom'].includes(duration)) {
        updateData.duration = duration;
      }
    }
    if (startDate !== undefined) {
      const parsedStart = new Date(startDate);
      if (!isNaN(parsedStart.getTime())) updateData.startDate = parsedStart;
    }
    if (endDate !== undefined) {
      const parsedEnd = new Date(endDate);
      if (!isNaN(parsedEnd.getTime())) updateData.endDate = parsedEnd;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateData },
      { new: true }
    );
    if (!updatedBudget) {
      return res.status(404).json({ error: "Budget not found." });
    }
    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Error updating budget." });
  }
};

// Delete a budget
exports.deletebudget = async (req, res) => {
  try {
    const deletedBudget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedBudget) {
      return res.status(404).json({ error: "Budget not found." });
    }
    res.status(200).json({ message: "Budget deleted successfully." });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Error deleting budget." });
  }
};
