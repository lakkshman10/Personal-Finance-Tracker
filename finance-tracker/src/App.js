import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from './redux/actions';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import api, { setAccessToken } from './services/api';
import Home from './pages/Home';
import FinanceAssistant from './pages/FinanceAssistant';
import News from './pages/News';
import Community from './pages/Community';
import ContactUs from './pages/ContactUs';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import Budgeting from './pages/Budgeting';
import SavingsGoals from './pages/SavingsGoals';
import IncomeTracking from './pages/IncomeTracking';
import ReportsInsights from './pages/ReportsInsights';
import Accounts from './pages/Accounts';
import Account from './pages/Account';
import DebtManagement from './pages/DebtManagement';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        const accessToken = refreshResponse.data?.accessToken;
        if (!accessToken) throw new Error('No access token returned.');

        setAccessToken(accessToken);
        dispatch(setToken(accessToken));

        const checkResponse = await api.get('/auth/check');
        dispatch(setUser(checkResponse.data.user));
      } catch {
        setAccessToken(null);
        dispatch(setToken(null));
        dispatch(setUser(null));
        localStorage.removeItem('user');
      } finally {
        if (mounted) setAuthInitializing(false);
      }
    };

    restoreSession();
    return () => { mounted = false; };
  }, [dispatch]);

  if (authInitializing) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <Router>
      <MainContent
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
      />
    </Router>
  );
}

function MainContent({ isSidebarCollapsed, toggleSidebar }) {
  const location = useLocation();
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
  const showSidebar = routesWithSidebar.includes(location.pathname);
  const showFooter = ['/Financenews', '/home'].includes(location.pathname);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {showSidebar && (
          <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        )}
        <div
          style={{
            flex: 1,
            marginLeft: showSidebar ? (isSidebarCollapsed ? '70px' : '0') : '0',
            transition: 'margin-left .3s ease',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Financenews" element={<News />} />
            <Route path="/FinanceAssistant" element={<FinanceAssistant />} />
            <Route path="/Community" element={<Community />} />
            <Route path="/Contactus" element={<ContactUs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/expense-tracker" element={<ProtectedRoute element={ExpenseTracker} />} />
            <Route path="/budgeting" element={<ProtectedRoute element={Budgeting} />} />
            <Route path="/savings-goals" element={<ProtectedRoute element={SavingsGoals} />} />
            <Route path="/income-tracking" element={<ProtectedRoute element={IncomeTracking} />} />
            <Route path="/reports-insights" element={<ProtectedRoute element={ReportsInsights} />} />
            <Route path="/accounts" element={<ProtectedRoute element={Accounts} />} />
            <Route path="/account" element={<ProtectedRoute element={Account} />} />
            <Route path="/debts" element={<ProtectedRoute element={DebtManagement} />} />
          </Routes>
        </div>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
