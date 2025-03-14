const Budget = require('../models/budgets');

// Create a new budget
exports.postbudget = async (req, res) => {
  try {
    const { category, amount, month, alerts } = req.body;

    if (!req.user?.id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    console.log("Received Data:", req.body); // Log request data

    // Ensure all required fields are present
    if (!category || !amount || !month || !alerts) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const budget = new Budget({
      userId: req.user.id,
      category,
      amount,
      month,
      alerts,
    });

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
    const budgets = await Budget.find({ userId: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ error: "Error fetching budgets." });
  }
};

// Update a budget
exports.updatedBudget = async (req, res) => {
  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
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
