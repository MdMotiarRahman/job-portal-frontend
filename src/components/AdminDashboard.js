import React, { useEffect, useState, useMemo } from 'react';
import {
  Briefcase,
  FileText,
  RefreshCw,
  ShieldCheck,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ReminderWidget from './ReminderWidget';
import {
  getAnalytics,
  getDashboardStats,
} from '../services/adminService';
import '../styles/adminDashboard.css';

const quickLinks = [
  { label: 'Manage Users', path: '/admin/users/all', icon: Users, color: '#6366f1' },
  { label: 'Employer Verification', path: '/admin/employers/pending', icon: ShieldCheck, color: '#f59e0b' },
  { label: 'Job Approvals', path: '/admin/jobs/pending', icon: Briefcase, color: '#10b981' },
  { label: 'Applications', path: '/admin/applications/all', icon: FileText, color: '#8b5cf6' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        getDashboardStats(),
        getAnalytics('month'),
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const usersByRole = useMemo(() => {
    if (!analytics?.usersByRole) return [];
    return analytics.usersByRole.map(r => ({ label: r._id || 'Unknown', count: r.count || 0 }));
  }, [analytics]);

  const jobsByStatus = useMemo(() => {
    if (!analytics?.jobsByStatus) return [];
    return analytics.jobsByStatus.map(r => ({ label: r._id || 'Unknown', count: r.count || 0 }));
  }, [analytics]);

  const appsByStatus = useMemo(() => {
    if (!analytics?.applicationsByStatus) return [];
    return analytics.applicationsByStatus.map(r => ({ label: r._id || 'Unknown', count: r.count || 0 }));
  }, [analytics]);

  const barMax = (items) => Math.max(...items.map(i => i.count), 1);

  const renderBarChart = (title, items, accentColor) => {
    const max = barMax(items);
    const total = items.reduce((s, i) => s + i.count, 0);
    return (
      <div className="admin-dash-bar-card">
        <h3 className="admin-dash-bar-title">{title}</h3>
        {items.length === 0 ? (
          <p className="admin-dash-empty">No data available yet.</p>
        ) : (
          <div className="admin-dash-bars">
            {items.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div className="admin-dash-bar-row" key={item.label}>
                  <span className="admin-dash-bar-label">{item.label}</span>
                  <div className="admin-dash-bar-track">
                    <div
                      className="admin-dash-bar-fill"
                      style={{
                        width: `${Math.max((item.count / max) * 100, 8)}%`,
                        background: accentColor,
                      }}
                    />
                  </div>
                  <span className="admin-dash-bar-value">
                    {item.count}
                    <span className="admin-dash-bar-pct">{pct}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page admin-loading">
          <div className="admin-spinner" />
          Loading dashboard...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page admin-dash">
        {/* Header */}
        <div className="admin-dash-header">
          <div className="admin-dash-header-text">
            <h1>Admin Dashboard</h1>
            <p>Platform overview and key metrics at a glance.</p>
          </div>
          <button className="admin-dash-refresh" onClick={loadData}>
            <RefreshCw size={14} strokeWidth={2.5} />
            Refresh
          </button>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {/* KPI Stats */}
        <section className="admin-dash-kpis">
          <div className="admin-dash-kpi" style={{ '--kpi-accent': '#6366f1' }}>
            <div className="admin-dash-kpi-accent" />
            <div className="admin-dash-kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Users size={18} />
            </div>
            <p className="admin-dash-kpi-label">Total Users</p>
            <p className="admin-dash-kpi-value">{stats?.users?.total ?? 0}</p>
          </div>

          <div className="admin-dash-kpi" style={{ '--kpi-accent': '#10b981' }}>
            <div className="admin-dash-kpi-accent" />
            <div className="admin-dash-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Briefcase size={18} />
            </div>
            <p className="admin-dash-kpi-label">Active Jobs</p>
            <p className="admin-dash-kpi-value">{stats?.jobs?.active ?? 0}</p>
          </div>

          <div className="admin-dash-kpi" style={{ '--kpi-accent': '#f59e0b' }}>
            <div className="admin-dash-kpi-accent" />
            <div className="admin-dash-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <AlertTriangle size={18} />
            </div>
            <p className="admin-dash-kpi-label">Pending Jobs</p>
            <p className="admin-dash-kpi-value">{stats?.jobs?.pending ?? 0}</p>
          </div>

          <div className="admin-dash-kpi" style={{ '--kpi-accent': '#8b5cf6' }}>
            <div className="admin-dash-kpi-accent" />
            <div className="admin-dash-kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <FileText size={18} />
            </div>
            <p className="admin-dash-kpi-label">Total Applications</p>
            <p className="admin-dash-kpi-value">{stats?.applications?.total ?? 0}</p>
          </div>
        </section>

        {/* Monthly Activity */}
        <section className="admin-dash-monthly">
          <div className="admin-dash-section-header">
            <h2>Monthly Activity</h2>
          </div>
          <div className="admin-dash-monthly-grid">
            <div className="admin-dash-monthly-card">
              <p className="admin-dash-monthly-label">New Users</p>
              <p className="admin-dash-monthly-value">{analytics?.newUsers ?? 0}</p>
            </div>
            <div className="admin-dash-monthly-card">
              <p className="admin-dash-monthly-label">New Jobs</p>
              <p className="admin-dash-monthly-value">{analytics?.newJobs ?? 0}</p>
            </div>
            <div className="admin-dash-monthly-card">
              <p className="admin-dash-monthly-label">New Applications</p>
              <p className="admin-dash-monthly-value">{analytics?.newApplications ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Distribution Charts */}
        <section className="admin-dash-charts">
          {renderBarChart('Users by Role', usersByRole, '#6366f1')}
          {renderBarChart('Jobs by Status', jobsByStatus, '#10b981')}
          {renderBarChart('Applications by Status', appsByStatus, '#8b5cf6')}
        </section>

        {/* Bottom Row: Quick Links + Reminders */}
        <section className="admin-dash-bottom">
          <div className="admin-dash-quicklinks">
            <h3 className="admin-dash-bar-title">Quick Access</h3>
            <div className="admin-dash-links-grid">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    className="admin-dash-link-card"
                    onClick={() => navigate(link.path)}
                  >
                    <div className="admin-dash-link-icon" style={{ background: `${link.color}12`, color: link.color }}>
                      <Icon size={16} />
                    </div>
                    <span className="admin-dash-link-label">{link.label}</span>
                    <ArrowRight size={14} className="admin-dash-link-arrow" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-dash-reminders">
            <ReminderWidget title="System Reminders" limit={5} />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
