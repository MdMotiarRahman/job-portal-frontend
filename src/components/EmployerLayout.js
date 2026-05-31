import React, { useState } from 'react';
import { Bell, ChevronLeft, ChevronRight, MessageCircle, User } from 'lucide-react';
import EmployerSidebar from './EmployerSidebar';
import '../styles/adminLayout.css';

const EmployerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <h1 className="admin-page-title">Employer Dashboard</h1>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-topbar-icon" title="Notifications" type="button">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <button className="admin-topbar-icon" title="Messages" type="button">
              <MessageCircle size={18} strokeWidth={1.5} />
            </button>
            <div className="admin-topbar-user">
              <div className="admin-user-avatar">
                <User size={20} strokeWidth={1.5} />
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
