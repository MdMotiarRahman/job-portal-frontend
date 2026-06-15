import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ArrowLeft, RefreshCw, Loader2, BarChart3, Clock, CheckCircle2, Send, Eye,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import { getAnalytics, getApplications } from '../services/adminService';
import '../styles/adminModule.css';
import '../styles/adminAnalytics.css';

const AnalyticsApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, appsRes] = await Promise.all([
        getAnalytics(period),
        getApplications({ limit: 20, page: 1 }),
      ]);
      setAnalytics(analyticsRes.data);
      setApplications(appsRes.data?.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const appsByStatus = useMemo(() => {
    const items = analytics?.applicationsByStatus || [];
    return items.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count || 0;
      return acc;
    }, {});
  }, [analytics]);

  const total = Object.values(appsByStatus).reduce((s, c) => s + c, 0);
  const maxCount = Math.max(...Object.values(appsByStatus), 1);

  const statusColors = {
    pending: '#f59e0b',
    reviewed: '#3b82f6',
    shortlisted: '#10b981',
    accepted: '#22c55e',
    rejected: '#ef4444',
    withdrawn: '#6b7280',
    interviewing: '#8b5cf6',
  };
  const statusIcons = {
    pending: Clock,
    reviewed: Eye,
    shortlisted: CheckCircle2,
    accepted: CheckCircle2,
    rejected: FileText,
    withdrawn: FileText,
    interviewing: Send,
  };

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <button className="aw-back-btn" onClick={() => navigate('/admin/analytics')}>
              <ArrowLeft size={15} /> Back to Analytics
            </button>
            <h1>Applications by Status</h1>
            <p>Track application flow from submission through acceptance or rejection.</p>
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
          <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading application analytics...</p></div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="aw-kpi-grid">
              {Object.entries(appsByStatus).map(([status, count]) => {
                const Icon = statusIcons[status] || FileText;
                const color = statusColors[status] || '#6366f1';
                return (
                  <div className="aw-kpi" key={status}>
                    <div className="aw-kpi-accent" style={{ background: color }} />
                    <div className="aw-kpi-icon" style={{ backgroundColor: `${color}12`, color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="aw-kpi-label">{status}</p>
                      <h3 className="aw-kpi-value">{count}</h3>
                    </div>
                  </div>
                );
              })}
              <div className="aw-kpi">
                <div className="aw-kpi-accent" style={{ background: '#8b5cf6' }} />
                <div className="aw-kpi-icon" style={{ backgroundColor: 'rgba(139,92,246,0.08)', color: '#8b5cf6' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p className="aw-kpi-label">Total Applications</p>
                  <h3 className="aw-kpi-value">{total}</h3>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><BarChart3 size={16} /> Distribution by Status</h3>
                <span className="aw-card-total">{total} total</span>
              </div>
              <div className="aw-bars">
                {Object.entries(appsByStatus).map(([status, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = statusColors[status] || '#6366f1';
                  return (
                    <div className="aw-bar-row" key={status}>
                      <span className="aw-bar-label">{status}</span>
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

            {/* Conversion Funnel Summary */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><Send size={16} /> Application Funnel</h3>
              </div>
              <div className="aw-funnel">
                {['pending', 'reviewed', 'shortlisted', 'accepted'].map((stage, i) => {
                  const count = appsByStatus[stage] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = statusColors[stage];
                  return (
                    <div className="aw-funnel-step" key={stage}>
                      <div className="aw-funnel-bar" style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: color }}>
                        <span className="aw-funnel-count">{count}</span>
                      </div>
                      <div className="aw-funnel-label">
                        <span className="aw-funnel-name">{stage}</span>
                        <span className="aw-funnel-pct">{pct}%</span>
                      </div>
                      {i < 3 && <div className="aw-funnel-arrow">→</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Applications Table */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><FileText size={16} /> Recent Applications</h3>
                <button className="adm-mod-view-btn" onClick={() => navigate('/admin/applications/all')}>View All</button>
              </div>
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>Candidate</span>
                  <span>Job</span>
                  <span>Status</span>
                  <span>Applied</span>
                </div>
                {applications.slice(0, 10).map((app) => (
                  <div className="aw-report-table-row" key={app._id}>
                    <div className="aw-report-user">
                      <UserAvatar user={app.seeker || app.user} size={32} />
                      <div>
                        <p className="aw-report-name">{app.seeker?.name || app.user?.name || 'N/A'}</p>
                        <p className="aw-report-sub">{app.seeker?.email || app.user?.email || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="aw-report-name">{app.job?.title || 'N/A'}</p>
                    </div>
                    <span className={`aw-badge aw-badge-${app.status === 'accepted' || app.status === 'shortlisted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}`}>{app.status}</span>
                    <span className="aw-bar-pct">{new Date(app.createdAt).toLocaleDateString()}</span>
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

export default AnalyticsApplications;
