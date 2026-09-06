import React, { useEffect, useMemo, useState } from "react";
import financeApi from "../services/financeApi";

function BudgetTracker() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ categoryId: "", amount: "" });
  const [alertPercent, setAlertPercent] = useState(80);
  const [month, setMonth] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [budgetResponse, categoryResponse] = await Promise.all([
        financeApi.budgets.list(),
        financeApi.categories.list("EXPENSE"),
      ]);
      const nextBudgets = budgetResponse.data || [];
      setBudgets(nextBudgets);
      setCategories(categoryResponse.data || []);
      if (nextBudgets.length) {
        const firstMonth = nextBudgets[0].month?.slice(0, 7);
        setMonth(firstMonth || "");
        setAlertPercent(Number(nextBudgets[0].alertPercent ?? 80));
        setIsLocked(true);
      }
    } catch (error) {
      console.error("Error fetching PostgreSQL budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSetInitialValues = () => {
    if (!alertPercent || !month) {
      alert("Please enter both the alert percentage and select a month.");
      return;
    }
    setIsLocked(true);
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!isLocked) return alert("Set the alert percentage and month first.");
    if (!formData.amount || !formData.categoryId) return alert("Please fill in all required fields.");

    const exists = budgets.some((budget) => budget.categoryId === formData.categoryId && budget.month?.slice(0, 7) === month);
    if (exists) return alert("A budget for this category already exists for this month.");

    try {
      const response = await financeApi.budgets.create({
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        month: `${month}-01`,
        alertPercent: Number(alertPercent),
        duration: "MONTHLY",
      });
      setBudgets((current) => [response.data, ...current]);
      setFormData({ categoryId: "", amount: "" });
    } catch (error) {
      console.error("Error adding budget:", error);
      alert(error.response?.data?.message || "Failed to add budget.");
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await financeApi.budgets.remove(id);
      setBudgets((current) => current.filter((budget) => budget.id !== id));
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert(error.response?.data?.message || "Failed to delete budget.");
    }
  };

  const availableCategories = useMemo(() => {
    const used = new Set(budgets.filter((b) => b.month?.slice(0, 7) === month).map((b) => b.categoryId));
    return categories.filter((category) => !used.has(category.id));
  }, [budgets, categories, month]);

  const formatCurrency = (amount) => `₹ ${Number(amount).toFixed(2)}`;
  const total = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>💰 Budget Tracker</h1>
      {!isLocked ? (
        <div style={styles.row}>
          <div style={styles.card}><label style={styles.label}>🔔 Alert (%)</label><input type="number" min="0" max="100" value={alertPercent} onChange={(e) => setAlertPercent(e.target.value)} style={styles.input} /></div>
          <div style={styles.card}><label style={styles.label}>📅 Select Month</label><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={styles.input} /></div>
          <button onClick={handleSetInitialValues} style={styles.button}>Set Alert & Month</button>
        </div>
      ) : (
        <div style={styles.lockedContainer}>✅ Alert: {alertPercent}% | Month: {month} (Locked)</div>
      )}

      <div style={styles.row}>
        <div style={{ ...styles.card, width: "40%" }}>
          <h2 style={styles.sectionHeader}>➕ Add Budget</h2>
          <form onSubmit={handleAddBudget} style={styles.form}>
            <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} style={styles.input} required>
              <option value="">Select Category</option>
              {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input type="number" min="0.01" step="0.01" placeholder="Enter Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.button}>Add Budget</button>
          </form>
        </div>

        <div style={{ ...styles.card, overflowX: "auto" }}>
          <h2 style={styles.sectionHeader}>📜 Budget List</h2>
          {loading ? <p style={styles.noDataText}>Loading budgets...</p> : budgets.length ? <>
            <table style={styles.budgetTable}><thead><tr><th style={styles.tableHeader}>Category</th><th style={styles.tableHeader}>Amount</th><th style={styles.tableHeader}>Month</th><th style={styles.tableHeader}>Actions</th></tr></thead>
              <tbody>{budgets.map((budget, index) => <tr key={budget.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                <td style={styles.tableData}>{budget.category?.name || "Unknown"}</td><td style={styles.tableData}>{formatCurrency(budget.amount)}</td><td style={styles.tableData}>{budget.month?.slice(0, 7)}</td>
                <td style={styles.tableData}><button onClick={() => handleDeleteBudget(budget.id)} style={styles.deleteButton}>🗑️</button></td>
              </tr>)}</tbody></table>
            <div style={styles.totalContainer}><strong>Total Budget:</strong> {formatCurrency(total)}</div>
          </> : <p style={styles.noDataText}>No budgets set yet.</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Rubik", maxWidth: "900px", margin: "0 auto", padding: "20px", backgroundColor: "#F4F7F9", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" },
  header: { textAlign: "center", color: "#4CAF50", fontSize: "32px", fontWeight: "600", marginBottom: "20px" },
  row: { display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", flexWrap: "wrap" },
  card: { flex: "1", background: "linear-gradient(135deg, #F9FAFB, #ECF0F3)", padding: "20px", borderRadius: "10px", boxShadow: "0 3px 12px rgba(0, 0, 0, 0.1)" },
  label: { fontWeight: "bold", marginBottom: "6px", display: "block", color: "#34495E" },
  input: { width: "90%", padding: "10px", marginBottom: "12px", border: "1px solid #BDC3C7", borderRadius: "6px", fontSize: "14px" },
  button: { backgroundColor: "#27AE60", color: "#FFF", padding: "12px", border: "none", marginBottom: "20px", borderRadius: "6px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", width: "100%" },
  lockedContainer: { textAlign: "center", fontWeight: "bold", margin: "15px 0", color: "#000", background: "#E8F6EF", padding: "10px", borderRadius: "8px" },
  sectionHeader: { color: "#2C3E50" },
  form: { display: "flex", flexDirection: "column" },
  budgetTable: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "#4CAF50", color: "white", padding: "10px", textAlign: "left" },
  tableData: { padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" },
  evenRow: { backgroundColor: "#f9f9f9" }, oddRow: { backgroundColor: "#fff" },
  deleteButton: { backgroundColor: "transparent", border: "none", fontSize: "18px", cursor: "pointer" },
  totalContainer: { marginTop: "10px", fontWeight: "bold", fontSize: "18px", textAlign: "right", color: "#2C3E50" },
  noDataText: { textAlign: "center", fontSize: "16px", color: "#888" },
};

export default BudgetTracker;
