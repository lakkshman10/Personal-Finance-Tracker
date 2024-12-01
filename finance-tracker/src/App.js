import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import FinanceAssistant from './pages/FinanceAssistant';
import News from './pages/News';
import Community from './pages/Community';
import ContactUs from './pages/ContactUs';
import Footer from './components/Footer';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';  // New Page for Dashboard
import ExpenseTracker from './pages/ExpenseTracker';  // New Page for Expense Tracker
import Budgeting from './pages/Budgeting';  // New Page for Budgeting
import SavingsGoals from './pages/SavingsGoals';  // New Page for Savings Goals
import IncomeTracking from './pages/IncomeTracking';  // New Page for Income Tracking
import ReportsInsights from './pages/ReportsInsights';  // New Page for Reports & Insights

function App() {
  return (
    <Router>
      <NavBar />
      <MainContent />
    </Router>
  );
}

function MainContent() {
  const location = useLocation();

  // Define paths where the footer should appear
  const showFooter = ["/Financenews", "/home"].includes(location.pathname);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: "1" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Financenews" element={<News />} />
          <Route path="/FinanceAssistant" element={<FinanceAssistant />} />
          <Route path="/Community" element={<Community />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Add new routes for the dashboard features */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/budgeting" element={<Budgeting />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/income-tracking" element={<IncomeTracking />} />
          <Route path="/reports-insights" element={<ReportsInsights />} />
        </Routes>
      </div>
      {/* Conditionally render the footer */}
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
