import React, { useEffect, useState } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Briefcase,
  LogOut,
  Home,
  User,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';

import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/theme.css';
import './App.css';

import HomePage from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import SessionWarningModal from './components/SessionWarningModal';
import { SessionProvider } from './context/SessionContext';

import AdminDashboard from './components/AdminDashboard';
import AdminJobManagement from './components/AdminJobManagement';
import AdminApplicationManagement from './components/AdminApplicationManagement';
import AdminEmployerManagement from './components/AdminEmployerManagement';
import AdminUserManagement from './components/AdminUserManagement';
import EmployerDashboard from './components/EmployerDashboard';
import SeekerDashboard from './components/SeekerDashboard';

import SeekerProfile from './pages/SeekerProfile';
import ApplyJob from './pages/ApplyJob';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import ReminderCenter from './components/ReminderCenter';

import ProtectedRoute from './components/ProtectedRoute';

import authService from './services/auth.service';


// ============================
// NAVIGATION
// ============================

const Navigation = () => {

  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  const [user, setUser] = useState(
    authService.getCurrentUser()
  );
  const userRole = authService.getCurrentUserRole();

  useEffect(() => {

    const handleLogin = () => {
      setUser(authService.getCurrentUser());
    };

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener(
      'auth:login',
      handleLogin
    );

    window.addEventListener(
      'auth:logout',
      handleLogout
    );

    return () => {

      window.removeEventListener(
        'auth:login',
        handleLogin
      );

      window.removeEventListener(
        'auth:logout',
        handleLogout
      );

    };

  }, []);

  const logOut = () => {

    authService.logout();

    setUser(null);

    navigate('/login');

  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (

    <nav className="modern-navbar">

      <div className="navbar-container">

        {/* LOGO */}

        {user ? (

          <div className="navbar-brand">

            <div className="brand-logo">
              <Briefcase size={24} />
            </div>

            <span>JobPortal</span>

          </div>

        ) : (

          <Link to="/" className="navbar-brand">

            <div className="brand-logo">
              <Briefcase size={24} />
            </div>

            <span>JobPortal</span>

          </Link>

        )}

        {/* DESKTOP MENU */}

        <div className="navbar-menu desktop-only">

          {!user ? (
            <>
  
            <Link
                to="/home"
                className={`nav-link ${isActive('/home') ? 'active' : ''}`}
              >
                Home
              </Link>

              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              >
                Jobs
              </Link>
            </>
          ) : userRole === 'admin' ? (
            <>
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin Dashboard
              </Link>

              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              >
                Jobs
              </Link>
            </>
          ) : userRole === 'employer' ? (
            <>
              <Link
                to="/employer"
                className={`nav-link ${isActive('/employer') ? 'active' : ''}`}
              >
                Dashboard
              </Link>

              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              >
                Jobs
              </Link>
            </>

          ) : (

            <>
              {/* ADMIN */}

              {userRole === 'admin' && (

                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  Admin Dashboard
                </Link>

              )}

              {/* EMPLOYER */}

              {userRole === 'employer' && (

                <Link
                  to="/employer"
                  className={`nav-link ${isActive('/employer') ? 'active' : ''}`}
                >
                  Employer Dashboard
                </Link>

              )}

              {/* SEEKER */}

              {userRole === 'seeker' && (

                <>
                  <Link
                    to="/seeker"
                    className={`nav-link ${isActive('/seeker') ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/seeker/profile"
                    className={`nav-link ${isActive('/seeker/profile') ? 'active' : ''}`}
                  >
                    Profile
                  </Link>

              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              >
                Jobs
              </Link>

                  <Link
                    to="/seeker/applications"
                    className={`nav-link ${isActive('/seeker/applications') ? 'active' : ''}`}
                  >
                    My Applications
                  </Link>
                </>

              )}

            </>

          )}

        </div>

        {/* RIGHT SIDE */}

        <div className="navbar-actions desktop-only">

          {user ? (

            <button
              onClick={logOut}
              className="btn-logout"
            >
              <LogOut size={18} />
              Logout
            </button>

          ) : (

            <>
              <Link
                to="/login"
                className="btn-text"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn-primary-sm"
              >
                Register
                <ArrowRight size={16} />
              </Link>
            </>

          )}

        </div>

        {/* MOBILE BUTTON */}

        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* MOBILE MENU */}

      {isOpen && (

        <div className="mobile-menu">

          {!user ? (
            <>
  
            <Link
                to="/home"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <Home size={18} />
                Home
              </Link>

              <Link
                to="/jobs"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase size={18} />
                Jobs
              </Link>
            </>
          ) : userRole === 'admin' ? (
            <>
              <Link
                to="/admin"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/jobs"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase size={18} />
                Jobs
              </Link>
            </>
          ) : userRole === 'employer' ? (
            <>
              <Link
                to="/employer"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/jobs"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase size={18} />
                Jobs
              </Link>
            </>

          ) : (

            <>
              {/* ADMIN */}

              {userRole === 'admin' && (

                <Link
                  to="/admin"
                  className="mobile-link"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>

              )}

              {/* EMPLOYER */}

              {userRole === 'employer' && (

                <Link
                  to="/employer"
                  className="mobile-link"
                  onClick={() => setIsOpen(false)}
                >
                  Employer Dashboard
                </Link>

              )}

              {/* SEEKER */}

              {userRole === 'seeker' && (

                <>
                  <Link
                    to="/seeker"
                    className="mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/seeker/profile"
                    className="mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>

              <Link
                to="/jobs"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase size={18} />
                Jobs
              </Link>

                  <Link
                    to="/seeker/applications"
                    className="mobile-link"
                    onClick={() => setIsOpen(false)}
                  >
                    My Applications
                  </Link>
                </>

              )}

            </>

          )}

          {user ? (

            <button
              onClick={logOut}
              className="mobile-link logout-mobile-btn"
            >
              <LogOut size={18} />
              Logout
            </button>

          ) : (

            <>
              <Link
                to="/login"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                Login
              </Link>

              <Link
                to="/register"
                className="mobile-link"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>

          )}

        </div>

      )}

    </nav>

  );

};


// ============================
// FOOTER
// ============================

const Footer = () => {

  return (

    <footer className="modern-footer">

      <div className="footer-container">

        <div className="footer-grid">

          <div className="footer-brand-col">

            <Link to="/" className="footer-brand">

              <Briefcase size={24} />

              <span>JobPortal</span>

            </Link>

            <p className="footer-description">
              Connecting job seekers and employers worldwide with modern hiring solutions.
            </p>

          </div>

          <div className="footer-links-col">

            <h4 className="footer-heading">
              Platform
            </h4>

            <Link to="/seeker">
              Dashboard
            </Link>

            <Link to="/seeker/profile">
              Profile
            </Link>

            <Link to="/jobs">
              Jobs
            </Link>

            <Link to="/seeker/applications">
              My Applications
            </Link>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>

        </div>

      </div>

    </footer>

  );

};


// ============================
// APP
// ============================

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEmployerRoute = location.pathname.startsWith('/employer');
  const isPortalRoute = isAdminRoute || isEmployerRoute;


  return (

    <div className={`app-wrapper ${isPortalRoute ? 'admin-app-wrapper' : ''}`}>

      <SessionWarningModal />

      {!isPortalRoute && <Navigation />}

      <main className={`main-content ${isPortalRoute ? 'admin-main-content' : ''}`}>

        <Routes>

          {/* PUBLIC */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/home"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/jobs"
            element={<Jobs />}
          />

          {/* REMINDERS - ACCESSIBLE TO ALL AUTHENTICATED USERS */}

          <Route
            path="/reminders"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employer', 'seeker']}>
                <ReminderCenter />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminJobManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApplicationManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEmployerManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* EMPLOYER */}

          <Route
            path="/employer"
            element={<Navigate to="/employer/dashboard" replace />}
          />

          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard page="overview" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard page="jobs" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard page="new-job" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/:jobId/edit"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard page="edit-job" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/applications"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard page="applications" />
              </ProtectedRoute>
            }
          />

          {/* SEEKER */}

          <Route
            path="/seeker"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/profile"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <SeekerProfile />
              </ProtectedRoute>
            }
          />

            <Route
              path="/seeker/applications"
              element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

          <Route
            path="/apply-job/:id"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <ApplyJob />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

      {!isPortalRoute && <Footer />}

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </Router>
  );
};

export default App;
