import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SeekerSidebar from './SeekerSidebar';
import ReminderBell from './ReminderBell';
import MessageBell from './MessageBell';
import UserAvatar from './UserAvatar';
import authService from '../services/auth.service';
import { getMyProfile } from '../services/seekerService';
import '../styles/adminLayout.css';

const SeekerLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const currentUser = authService.getCurrentUser()?.user;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
      } catch (err) {
        console.log('Profile load error:', err);
      }
    };
    fetchProfile();
  }, []);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/seeker') return 'Dashboard';
    if (path.startsWith('/seeker/profile')) return 'My Profile';
    if (path.startsWith('/seeker/applications')) return 'Applications';
    if (path.startsWith('/seeker/recommendations')) return 'Recommended Jobs';
    if (path.startsWith('/seeker/messages')) return 'Messages';
    if (path.startsWith('/jobs')) return 'Browse Jobs';
    return 'Job Seeker';
  }, [location.pathname]);

  return (
    <div className="admin-layout employer-layout">
      <SeekerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

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
                <strong>{currentUser?.name || 'Job Seeker'}</strong>
                <span>{currentUser?.email || 'JobLand account'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
};

export default SeekerLayout;
