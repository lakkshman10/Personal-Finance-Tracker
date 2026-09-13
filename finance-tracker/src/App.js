import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/expenseMate.css';
import './index.css';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import Budgeting from './pages/Budgeting';
import SavingsGoals from './pages/SavingsGoals';
import IncomeTracking from './pages/IncomeTracking';
import ReportsInsights from './pages/ReportsInsights';
import Accounts from './pages/Accounts';
import DebtManagement from './pages/DebtManagement';
import FinanceNews from './pages/News';
import Community from './pages/Community';
import ContactUs from './pages/ContactUs';
import FinanceAssistant from './pages/FinanceAssistant';

const routesWithSidebar = [
  '/dashboard',
  '/expense-tracker',
  '/budgeting',
  '/savings-goals',
  '/income-tracking',
  '/reports-insights',
  '/accounts',
  '/debts',
];

const pageClassMap = {
  '/dashboard': 'app-page-dashboard',
  '/expense-tracker': 'app-page-expense-tracker',
  '/budgeting': 'app-page-budgeting',
  '/savings-goals': 'app-page-savings-goals',
  '/income-tracking': 'app-page-income-tracking',
  '/reports-insights': 'app-page-reports-insights',
  '/accounts': 'app-page-accounts',
  '/debts': 'app-page-debts',
};

function MainContent() {
  const location = useLocation();
  const showSidebar = routesWithSidebar.includes(location.pathname);
  const pageClass = pageClassMap[location.pathname] || '';

  return (
    <div className="App">
      <NavBar />
      <div className={`expensemate-content ${pageClass}`} style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {showSidebar && <Sidebar />}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/expense-tracker" element={<ProtectedRoute element={ExpenseTracker} />} />
            <Route path="/budgeting" element={<ProtectedRoute element={Budgeting} />} />
            <Route path="/savings-goals" element={<ProtectedRoute element={SavingsGoals} />} />
            <Route path="/income-tracking" element={<ProtectedRoute element={IncomeTracking} />} />
            <Route path="/reports-insights" element={<ProtectedRoute element={ReportsInsights} />} />
            <Route path="/accounts" element={<ProtectedRoute element={Accounts} />} />
            <Route path="/debts" element={<ProtectedRoute element={DebtManagement} />} />
            <Route path="/finance-news" element={<ProtectedRoute element={FinanceNews} />} />
            <Route path="/community" element={<ProtectedRoute element={Community} />} />
            <Route path="/contact-us" element={<ProtectedRoute element={ContactUs} />} />
            <Route path="/finance-assistant" element={<ProtectedRoute element={FinanceAssistant} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
