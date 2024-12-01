import React, { useState } from "react";

function FinanceAssistant() {
  const [activeTab, setActiveTab] = useState("tax");

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Finance Assistant</h1>

      {/* Tabs for Navigation */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "tax" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("tax")}
        >
          Tax Calculator
        </button>
        <button
          style={activeTab === "loan" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("loan")}
        >
          Loan Calculator
        </button>
        <button
          style={activeTab === "investment" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("investment")}
        >
          Investment Calculator
        </button>
      </div>

      {/* Dynamic Section Rendering */}
      <div style={styles.content}>
        {activeTab === "tax" && <TaxCalculator />}
        {activeTab === "loan" && <LoanCalculator />}
        {activeTab === "investment" && <InvestmentCalculator />}
      </div>
    </div>
  );
}

function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [regime, setRegime] = useState("old");
  const [tax, setTax] = useState(0);

  const calculateTax = () => {
    const slabs = regime === "new"
      ? [
          { limit: 300000, rate: 0 },
          { limit: 600000, rate: 0.05 },
          { limit: 900000, rate: 0.1 },
          { limit: 1200000, rate: 0.15 },
          { limit: 1500000, rate: 0.2 },
          { limit: Infinity, rate: 0.3 },
        ]
      : [
          { limit: 250000, rate: 0 },
          { limit: 500000, rate: 0.05 },
          { limit: 1000000, rate: 0.2 },
          { limit: Infinity, rate: 0.3 },
        ];

    let taxableIncome = regime === "old" ? income - deductions : income;
    let calculatedTax = 0;

    for (const { limit, rate } of slabs) {
      const taxable = Math.min(taxableIncome, limit);
      calculatedTax += taxable * rate;
      taxableIncome -= taxable;
      if (taxableIncome <= 0) break;
    }

    setTax(calculatedTax);
  };

  return (
    <div style={styles.calculator}>
      <h2 style={styles.subheading}>Tax Calculator</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>Income:</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setIncome("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Deductions (Old Regime):</label>
        <input
          type="number"
          value={deductions}
          onChange={(e) => setDeductions(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setDeductions("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Regime:</label>
        <select
          value={regime}
          onChange={(e) => setRegime(e.target.value)}
          style={styles.input}
        >
          <option value="old">Old Regime</option>
          <option value="new">New Regime</option>
        </select>
      </div>
      <button onClick={calculateTax} style={styles.button}>
        Calculate Tax
      </button>
      <p style={styles.result}>Estimated Tax: ₹{tax.toFixed(2)}</p>
    </div>
  );
}

function LoanCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [emi, setEmi] = useState(0);

  const calculateEMI = () => {
    const monthlyRate = rate / 12 / 100;
    const totalMonths = tenure * 12;
    const calculatedEmi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    setEmi(calculatedEmi);
  };

  return (
    <div style={styles.calculator}>
      <h2 style={styles.subheading}>Loan Calculator</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>Loan Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setAmount("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Interest Rate (%):</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setRate("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Tenure (Years):</label>
        <input
          type="number"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setTenure("")}
          style={styles.input}
        />
      </div>
      <button onClick={calculateEMI} style={styles.button}>
        Calculate EMI
      </button>
      <p style={styles.result}>Monthly EMI: ₹{emi.toFixed(2)}</p>
    </div>
  );
}

function InvestmentCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [futureValue, setFutureValue] = useState(0);

  const calculateFutureValue = () => {
    const compoundFrequency = 1; // Annually
    const calculatedFV =
      principal * Math.pow(1 + rate / (compoundFrequency * 100), time);
    setFutureValue(calculatedFV);
  };

  return (
    <div style={styles.calculator}>
      <h2 style={styles.subheading}>Investment Calculator</h2>
      <div style={styles.formGroup}>
        <label style={styles.label}>Principal Amount:</label>
        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setPrincipal("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Interest Rate (%):</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setRate("")}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Time (Years):</label>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          onFocus={(e) => e.target.value === "0" && setTime("")}
          style={styles.input}
        />
      </div>
      <button onClick={calculateFutureValue} style={styles.button}>
        Calculate Future Value
      </button>

      <p style={styles.result}>
        Future Value: ₹{futureValue.toFixed(2)}
      </p>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Rubik", sans-serif',
    padding: "20px",
    color: "#333",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: "30px",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    gap: "10px",
  },
  tab: {
    padding: "10px 20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
    fontSize: "1rem",
  },
  activeTab: {
    padding: "10px 20px",
    border: "1px solid #4CAF50",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
  },
  content: {
    marginTop: "20px",
  },
  calculator: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  subheading: {
    fontSize: "1.8rem",
    color: "#333",
    marginBottom: "20px",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
  },
  result: {
    marginTop: "15px",
    fontSize: "1.2rem",
    color: "#333",
  },
};

export default FinanceAssistant;
