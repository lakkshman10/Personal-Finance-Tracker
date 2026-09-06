import React, { useEffect, useMemo, useState } from "react";
import financeApi from "../services/financeApi";

const EMPTY_FORM = { amount: "", categoryId: "", description: "", date: "" };

function IncomeTracking() {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editIncomeId, setEditIncomeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, categoriesResponse, accountsResponse] = await Promise.all([
        financeApi.transactions.list({ type: "INCOME", limit: 500 }),
        financeApi.categories.list("INCOME"),
        financeApi.accounts.list({ activeOnly: true }),
      ]);

      setIncomes(transactionsResponse.data || []);
      const loadedCategories = categoriesResponse.data || [];
      const loadedAccounts = accountsResponse.data || [];
      setCategories(loadedCategories);
      setAccounts(loadedAccounts);

      setFormData((current) => ({
        ...current,
        categoryId: current.categoryId || loadedCategories[0]?.id || "",
      }));
    } catch (error) {
      console.error("Error loading PostgreSQL income data:", error);
      alert(error.response?.data?.message || "Failed to load income data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const resetForm = () => {
    setEditIncomeId(null);
    setFormData({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
  };

  const buildTransactionPayload = () => ({
    accountId: accounts[0]?.id,
    categoryId: formData.categoryId,
    type: "INCOME",
    amount: formData.amount,
    description: formData.description || "Income",
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
      if (editIncomeId) {
        await financeApi.transactions.update(editIncomeId, buildTransactionPayload());
      } else {
        await financeApi.transactions.create(buildTransactionPayload());
      }

      resetForm();
      await loadFinancialData();
    } catch (error) {
      console.error("Error saving income:", error);
      alert(error.response?.data?.message || "Failed to save income.");
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Delete this income entry?")) return;

    try {
      await financeApi.transactions.remove(id);
      setIncomes((current) => current.filter((income) => income.id !== id));
      if (editIncomeId === id) resetForm();
    } catch (error) {
      console.error("Error deleting income:", error);
      alert(error.response?.data?.message || "Failed to delete income.");
    }
  };

  const handleEditIncome = (income) => {
    setEditIncomeId(income.id);
    setFormData({
      amount: income.amount?.toString() || "",
      categoryId: income.categoryId || income.category?.id || "",
      description: income.description || "",
      date: income.transactionDate?.split("T")[0] || "",
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

  const getCategoryName = (income) => income.category?.name || "Uncategorized";

  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    return incomes
      .filter((income) => {
        const date = new Date(income.transactionDate);
        return date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear();
      })
      .reduce((sum, income) => sum + Number(income.amount), 0);
  }, [incomes]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Income Tracking</h1>

      <div style={styles.summaryCard}>
        <span style={styles.summaryLabel}>Current Month Income</span>
        <span style={styles.summaryAmount}>₹ {currentMonthTotal.toFixed(2)}</span>
      </div>

      <div style={styles.topSection}>
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionHeader}>{editIncomeId ? "Edit Income" : "Add Income"}</h2>
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              style={styles.input}
              required
            >
              <option value="">Select Income Category</option>
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
                {editIncomeId ? "Update Income" : "Add Income"}
              </button>
              {editIncomeId && (
                <button type="button" onClick={resetForm} style={styles.resetButton}>Cancel Edit</button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.rightColumn}>
          <h2 style={styles.sectionHeader}>Income History</h2>
          {loading ? (
            <p style={styles.noDataText}>Loading income...</p>
          ) : incomes.length ? (
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
                  {incomes.map((income) => (
                    <tr key={income.id}>
                      <td style={styles.tableData}>{formatDate(income.transactionDate)}</td>
                      <td style={styles.tableData}>{getCategoryName(income)}</td>
                      <td style={styles.tableData}>{income.description}</td>
                      <td style={styles.tableData}>₹ {Number(income.amount).toFixed(2)}</td>
                      <td style={styles.tableData}>
                        <button onClick={() => handleDeleteIncome(income.id)} style={styles.deleteButton}>Delete</button>
                        <button onClick={() => handleEditIncome(income)} style={styles.editButton}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={styles.noDataText}>No income added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Rubik", maxWidth: "1200px", margin: "0 auto", padding: "20px" },
  header: { textAlign: "center", marginBottom: "20px", color: "#4CAF50" },
  summaryCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", marginBottom: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" },
  summaryLabel: { color: "#343a40", fontWeight: "bold" },
  summaryAmount: { color: "#27AE60", fontWeight: "bold", fontSize: "20px" },
  topSection: { display: "flex", justifyContent: "space-between", marginBottom: "30px" },
  leftColumn: { flex: "1", marginRight: "10px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", maxWidth: "35%" },
  rightColumn: { flex: "2", marginLeft: "10px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" },
  scrollableContainer: { maxHeight: "270px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px", backgroundColor: "#ffffff", padding: "10px" },
  sectionHeader: { marginBottom: "15px", color: "#343a40" },
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
};

export default IncomeTracking;
