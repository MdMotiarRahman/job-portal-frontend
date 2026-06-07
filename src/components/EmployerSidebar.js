import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  FilePlus2,
  LogOut,
  Search,
  X,
  Activity,
} from 'lucide-react';
import authService from '../services/auth.service';
import ReminderBell from './ReminderBell';
import '../styles/adminSidebar.css';

const menuItems = [
  { path: '/employer/dashboard', label: 'Overview', icon: BarChart3 },
  { path: '/employer/jobs/new', label: 'Create Job', icon: FilePlus2 },
  { path: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
  { path: '/employer/applications', label: 'Applications', icon: ClipboardList },
  { path: '/employer/ats', label: 'ATS Pipeline', icon: Activity },
];

const EmployerSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/employer/jobs') {
      return location.pathname === path || /^\/employer\/jobs\/[^/]+\/edit$/.test(location.pathname);
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen ? (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <button
            type="button"
            className="admin-sidebar-logo employer-sidebar-logo"
            onClick={() => handleNavigation('/employer/dashboard')}
          >
            <Building2 className="admin-logo-icon" size={24} strokeWidth={1.5} />
            <span className="admin-logo-text">Employer Portal</span>
          </button>
          <div className="admin-sidebar-header-actions">
            <ReminderBell />
            <button
              className="admin-sidebar-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="admin-sidebar-nav" role="navigation">
          <div className="admin-nav-section">
            <p className="admin-nav-label">Workspace</p>
            {menuItems.map((item) => {
              const IconComponent = item.icon;

              return (
                <button
                  key={item.path}
                  className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  type="button"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  <span className="admin-nav-icon">
                    <IconComponent size={18} strokeWidth={1.5} />
                  </span>
                  <span className="admin-nav-label-text">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="admin-nav-section">
            <p className="admin-nav-label">Explore</p>
            <button
              className="admin-nav-item"
              onClick={() => navigate('/jobs')}
              type="button"
            >
              <span className="admin-nav-icon">
                <Search size={18} strokeWidth={1.5} />
              </span>
              <span className="admin-nav-label-text">Public Jobs</span>
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout} type="button">
            <span className="admin-logout-icon">
              <LogOut size={16} strokeWidth={1.5} />
            </span>
            <span className="admin-logout-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default EmployerSidebar;
