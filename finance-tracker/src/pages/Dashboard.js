import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'; // For pie chart
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'; // For line chart
import { ProgressBar } from 'react-bootstrap'; // For progress bar (You can use react-circular-progressbar too)
import { Alert } from 'react-bootstrap'; // For alerts

// Mock Data for Charts
const expenseData = [
  { name: 'Food', value: 400 },
  { name: 'Entertainment', value: 300 },
  { name: 'Travel', value: 200 },
  { name: 'Bills', value: 100 },
];

const savingsProgress = 70; // 70% towards savings goal
const budgetStatusData = [
  { month: 'January', spent: 1000, budget: 1200 },
  { month: 'February', spent: 800, budget: 1000 },
  { month: 'March', spent: 600, budget: 1000 },
  { month: 'April', spent: 1100, budget: 1200 },
];

//const trendData = [
//  { month: 'Jan', savings: 300 },
// { month: 'Feb', savings: 400 },
//  { month: 'Mar', savings: 500 },
//  { month: 'Apr', savings: 650 },
//];

const alerts = [
  { message: "Rent payment due in 3 days!" },
  { message: "Exceeded grocery budget by $50." },
  { message: "Reminder: Credit card bill due next week." },
];

function Dashboard() {
  return (
    <div style={styles.dashboard}>
      {/* Top Section */}
      <div style={styles.topSection}>
        <h2>Good Morning, John!</h2>
        <div style={styles.financialHealthSummary}>
          <div style={styles.statCard}>You've saved $500 this month!</div>
        </div>
      </div>

      {/* Middle Section */}
      <div style={styles.middleSection}>
        <div style={styles.chartContainer}>
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={100} fill="#82ca9d">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.progressBarContainer}>
          <h3>Savings Goal Progress</h3>
          <ProgressBar now={savingsProgress} label={`${savingsProgress}%`} />
        </div>
        <div style={styles.budgetStatusContainer}>
          <h3>Budget Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spent" stroke="#8884d8" />
              <Line type="monotone" dataKey="budget" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <h3>Upcoming Alerts</h3>
        {alerts.map((alert, index) => (
          <Alert key={index} variant="warning" style={styles.alert}>
            {alert.message}
          </Alert>
        ))}
      </div>
    </div>
  );
}

// Helper function for pie chart colors
const getChartColor = (index) => {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return colors[index % colors.length];
};

// Styles for dashboard components
const styles = {
  dashboard: {
    padding: '20px',
    backgroundColor: '#f4f4f4',
  },
  topSection: {
    marginBottom: '30px',
  },
  financialHealthSummary: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: '#2ecc71',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  middleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },
  chartContainer: {
    width: '48%',
  },
  progressBarContainer: {
    width: '48%',
  },
  budgetStatusContainer: {
    width: '48%',
  },
  bottomSection: {
    marginTop: '20px',
  },
  alert: {
    marginBottom: '10px',
  },
};

export default Dashboard;
