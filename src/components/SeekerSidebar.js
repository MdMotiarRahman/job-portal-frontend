import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  FileText,
  LogOut,
  X,
  User,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import authService from '../services/auth.service';
import ReminderBell from './ReminderBell';
import '../styles/adminSidebar.css';

const menuItems = [
  { path: '/seeker', label: 'Dashboard', icon: BarChart3, exact: true },
  { path: '/seeker/profile', label: 'My Profile', icon: User },
  { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { path: '/seeker/recommendations', label: 'Recommended Jobs', icon: Sparkles },
  { path: '/seeker/applications', label: 'Applications', icon: FileText },
  { path: '/seeker/messages', label: 'Messages', icon: MessageSquare },
];

const SeekerSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
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
            onClick={() => handleNavigation('/seeker')}
          >
            <Briefcase className="admin-logo-icon" size={24} strokeWidth={1.5} />
            <span className="admin-logo-text">Job Seeker</span>
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
            <p className="admin-nav-label">Menu</p>
            {menuItems.map((item) => {
              const IconComponent = item.icon;

              return (
                <button
                  key={item.path}
                  className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  type="button"
                  aria-current={isActive(item.path, item.exact) ? 'page' : undefined}
                >
                  <span className="admin-nav-icon">
                    <IconComponent size={18} strokeWidth={1.5} />
                  </span>
                  <span className="admin-nav-label-text">{item.label}</span>
                </button>
              );
            })}
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

export default SeekerSidebar;
