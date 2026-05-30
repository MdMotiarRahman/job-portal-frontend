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
} from 'lucide-react';
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
        { label: 'All Users', path: '/admin/users' },
        { label: 'Active Users', path: '/admin/users?status=active' },
        { label: 'Banned Users', path: '/admin/users?status=banned' },
        { label: 'Pending Verification', path: '/admin/users?status=pending' },
      ],
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: Briefcase,
      path: '/admin/jobs',
      submenu: [
        { label: 'All Jobs', path: '/admin/jobs' },
        { label: 'Pending Approval', path: '/admin/jobs?status=pending' },
        { label: 'Approved Jobs', path: '/admin/jobs?status=approved' },
        { label: 'Rejected Jobs', path: '/admin/jobs?status=rejected' },
        { label: 'Closed Jobs', path: '/admin/jobs?status=closed' },
      ],
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: ClipboardList,
      path: '/admin/applications',
      submenu: [
        { label: 'All Applications', path: '/admin/applications' },
        { label: 'Pending', path: '/admin/applications?status=Pending' },
        { label: 'Approved', path: '/admin/applications?status=Approved' },
        { label: 'Rejected', path: '/admin/applications?status=Rejected' },
        { label: 'Hired', path: '/admin/applications?status=Hired' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics',
      submenu: [
        { label: 'Overview', path: '/admin/analytics' },
        { label: 'User Analytics', path: '/admin/analytics/users' },
        { label: 'Job Analytics', path: '/admin/analytics/jobs' },
        { label: 'Application Analytics', path: '/admin/analytics/applications' },
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

  const isActive = useCallback((path) => {
    const [pathname, search = ''] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search.replace(/^\?/, '');

    if (search) {
      return currentPath === pathname && currentSearch === search;
    }

    return currentPath === pathname || currentPath.startsWith(`${pathname}/`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const activeMenu = menuItems.find((item) =>
      item.submenu?.some((subitem) => isActive(subitem.path))
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
          <button
            className="admin-sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
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
                            isActive(subitem.path) ? 'active' : ''
                          }`}
                          onClick={() => handleNavigation(subitem.path)}
                          aria-current={isActive(subitem.path) ? 'page' : undefined}
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
