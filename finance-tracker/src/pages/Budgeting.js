import React, { useState, useEffect } from "react";

function BudgetTracker() {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  });
  const [alertPercent, setAlertPercent] = useState("");
  const [month, setMonth] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [budgetInputCardHovered, setBudgetInputCardHovered] = useState(false);
  const [budgetListCardHovered, setBudgetListCardHovered] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  // Fetch budgets and initialize alert & month from localStorage
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/budgets", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.ok) {
          const data = await response.json();
          setBudgets(data);

          // Retrieve stored values
          const savedMonth = localStorage.getItem("selectedMonth");
          const savedAlert = localStorage.getItem("alertPercent");

          if (savedMonth) setMonth(savedMonth);
          if (savedAlert) setAlertPercent(savedAlert);

          if (data.length > 0 || (savedMonth && savedAlert)) {
            setIsLocked(true);
          }
        } else {
          console.error("Failed to fetch budgets.");
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    fetchBudgets();
  }, []);

  // Set initial month and alert percentage
  const handleSetInitialValues = () => {
    if (!alertPercent || !month) {
      alert("Please enter both the alert percentage and select a month.");
      return;
    }

    localStorage.setItem("selectedMonth", month);
    localStorage.setItem("alertPercent", alertPercent);
    setIsLocked(true);
  };

  // Add new budget entry
  const handleAddBudget = async (e) => {
    e.preventDefault();

    if (!isLocked) {
      alert("Set the alert percentage and month first.");
      return;
    }

    if (formData.amount && formData.category) {
      const categoryExists =
        formData.category !== "Others" &&
        budgets.some((budget) => budget.category === formData.category);

      if (categoryExists) {
        alert(`Budget for "${formData.category}" is already set.`);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/budgets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            category: formData.category,
            amount: Number(formData.amount),
            month,
            alerts: Number(alertPercent),
            duration: "monthly",
          }),
        });

        if (response.ok) {
          const newBudget = await response.json();
          setBudgets([...budgets, newBudget]);
          setFormData({ category: "", amount: "" });
        } else {
          console.error("Failed to add budget.");
        }
      } catch (error) {
        console.error("Error adding budget:", error);
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Delete a budget entry
  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        setBudgets(budgets.filter((budget) => budget._id !== id));
      } else {
        alert("Failed to delete budget.");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const formatCurrency = (amount) => `₹ ${parseFloat(amount).toFixed(2)}`;
  const allCategories = ["Food", "Travel", "Bills", "Entertainment", "Others"];
  
  // Ensure 'Others' category can be entered multiple times
  const availableCategories = allCategories.filter(
    (category) => category === "Others" || !budgets.some((budget) => budget.category === category)
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💰 Budget Tracker</h1>

      {/* Alert and Month Selection */}
      {!isLocked ? (
        <div style={styles.row}>
          <div style={styles.card}>
            <label style={styles.label}>🔔 Alert (%)</label>
            <input
              type="number"
              value={alertPercent}
              onChange={(e) => setAlertPercent(e.target.value)}
              style={styles.input}
              placeholder="Enter alert %"
            />
          </div>

          <div style={styles.card}>
            <label style={styles.label}>📅 Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={styles.input}
            />
          </div>

          <button onClick={handleSetInitialValues} style={styles.button}>
            Set Alert & Month
          </button>
        </div>
      ) : (
        <div style={styles.lockedContainer}>
          <p>✅ Alert: {alertPercent}% | Month: {month} (Locked)</p>
        </div>
      )}

      {/* Budget Input */}
      <div style={styles.row}>
      <div 
  style={{ 
    ...styles.card, 
    width: "40%", // Reduced width 
    ...(budgetInputCardHovered ? styles.cardHover : {}) 
  }}
  onMouseEnter={() => setBudgetInputCardHovered(true)} 
  onMouseLeave={() => setBudgetInputCardHovered(false)}
>
  <h2 style={styles.sectionHeader}>➕ Add Budget</h2>
  <form onSubmit={handleAddBudget} style={styles.form}>
    <select
      name="category"
      value={formData.category}
      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      style={styles.input}
      required
    >
      <option value="">Select Category</option>
      {availableCategories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
    <input
      type="number"
      name="amount"
      placeholder="Enter Amount"
      value={formData.amount}
      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
      style={styles.input}
      required
    />
    <button 
      type="submit" 
      style={{ ...styles.button, ...(buttonHovered ? styles.buttonHover : {}) }}
      onMouseEnter={() => setButtonHovered(true)}
      onMouseLeave={() => setButtonHovered(false)}
    >
      Add Budget
    </button>
  </form>
</div>

{/* Improved Budget Table */}
<div 
  style={{ 
    ...styles.card, 
    ...(budgetListCardHovered ? styles.cardHover : {}), 
    overflowX: "auto" // Makes it scrollable on small screens
  }}
  onMouseEnter={() => setBudgetListCardHovered(true)} 
  onMouseLeave={() => setBudgetListCardHovered(false)}
>
  <h2 style={styles.sectionHeader}>📜 Budget List</h2>
  
  {budgets.length ? (
    <>
      <table style={styles.budgetTable}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Category</th>
            <th style={styles.tableHeader}>Amount</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((budget, index) => (
            <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <td style={styles.tableData}>{budget.category}</td>
              <td style={styles.tableData}>{formatCurrency(budget.amount)}</td>
              <td style={styles.tableData}>
                <button
                  onClick={() => handleDeleteBudget(budget._id)}
                  style={styles.deleteButton}
                >
                  🗑️ {/* Trash icon instead of text */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display Total Amount */}
      <div style={styles.totalContainer}>
        <strong>Total Budget:</strong> {formatCurrency(budgets.reduce((acc, budget) => acc + budget.amount, 0))}
      </div>
    </>
  ) : (
    <p style={styles.noDataText}>No budgets set yet.</p>
  )}
</div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    fontFamily: "Rubik", 
    maxWidth: "900px", 
    margin: "0 auto", 
    padding: "20px", 
    backgroundColor: "#F4F7F9", 
    borderRadius: "10px", 
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" 
  },

  header: { 
    textAlign: "center", 
    color: "#4CAF50",
    fontSize: "32px", 
    fontWeight: "600", 
    marginBottom: "20px" 
  },

  row: { 
    display: "flex", 
    justifyContent: "space-between", 
    gap: "20px", 
    alignItems: "center", 
    flexWrap: "wrap" 
  },

  card: { 
    flex: "1", 
    background: "linear-gradient(135deg, #F9FAFB, #ECF0F3)", 
    padding: "20px", 
    borderRadius: "10px", 
    boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)", 
    transition: "transform 0.3s ease-in-out" 
  },

  cardHover: { 
    transform: "scale(1.03)" 
  },

  label: { 
    fontWeight: "bold", 
    marginBottom: "6px", 
    display: "block", 
    color: "#34495E" 
  },

  input: { 
    width: "90%", 
    padding: "10px", 
    marginBottom: "12px", 
    border: "1px solid #BDC3C7", 
    borderRadius: "6px", 
    fontSize: "14px", 
    transition: "border-color 0.3s" 
  },

  inputFocus: { 
    borderColor: "#27AE60" 
  },

  button: { 
    backgroundColor: "#27AE60", 
    color: "#FFF", 
    padding: "12px", 
    border: "none", 
    marginBottom: "20px",
    borderRadius: "6px", 
    cursor: "pointer", 
    fontSize: "16px", 
    fontWeight: "bold", 
    transition: "background-color 0.3s ease-in-out", 
    display: "block", 
    width: "100%" 
  },

  buttonHover: { 
    backgroundColor: "#219150" 
  },

  lockedContainer: { 
    textAlign: "center", 
    fontWeight: "bold", 
    margin: "15px 0", 
    color: "rgb(0 0 0)", 
    background: "#E8F6EF", 
    padding: "10px", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" 
  },
  budgetTable: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "left",
    fontSize: "16px",
  },
  tableData: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
    fontSize: "15px",
  },
  evenRow: {
    backgroundColor: "#f9f9f9", // Light gray for even rows
  },
  oddRow: {
    backgroundColor: "#fff", // White for odd rows
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    transition: "0.2s",
  },
  deleteButtonHover: {
    color: "red",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },

  totalContainer: {
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "right",
    color: "#2C3E50",
  },

  noDataText: {
    textAlign: "center",
    fontSize: "16px",
    color: "#888",
  }
};

export default BudgetTracker;
