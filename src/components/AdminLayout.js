import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ReminderBell from './ReminderBell';
import UserAvatar from './UserAvatar';
import authService from '../services/auth.service';
import '../styles/adminLayout.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const currentUser = authService.getCurrentUser()?.user;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchProfile = async () => {
    try {
      const res = await authService.getMe();
      setProfile(res.data?.user || null);
    } catch (err) {
      console.log('Admin profile load error:', err);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('admin-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('admin-profile-updated', handleProfileUpdate);
  }, []);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/users')) return 'Users';
    if (path.startsWith('/admin/employers')) return 'Employers';
    if (path.startsWith('/admin/jobs')) return 'Jobs';
    if (path.startsWith('/admin/applications')) return 'Applications';
    if (path.startsWith('/admin/ats')) return 'ATS Pipeline';
    if (path.startsWith('/admin/analytics')) return 'Analytics';
    if (path.startsWith('/admin/reports')) return 'Reports';
    if (path.startsWith('/admin/settings')) return 'Settings';
    if (path.startsWith('/admin/profile')) return 'Profile';
    return 'Admin Dashboard';
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className={`admin-layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-topbar-right">
            <ReminderBell />
            <div className="admin-topbar-user">
              <UserAvatar
                profile={profile ? { profileImage: profile.profileImage } : null}
                user={currentUser}
                size={40}
                className="admin-user-avatar"
              />
              <div className="admin-user-meta">
                <strong>{currentUser?.name || 'Admin'}</strong>
                <span>{currentUser?.email || 'Administrator'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-layout-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
