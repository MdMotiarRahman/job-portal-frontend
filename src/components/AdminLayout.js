import React, { useState } from 'react';
import { Bell, MessageCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import '../styles/adminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
            <h1 className="admin-page-title">Admin Dashboard</h1>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-topbar-icon" title="Notifications">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <button className="admin-topbar-icon" title="Messages">
              <MessageCircle size={18} strokeWidth={1.5} />
            </button>
            <div className="admin-topbar-user">
              <div className="admin-user-avatar">
                <User size={20} strokeWidth={1.5} />
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
