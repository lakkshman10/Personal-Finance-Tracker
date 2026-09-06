import React, { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import financeApi from "../services/financeApi";

const EMPTY_FORM = { amount: "", categoryId: "", description: "", date: "" };

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, categoriesResponse, accountsResponse] = await Promise.all([
        financeApi.transactions.list({ type: "EXPENSE", limit: 500 }),
        financeApi.categories.list("EXPENSE"),
        financeApi.accounts.list({ activeOnly: true }),
      ]);

      setExpenses(transactionsResponse.data || []);
      const loadedCategories = categoriesResponse.data || [];
      const loadedAccounts = accountsResponse.data || [];
      setCategories(loadedCategories);
      setAccounts(loadedAccounts);

      setFormData((current) => ({
        ...current,
        categoryId: current.categoryId || loadedCategories[0]?.id || "",
      }));
    } catch (error) {
      console.error("Error loading PostgreSQL financial data:", error);
      alert(error.response?.data?.message || "Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const resetForm = () => {
    setEditExpenseId(null);
    setFormData({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
  };

  const buildTransactionPayload = () => ({
    accountId: accounts[0]?.id,
    categoryId: formData.categoryId,
    type: "EXPENSE",
    amount: formData.amount,
    description: formData.description || "Expense",
    transactionDate: formData.date,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!accounts.length) {
      alert("No active account is available. Please create an account first.");
      return;
    }

    if (!formData.amount || !formData.categoryId || !formData.date) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formData.date > today) {
      alert("Future dates are not allowed.");
      return;
    }

    try {
      if (editExpenseId) {
        await financeApi.transactions.update(editExpenseId, buildTransactionPayload());
      } else {
        await financeApi.transactions.create(buildTransactionPayload());
      }

      resetForm();
      await loadFinancialData();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert(error.response?.data?.message || "Failed to save expense.");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await financeApi.transactions.remove(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      if (editExpenseId === id) resetForm();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert(error.response?.data?.message || "Failed to delete expense.");
    }
  };

  const handleEditExpense = (expense) => {
    setEditExpenseId(expense.id);
    setFormData({
      amount: expense.amount?.toString() || "",
      categoryId: expense.categoryId || expense.category?.id || "",
      description: expense.description || "",
      date: expense.transactionDate?.split("T")[0] || "",
    });
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const getCategoryName = (expense) => expense.category?.name || "Uncategorized";

  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    return expenses
      .filter((expense) => {
        const date = new Date(expense.transactionDate);
        return date.getUTCMonth() === currentMonth && date.getUTCFullYear() === currentYear;
      })
      .reduce((acc, expense) => {
        const category = getCategoryName(expense);
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
      }, {});
  }, [expenses]);

  const pieChartData = Object.entries(categoryData).map(([asset, amount]) => ({ asset, amount }));

  const lineChartData = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let offset = 3; offset >= 0; offset -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const label = date.toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });

      const total = expenses.reduce((sum, expense) => {
        const expenseDate = new Date(expense.transactionDate);
        if (expenseDate.getUTCFullYear() === year && expenseDate.getUTCMonth() === month) {
          return sum + Number(expense.amount);
        }
        return sum;
      }, 0);

      result.push({ month: label, expenses: Number(total.toFixed(2)) });
    }

    return result;
  }, [expenses]);

  const pieChartOptions = {
    data: pieChartData,
    series: [{ type: "pie", angleKey: "amount", legendItemKey: "asset" }],
    title: { text: "Monthly Expense Breakdown" },
  };

  const lineChartOptions = {
    data: lineChartData,
    series: [{ type: "line", xKey: "month", yKey: "expenses" }],
    title: { text: "Expense Trend" },
    axes: [
      { type: "category", position: "bottom" },
      { type: "number", position: "left" },
    ],
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Expense Tracker</h1>

      <div style={styles.topSection}>
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionHeader}>{editExpenseId ? "Edit Expense" : "Add Expense"}</h2>
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              style={styles.input}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={styles.input}
              required
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.input}
            />

            <input
              type="date"
              name="date"
              value={formData.date}
              max={today}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={styles.input}
              required
            />

            <div style={styles.buttonflex}>
              <button type="submit" style={styles.button} disabled={loading}>
                {editExpenseId ? "Update Expense" : "Add Expense"}
              </button>
              {editExpenseId && (
                <button type="button" onClick={resetForm} style={styles.resetButton}>Cancel Edit</button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.rightColumn}>
          <h2 style={styles.sectionHeader}>Expense List</h2>
          {loading ? (
            <p style={styles.noDataText}>Loading expenses...</p>
          ) : expenses.length ? (
            <div style={styles.scrollableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Date</th>
                    <th style={styles.tableHeader}>Category</th>
                    <th style={styles.tableHeader}>Description</th>
                    <th style={styles.tableHeader}>Amount</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td style={styles.tableData}>{formatDate(expense.transactionDate)}</td>
                      <td style={styles.tableData}>{getCategoryName(expense)}</td>
                      <td style={styles.tableData}>{expense.description}</td>
                      <td style={styles.tableData}>₹ {Number(expense.amount).toFixed(2)}</td>
                      <td>
                        <button onClick={() => handleDeleteExpense(expense.id)} style={styles.deleteButton}>Delete</button>
                        <button onClick={() => handleEditExpense(expense)} style={styles.editButton}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.noDataText}>No expenses added yet.</p>
          )}
        </div>
      </div>

      <div style={styles.bottomSection}>
        <div style={styles.chartContainer}><AgCharts options={pieChartOptions} /></div>
        <div style={styles.chartContainer}><AgCharts options={lineChartOptions} /></div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Rubik", maxWidth: "1200px", margin: "0 auto", padding: "20px" },
  header: { textAlign: "center", marginBottom: "20px", color: "#4CAF50" },
  topSection: { display: "flex", justifyContent: "space-between", marginBottom: "30px" },
  leftColumn: { flex: "1", marginRight: "10px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", maxWidth: "35%" },
  rightColumn: { flex: "2", marginLeft: "10px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" },
  scrollableContainer: { maxHeight: "270px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px", backgroundColor: "#ffffff", padding: "10px" },
  sectionHeader: { marginBottom: "15px", color: "#343a40" },
  bottomSection: { display: "flex", justifyContent: "space-between" },
  form: { display: "flex", flexDirection: "column" },
  input: { marginBottom: "10px", padding: "10px", borderRadius: "4px", border: "1px solid #ced4da" },
  buttonflex: { display: "flex", justifyContent: "space-between", gap: "10px", marginLeft: "10%" },
  button: { backgroundColor: "#007bff", color: "#ffffff", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px", width: "140px" },
  resetButton: { backgroundColor: "#dc3545", color: "#ffffff", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" },
  deleteButton: { backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" },
  editButton: { backgroundColor: "blue", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { padding: "10px", backgroundColor: "#f1f3f5", borderBottom: "2px solid #dee2e6", textAlign: "left" },
  tableData: { padding: "10px", borderBottom: "1px solid #dee2e6" },
  noDataText: { textAlign: "center", color: "#6c757d" },
  chartContainer: { flex: "1", padding: "20px", marginLeft: "10px", marginRight: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px" },
};

export default ExpenseTracker;
