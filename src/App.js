import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Home, User, Menu, X, ArrowRight } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import './App.css';

import HomePage from './components/Home'; // Alias to avoid conflict if any
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import authService from './services/auth.service';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    const handleLogin = () => setUser(authService.getCurrentUser());
    const handleLogout = () => setUser(null);

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const logOut = () => {
    authService.logout();
    setUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setIsOpen(false)}>
          <div className="brand-logo">
            <Briefcase size={24} strokeWidth={2.5} />
          </div>
          <span>JobPortal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-only">
          <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </div>

        <div className="navbar-actions desktop-only">
          {user ? (
            <button onClick={logOut} className="btn-logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-text">Sign In</Link>
              <Link to="/register" className="btn-primary-sm">
                Get Started
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/home" className="mobile-link" onClick={() => setIsOpen(false)}>
            <Home size={18} /> Home
          </Link>
          {user ? (
            <button onClick={logOut} className="mobile-link text-danger w-full text-left">
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsOpen(false)}>
                <User size={18} /> Sign In
              </Link>
              <Link to="/register" className="mobile-link highlight" onClick={() => setIsOpen(false)}>
                <ArrowRight size={18} /> Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <Briefcase size={24} strokeWidth={2.5} className="text-primary" />
              <span>JobPortal</span>
            </Link>
            <p className="footer-description">
              Connecting top talent with the world's most innovative companies. Built for modern professionals.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">LinkedIn</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/companies">Companies</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Resources</h4>
            <Link to="/blog">Blog</Link>
            <Link to="/guide">Career Guide</Link>
            <Link to="/support">Help Center</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JobPortal Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app-wrapper">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/seeker" element={<SeekerDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
