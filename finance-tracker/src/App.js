import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Footer from './components/Footer';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import News from './pages/News';

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
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Financenews" element={<News />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
      {/* Conditionally render the footer */}
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
