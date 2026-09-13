import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { checkAuth } from './store/authSlice';
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
import DebtManagement from './components/debt/DebtManagement';
import FinanceNews from './pages/FinanceNews';
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
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const showSidebar = routesWithSidebar.includes(location.pathname);
  const pageClass = pageClassMap[location.pathname] || '';

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="App">
      <NavBar />
      <div className={`expensemate-content ${pageClass}`} style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {showSidebar && isAuthenticated && <Sidebar />}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/expense-tracker" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
            <Route path="/budgeting" element={<ProtectedRoute><Budgeting /></ProtectedRoute>} />
            <Route path="/savings-goals" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />
            <Route path="/income-tracking" element={<ProtectedRoute><IncomeTracking /></ProtectedRoute>} />
            <Route path="/reports-insights" element={<ProtectedRoute><ReportsInsights /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/debts" element={<ProtectedRoute><DebtManagement /></ProtectedRoute>} />
            <Route path="/finance-news" element={<ProtectedRoute><FinanceNews /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/contact-us" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
            <Route path="/finance-assistant" element={<ProtectedRoute><FinanceAssistant /></ProtectedRoute>} />
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
    <Provider store={store}>
      <Router>
        <MainContent />
      </Router>
    </Provider>
  );
}

export default App;
