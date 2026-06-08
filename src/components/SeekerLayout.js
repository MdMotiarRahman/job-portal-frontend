import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SeekerSidebar from './SeekerSidebar';
import ReminderBell from './ReminderBell';
import MessageBell from './MessageBell';
import authService from '../services/auth.service';
import '../styles/adminLayout.css';

const SeekerLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = authService.getCurrentUser()?.user;

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/seeker') return 'Dashboard';
    if (path.startsWith('/seeker/profile')) return 'My Profile';
    if (path.startsWith('/seeker/applications')) return 'Applications';
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
              <div className="admin-user-avatar">
                <User size={20} strokeWidth={1.5} />
              </div>
              <div className="admin-user-meta">
                <strong>{currentUser?.name || 'Job Seeker'}</strong>
                <span>{currentUser?.email || 'Job portal account'}</span>
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
