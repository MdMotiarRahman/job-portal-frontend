import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EmployerSidebar from './EmployerSidebar';
import ReminderBell from './ReminderBell';
import MessageBell from './MessageBell';
import UserAvatar from './UserAvatar';
import authService from '../services/auth.service';
import employerService from '../services/employer.service';
import '../styles/adminLayout.css';

const EmployerLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const currentUser = authService.getCurrentUser()?.user;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employerService.getProfile();
        setProfile(res.profile || res);
      } catch (err) {
        console.log('Employer profile load error:', err);
      }
    };
    fetchProfile();
  }, []);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/employer/jobs/new')) return 'Create Job';
    if (/^\/employer\/jobs\/[^/]+\/edit$/.test(path)) return 'Edit Job';
    if (path.startsWith('/employer/jobs')) return 'My Jobs';
    if (path.startsWith('/employer/applications')) return 'Applications';
    if (path.startsWith('/employer/ats')) return 'ATS Pipeline';
    if (path.startsWith('/employer/messages')) return 'Messages';
    if (path.startsWith('/employer/profile')) return 'Company Profile';
    return 'Employer Dashboard';
  }, [location.pathname]);

  return (
    <div className="admin-layout employer-layout">
      <EmployerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`admin-layout-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-sidebar-toggle"
              onClick={() => setSidebarOpen((isOpen) => !isOpen)}
              aria-label="Toggle sidebar"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              type="button"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <h1 className="admin-page-title">{pageTitle}</h1>
          </div>

          <div className="admin-topbar-right">
            <ReminderBell />
            <MessageBell />
            <div className="admin-topbar-user">
              <UserAvatar
                profile={profile}
                user={currentUser}
                size={40}
                className="admin-user-avatar"
              />
              <div className="admin-user-meta">
                <strong>{currentUser?.name || 'Employer'}</strong>
                <span>{currentUser?.email || 'Hiring workspace'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
};

export default EmployerLayout;
