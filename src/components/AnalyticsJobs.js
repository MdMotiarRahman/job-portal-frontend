import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, ArrowLeft, RefreshCw, Loader2, BarChart3, CheckCircle2, Clock, PauseCircle, Lock,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import { getAnalytics, getJobs } from '../services/adminService';
import '../styles/adminModule.css';
import '../styles/adminAnalytics.css';

const AnalyticsJobs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        getAnalytics(period),
        getJobs({ limit: 20, page: 1 }),
      ]);
      setAnalytics(analyticsRes.data);
      setJobs(jobsRes.data?.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const jobsByStatus = useMemo(() => {
    const items = analytics?.jobsByStatus || [];
    return items.reduce((acc, item) => {
      acc[item._id || 'unknown'] = item.count || 0;
      return acc;
    }, {});
  }, [analytics]);

  const total = Object.values(jobsByStatus).reduce((s, c) => s + c, 0);
  const maxCount = Math.max(...Object.values(jobsByStatus), 1);

  const statusColors = {
    active: '#10b981',
    pending: '#f59e0b',
    closed: '#6b7280',
    inactive: '#ef4444',
    draft: '#8b5cf6',
  };
  const statusIcons = {
    active: CheckCircle2,
    pending: Clock,
    closed: Lock,
    inactive: PauseCircle,
    draft: Briefcase,
  };

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <button className="aw-back-btn" onClick={() => navigate('/admin/analytics')}>
              <ArrowLeft size={15} /> Back to Analytics
            </button>
            <h1>Jobs by Status</h1>
            <p>Detailed breakdown of job postings across all statuses.</p>
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
          <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading job analytics...</p></div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="aw-kpi-grid">
              {Object.entries(jobsByStatus).map(([status, count]) => {
                const Icon = statusIcons[status] || Briefcase;
                const color = statusColors[status] || '#6366f1';
                return (
                  <div className="aw-kpi" key={status}>
                    <div className="aw-kpi-accent" style={{ background: color }} />
                    <div className="aw-kpi-icon" style={{ backgroundColor: `${color}12`, color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="aw-kpi-label">{status} Jobs</p>
                      <h3 className="aw-kpi-value">{count}</h3>
                    </div>
                  </div>
                );
              })}
              <div className="aw-kpi">
                <div className="aw-kpi-accent" style={{ background: '#3b82f6' }} />
                <div className="aw-kpi-icon" style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="aw-kpi-label">Total Jobs</p>
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
                {Object.entries(jobsByStatus).map(([status, count]) => {
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

            {/* Recent Jobs Table */}
            <div className="aw-card">
              <div className="aw-card-header">
                <h3><Briefcase size={16} /> Recent Jobs</h3>
                <button className="adm-mod-view-btn" onClick={() => navigate('/admin/jobs/all')}>View All</button>
              </div>
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>Job</span>
                  <span>Employer</span>
                  <span>Status</span>
                  <span>Posted</span>
                </div>
                {jobs.slice(0, 10).map((j) => (
                  <div className="aw-report-table-row" key={j._id}>
                    <div>
                      <p className="aw-report-name">{j.title}</p>
                      <p className="aw-report-sub">{j.location || 'Remote'}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserAvatar user={j.company} size={24} />
                      <span className="aw-report-sub">{j.company?.name || '—'}</span>
                    </div>
                    <span className={`aw-badge aw-badge-${j.status === 'active' ? 'success' : j.status === 'closed' ? 'error' : 'warning'}`}>{j.status}</span>
                    <span className="aw-bar-pct">{new Date(j.createdAt).toLocaleDateString()}</span>
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

export default AnalyticsJobs;
