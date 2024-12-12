import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation,Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <Router>
      <MainContent isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
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
  ];

  const showSidebar = routesWithSidebar.includes(location.pathname);
  const showFooter = ['/Financenews', '/home'].includes(location.pathname);

  return (
<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        )}
        <div style={{ flex: 1, marginLeft: showSidebar ? (isSidebarCollapsed ? '70px' : '0') : '0', transition: 'margin-left 0.3s ease' }}>
           <Routes>
            {/* Non-protected routes */}
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Financenews" element={<News />} />
            <Route path="/FinanceAssistant" element={<FinanceAssistant />} />
            <Route path="/Community" element={<Community />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={Dashboard} />}
            />
            <Route
              path="/expense-tracker"
              element={<ProtectedRoute element={ExpenseTracker} />}
            />
            <Route
              path="/budgeting"
              element={<ProtectedRoute element={Budgeting} />}
            />
            <Route
              path="/savings-goals"
              element={<ProtectedRoute element={SavingsGoals} />}
            />
            <Route
              path="/income-tracking"
              element={<ProtectedRoute element={IncomeTracking} />}
            />
            <Route
              path="/reports-insights"
              element={<ProtectedRoute element={ReportsInsights} />}
            />
          </Routes>
        </div>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
