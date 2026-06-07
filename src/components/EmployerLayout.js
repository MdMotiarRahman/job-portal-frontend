import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import EmployerSidebar from './EmployerSidebar';
import ReminderBell from './ReminderBell';
import authService from '../services/auth.service';
import '../styles/adminLayout.css';

const EmployerLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = authService.getCurrentUser()?.user;

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/employer/jobs/new')) return 'Create Job';
    if (/^\/employer\/jobs\/[^/]+\/edit$/.test(path)) return 'Edit Job';
    if (path.startsWith('/employer/jobs')) return 'My Jobs';
    if (path.startsWith('/employer/applications')) return 'Applications';
    if (path.startsWith('/employer/ats')) return 'ATS Pipeline';
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
            <div className="admin-topbar-user">
              <div className="admin-user-avatar">
                <User size={20} strokeWidth={1.5} />
              </div>
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
