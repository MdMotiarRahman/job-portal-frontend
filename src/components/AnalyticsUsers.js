import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, RefreshCw, Loader2, BarChart3, UserCheck, UserX, ShieldCheck, Briefcase,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import { getAnalytics, getUsers } from '../services/adminService';
import '../styles/adminModule.css';
import '../styles/adminAnalytics.css';

const AnalyticsUsers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        getAnalytics(period),
        getUsers({ limit: 20, page: 1 }),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const usersByRole = useMemo(() => {
    const items = analytics?.usersByRole || [];
    return items.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count || 0;
      return acc;
    }, {});
  }, [analytics]);

  const total = Object.values(usersByRole).reduce((s, c) => s + c, 0);
  const maxCount = Math.max(...Object.values(usersByRole), 1);

  const roleColors = { admin: '#ef4444', employer: '#3b82f6', seeker: '#10b981' };
  const roleIcons = { admin: ShieldCheck, employer: Briefcase, seeker: Users };

  const activeUsers = users.filter((u) => u.isActive).length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        {/* Header */}
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <button className="aw-back-btn" onClick={() => navigate('/admin/analytics')}>
              <ArrowLeft size={15} /> Back to Analytics
            </button>
            <h1>Users by Role</h1>
            <p>Breakdown of platform users across admin, employer, and seeker roles.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="adm-mod-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
            <button className="adm-mod-tab" onClick={loadData}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {loading ? (
          <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading user analytics...</p></div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="aw-kpi-grid">
              {Object.entries(usersByRole).map(([role, count]) => {
                const Icon = roleIcons[role] || Users;
                const color = roleColors[role] || '#6366f1';
                return (
                  <div className="aw-kpi" key={role}>
                    <div className="aw-kpi-accent" style={{ background: color }} />
                    <div className="aw-kpi-icon" style={{ backgroundColor: `${color}12`, color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="aw-kpi-label">{role}s</p>
                      <h3 className="aw-kpi-value">{count}</h3>
                    </div>
                  </div>
                );
              })}
              <div className="aw-kpi">
                <div className="aw-kpi-accent" style={{ background: '#8b5cf6' }} />
                <div className="aw-kpi-icon" style={{ backgroundColor: 'rgba(139,92,246,0.08)', color: '#8b5cf6' }}>
                  <Users size={20} />
                </div>
                <div>
                  <p className="aw-kpi-label">Total Users</p>
                  <h3 className="aw-kpi-value">{total}</h3>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><BarChart3 size={16} /> Distribution by Role</h3>
                <span className="aw-card-total">{total} total</span>
              </div>
              <div className="aw-bars">
                {Object.entries(usersByRole).map(([role, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = roleColors[role] || '#6366f1';
                  return (
                    <div className="aw-bar-row" key={role}>
                      <span className="aw-bar-label">{role}</span>
                      <div className="aw-bar-track">
                        <div className="aw-bar-fill" style={{ width: `${Math.max((count / maxCount) * 100, 4)}%`, backgroundColor: color }} />
                      </div>
                      <div className="aw-bar-value">
                        {count}
                        <span className="aw-bar-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="aw-period-grid">
              <div className="aw-period-card">
                <div className="aw-period-icon" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#059669' }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <p className="aw-kpi-label">Active Users</p>
                  <h3 className="aw-period-value">{activeUsers}</h3>
                </div>
              </div>
              <div className="aw-period-card">
                <div className="aw-period-icon" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
                  <UserX size={18} />
                </div>
                <div>
                  <p className="aw-kpi-label">Banned Users</p>
                  <h3 className="aw-period-value">{bannedUsers}</h3>
                </div>
              </div>
              <div className="aw-period-card">
                <div className="aw-period-icon" style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#2563eb' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="aw-kpi-label">Verified Users</p>
                  <h3 className="aw-period-value">{verifiedUsers}</h3>
                </div>
              </div>
            </div>

            {/* Recent Users Table */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><Users size={16} /> Recent Users</h3>
                <button className="adm-mod-view-btn" onClick={() => navigate('/admin/users/all')}>View All</button>
              </div>
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>User</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Joined</span>
                </div>
                {users.slice(0, 10).map((u) => (
                  <div className="aw-report-table-row" key={u._id}>
                    <div className="aw-report-user">
                      <UserAvatar user={u} size={32} />
                      <div>
                        <p className="aw-report-name">{u.name}</p>
                        <p className="aw-report-sub">{u.email}</p>
                      </div>
                    </div>
                    <span className={`aw-badge aw-badge-${u.role === 'admin' ? 'error' : u.role === 'employer' ? 'info' : 'success'}`}>{u.role}</span>
                    <span className={`aw-badge ${u.isBanned ? 'aw-badge-error' : u.isActive ? 'aw-badge-success' : 'aw-badge-warning'}`}>
                      {u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="aw-bar-pct">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsUsers;
