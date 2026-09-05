import React, { useState, useEffect } from "react";
import { AgCharts } from "ag-charts-react";
import api from "../services/api";

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  // Fetch expenses from the backend when the component loads
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get('/expenses');
        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // Add a new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (formData.date > today) {
      alert("Future dates are not allowed.");
      return;
    }
    if (formData.amount && formData.category && formData.date) {
      try {
        const response = await api.post('/expenses', formData);
        setExpenses([...expenses, response.data]);
        setFormData({ amount: "", category: "", description: "", date: "" });
      } catch (error) {
        console.error("Error adding expense:", error);
        alert(error.response?.data?.error || "Failed to add expense.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert(error.response?.data?.error || "Failed to delete expense.");
    }
  };

  // Process data for Pie Chart
  const currentMonth = new Date().getMonth(); // Current month (0-11)
  const currentYear = new Date().getFullYear(); // Current year (e.g., 2024)
  
  const categoryData = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
      return acc;
    }, {});
  
    const pieChartData = Object.keys(categoryData).map((key) => ({
      asset: key,
      amount: categoryData[key],
    }));

  const [editExpenseId, setEditExpenseId] = useState(null);

  const handleEditExpense = (expense) => {
    setEditExpenseId(expense._id);
    setFormData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.split("T")[0], // Ensure date is in YYYY-MM-DD format for input
    });
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/expenses/${editExpenseId}`, formData);
      setExpenses(
        expenses.map((expense) =>
          expense._id === editExpenseId ? response.data : expense
        )
      );
      setEditExpenseId(null);
      setFormData({ amount: "", category: "", description: "", date: "" });
    } catch (error) {
      console.error("Error updating expense:", error);
      alert(error.response?.data?.error || "Failed to update expense.");
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        const response = await api.get('/expenses/trends');
        setMonthlyTrends(response.data);
      } catch (error) {
        console.error('Error fetching trends:', error);
      }
    };
  
    fetchMonthlyTrends();
  }, [expenses]);
  // Mock Line Chart Data
  const lineChartData = monthlyTrends.map((trend) => ({
    month: trend.month, // X-axis: Month
    expenses: trend.totalExpenses, // Y-axis: Total expenses
  }));

  // AG Chart Options for Pie Chart
  const pieChartOptions = {
    data: pieChartData,
    series: [
      {
        type: "pie",
        angleKey: "amount",
        legendItemKey: "asset",
      },
    ],
    title: {
      text: "Monthly Expense Breakdown",
    },
  };
  
  // AG Chart Options for Line Chart
  const lineChartOptions = {
    data: lineChartData,
    series: [
      {
        type: "line",
        xKey: "month",
        yKey: "expenses",
      },
    ],
    title: {
      text: "Expense Trend",
    },
    axes: [
      {
        type: "category",
        position: "bottom",
        label: { rotation: 0 },
      },
      {
        type: "number",
        position: "left",
      },
    ],
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editExpenseId) {
      handleUpdateExpense(e); // Call the update function when in edit mode
    } else {
      handleAddExpense(e); // Call the add function otherwise
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Expense Tracker</h1>

      {/* Top Section */}
      <div style={styles.topSection}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionHeader}>Add Expense</h2>
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <select
              name="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              style={styles.input}
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Others">Others</option>
            </select>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]} // Restricts to today or earlier
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              style={styles.input}
              required
            />
            <div style={styles.buttonflex}>
              <button type="submit" style={styles.button} >
                {editExpenseId ? "Update Expense" : "Add Expense"}
              </button>
              {editExpenseId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditExpenseId(null);
                    setFormData({ amount: "", category: "", description: "", date: "" });
                  }}
                  style={styles.resetButton}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          <h2 style={styles.sectionHeader}>Expense List</h2>
          {expenses.length ? (
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
                  {expenses.map((expense, index) => (
                    <tr key={index}>
                      <td style={styles.tableData}>
                        {formatDate(expense.date)}
                      </td>
                      <td style={styles.tableData}>{expense.category}</td>
                      <td style={styles.tableData}>{expense.description}</td>
                      <td style={styles.tableData}>
                        ₹ {parseFloat(expense.amount).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          style={{
                            backgroundColor: "red",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "10px", 
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          style={{
                            backgroundColor: "blue",
                            color: "white",
                            padding: "5px 10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
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

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.chartContainer}>
          <AgCharts options={pieChartOptions} />
        </div>
        <div style={styles.chartContainer}>
          <AgCharts options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Rubik",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#4CAF50",
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  leftColumn: {
    flex: "1",
    marginRight: "10px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    maxWidth: "35%",
  },
  rightColumn: {
    flex: "2",
    marginLeft: "10px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  scrollableContainer: {
    maxHeight: "270px",
    overflowY: "auto",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "10px",
  },
  sectionHeader: {
    marginBottom: "15px",
    color: "#343a40",
  },
  bottomSection: {
    display: "flex",
    justifyContent: "space-between",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
  },
  buttonflex:{
    display: "flex",
    ustifyContent: "space-between",
    gap: "10px",
    marginLeft: "10%",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#ffffff",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "10px",
    width: "140px",
  },
  resetButton: {
    backgroundColor: "#dc3545",
    color: "#ffffff",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    padding: "10px",
    backgroundColor: "#f1f3f5",
    borderBottom: "2px solid #dee2e6",
    textAlign: "left",
  },
  tableData: {
    padding: "10px",
    borderBottom: "1px solid #dee2e6",
  },
  noDataText: {
    textAlign: "center",
    color: "#6c757d",
  },
  chartContainer: {
    flex: "1",
    padding: "20px",
    marginLeft: "10px",
    marginRight: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
};

export default ExpenseTracker;
