import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Briefcase,
  ClipboardList,
  TrendingUp,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Building2,
  X,
  Activity,
} from 'lucide-react';
import ReminderBell from './ReminderBell';
import '../styles/adminSidebar.css';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/admin/dashboard',
      submenu: null,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      submenu: [
        { label: 'All Users', path: '/admin/users/all' },
        { label: 'Active Users', path: '/admin/users/active' },
        { label: 'Banned Users', path: '/admin/users/banned' },
        { label: 'Pending Verification', path: '/admin/users/pending' },
      ],
    },
    {
      id: 'employers',
      label: 'Employer Verification',
      icon: Building2,
      path: '/admin/employers',
      submenu: [
        { label: 'All Employers', path: '/admin/employers/all' },
        { label: 'Pending Review', path: '/admin/employers/pending' },
        { label: 'Approved', path: '/admin/employers/approved' },
        { label: 'Rejected', path: '/admin/employers/rejected' },
      ],
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: Briefcase,
      path: '/admin/jobs',
      submenu: [
        { label: 'All Jobs', path: '/admin/jobs/all' },
        { label: 'Pending Approval', path: '/admin/jobs/pending' },
        { label: 'Approved Jobs', path: '/admin/jobs/approved' },
        { label: 'Rejected Jobs', path: '/admin/jobs/rejected' },
        { label: 'Closed Jobs', path: '/admin/jobs/closed' },
      ],
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: ClipboardList,
      path: '/admin/applications',
      submenu: [
        { label: 'All Applications', path: '/admin/applications/all' },
        { label: 'Pending', path: '/admin/applications/pending' },
        { label: 'Reviewing', path: '/admin/applications/reviewing' },
        { label: 'Shortlisted', path: '/admin/applications/shortlisted' },
        { label: 'Interview Scheduled', path: '/admin/applications/interview' },
        { label: 'Accepted', path: '/admin/applications/accepted' },
        { label: 'Rejected', path: '/admin/applications/rejected' },
      ],
    },
    {
      id: 'ats',
      label: 'ATS Pipeline',
      icon: Activity,
      path: '/admin/ats',
      submenu: [
        { label: 'Pipeline Board', path: '/admin/ats' },
        { label: 'Hiring Analytics', path: '/admin/ats/analytics' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics',
      submenu: [
        { label: 'Platform Overview', path: '/admin/analytics' },
        { label: 'Users by Role', path: '/admin/analytics/users' },
        { label: 'Jobs by Status', path: '/admin/analytics/jobs' },
        { label: 'Applications by Status', path: '/admin/analytics/applications' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/admin/reports',
      submenu: null,
    },
  ], []);

  const settingsItems = useMemo(() => [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/admin/profile',
    },
  ], []);

  const isActive = useCallback((path, exactSearch = false) => {
    const [pathname, search = ''] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search.replace(/^\?/, '');

    if (search) {
      return currentPath === pathname && currentSearch === search;
    }

    if (exactSearch) {
      return currentPath === pathname && !currentSearch;
    }

    return currentPath === pathname || currentPath.startsWith(`${pathname}/`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const activeMenu = menuItems.find((item) =>
      item.submenu?.some((subitem) => isActive(subitem.path, true))
    );

    if (activeMenu) {
      setExpandedMenu(activeMenu.id);
    }
  }, [isActive, menuItems]);

  const toggleSubmenu = (itemId, e) => {
    e.preventDefault();
    setExpandedMenu(expandedMenu === itemId ? null : itemId);
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <Building2 className="admin-logo-icon" size={24} strokeWidth={1.5} />
            <span className="admin-logo-text">JobPortal</span>
          </div>
          <div className="admin-sidebar-header-actions">
            <ReminderBell />
            <button
              className="admin-sidebar-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="admin-sidebar-nav" role="navigation">
          <div className="admin-nav-section">
            <p className="admin-nav-label">Main</p>

            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="admin-nav-item-wrapper">
                  <button
                    className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={(e) => {
                      if (item.submenu) {
                        toggleSubmenu(item.id, e);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    aria-expanded={item.submenu ? expandedMenu === item.id : undefined}
                  >
                    <span className="admin-nav-icon">
                      <IconComponent size={18} strokeWidth={1.5} />
                    </span>
                    <span className="admin-nav-label-text">{item.label}</span>
                    {item.submenu && (
                      <span
                        className={`admin-nav-arrow ${
                          expandedMenu === item.id ? 'expanded' : ''
                        }`}
                      >
                        <ChevronRight size={16} />
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && expandedMenu === item.id && (
                    <div className="admin-submenu" aria-label={`${item.label} submenu`}>
                      {item.submenu.map((subitem, idx) => (
                        <button
                          key={idx}
                          className={`admin-submenu-item ${
                            isActive(subitem.path, true) ? 'active' : ''
                          }`}
                          onClick={() => handleNavigation(subitem.path)}
                          aria-current={isActive(subitem.path, true) ? 'page' : undefined}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="admin-nav-section">
            <p className="admin-nav-label">Account</p>

            {settingsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
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
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
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

export default AdminSidebar;
