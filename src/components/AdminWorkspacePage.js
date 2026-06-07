import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import authService from '../services/auth.service';
import {
  getAnalytics,
  getApplications,
  getDashboardStats,
  getJobs,
  getUsers,
} from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminWorkspace.css';

const periodOptions = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'year', label: 'Last 12 months' },
];

const pageCopy = {
  analytics: {
    eyebrow: 'Platform intelligence',
    title: 'Analytics',
    subtitle: 'Measure growth, job activity, and application movement from live platform data.',
    icon: BarChart3,
  },
  reports: {
    eyebrow: 'Operational reporting',
    title: 'Reports',
    subtitle: 'Review export-ready platform summaries for users, jobs, and applications.',
    icon: FileText,
  },
  settings: {
    eyebrow: 'Workspace controls',
    title: 'Settings',
    subtitle: 'Review account security and operational configuration for this admin workspace.',
    icon: Settings,
  },
  profile: {
    eyebrow: 'Account',
    title: 'Profile',
    subtitle: 'View authenticated admin profile details from the backend session.',
    icon: User,
  },
};

const asCountMap = (items = []) =>
  items.reduce((result, item) => {
    result[item._id || 'unknown'] = item.count || 0;
    return result;
  }, {});

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
};

const AdminWorkspacePage = ({ page = 'analytics' }) => {
  const config = pageCopy[page] || pageCopy.analytics;
  const PageIcon = config.icon;
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [reportRows, setReportRows] = useState({ users: [], jobs: [], applications: [] });
  const [error, setError] = useState('');
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const requests = [
        getDashboardStats(),
        getAnalytics(period),
        authService.getMe(),
      ];

      if (page === 'reports') {
        requests.push(
          getUsers({ limit: 5, page: 1 }),
          getJobs({ limit: 5, page: 1 }),
          getApplications({ limit: 5, page: 1 })
        );
      }

      const [statsRes, analyticsRes, meRes, usersRes, jobsRes, appsRes] = await Promise.all(requests);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setUser(meRes.data.user);
      
      setSettingsForm(prev => ({
        ...prev,
        name: meRes.data.user?.name || '',
        phone: meRes.data.user?.phone || '',
        location: meRes.data.user?.location || '',
      }));

      if (page === 'reports') {
        setReportRows({
          users: usersRes?.data?.users || [],
          jobs: jobsRes?.data?.jobs || [],
          applications: appsRes?.data?.applications || [],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspace data.');
    } finally {
      setLoading(false);
    }
  }, [page, period]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const usersByRole = useMemo(() => asCountMap(analytics?.usersByRole), [analytics]);
  const jobsByStatus = useMemo(() => asCountMap(analytics?.jobsByStatus), [analytics]);
  const applicationsByStatus = useMemo(
    () => asCountMap(analytics?.applicationsByStatus),
    [analytics]
  );

  const exportReport = () => {
    const lines = [
      ['Metric', 'Value'],
      ['Total users', stats?.users?.total ?? 0],
      ['Active users', stats?.users?.active ?? 0],
      ['Total jobs', stats?.jobs?.total ?? 0],
      ['Approved jobs', stats?.jobs?.approved ?? 0],
      ['Total applications', stats?.applications?.total ?? 0],
      ['New users', analytics?.newUsers ?? 0],
      ['New jobs', analytics?.newJobs ?? 0],
      ['New applications', analytics?.newApplications ?? 0],
    ];

    const csv = lines.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jobportal-admin-report-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    
    try {
      const payload = {
        name: settingsForm.name,
        phone: settingsForm.phone,
        location: settingsForm.location,
      };
      
      if (settingsForm.newPassword) {
        if (!settingsForm.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        payload.currentPassword = settingsForm.currentPassword;
        payload.newPassword = settingsForm.newPassword;
      }
      
      const res = await authService.updateMe(payload);
      setUser(res.data.user);
      setSettingsSuccess('Profile settings updated successfully!');
      setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setSettingsError(err.response?.data?.message || err.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    setSettingsForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const renderHeader = () => (
    <div className="admin-header-card">
      <div className="admin-header">
        <div>
          <p className="admin-subtitle admin-kicker">
            <PageIcon size={16} />
            {config.eyebrow}
          </p>
          <h1>{config.title}</h1>
          <p className="admin-subtitle">{config.subtitle}</p>
        </div>
        <div className="admin-toolbar">
          {(page === 'analytics' || page === 'reports') ? (
            <select className="admin-select" value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}
          {page === 'reports' ? (
            <button className="admin-primary-btn" type="button" onClick={exportReport}>
              <Download size={16} />
              Export CSV
            </button>
          ) : null}
          <button className="admin-refresh-btn" onClick={loadPage} type="button">
            <RefreshCw size={16} strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  const renderMetricGrid = () => (
    <section className="admin-stats-grid">
      <div className="admin-stat-card">
        <h3><Users size={16} /> Users</h3>
        <p className="admin-stat-value">{stats?.users?.total ?? 0}</p>
      </div>
      <div className="admin-stat-card">
        <h3><Briefcase size={16} /> Jobs</h3>
        <p className="admin-stat-value">{stats?.jobs?.total ?? 0}</p>
      </div>
      <div className="admin-stat-card">
        <h3><FileText size={16} /> Applications</h3>
        <p className="admin-stat-value">{stats?.applications?.total ?? 0}</p>
      </div>
      <div className="admin-stat-card">
        <h3><ShieldCheck size={16} /> Approved Jobs</h3>
        <p className="admin-stat-value">{stats?.jobs?.approved ?? 0}</p>
      </div>
    </section>
  );

  const renderDistribution = (title, rows) => (
    <section className="admin-section">
      <h2 className="admin-section-title">{title}</h2>
      <div className="admin-workspace-bars">
        {Object.keys(rows).length === 0 ? (
          <div className="admin-empty-state">No data available yet.</div>
        ) : (
          Object.entries(rows).map(([label, count]) => {
            const max = Math.max(...Object.values(rows), 1);
            return (
              <div className="admin-workspace-bar-row" key={label}>
                <span>{label}</span>
                <div className="admin-workspace-bar-track">
                  <div style={{ width: `${Math.max((count / max) * 100, 6)}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })
        )}
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <>
      {renderMetricGrid()}
      <section className="admin-analytics-grid">
        <div className="admin-stat-card">
          <h3>New Users</h3>
          <p className="admin-stat-value">{analytics?.newUsers ?? 0}</p>
        </div>
        <div className="admin-stat-card">
          <h3>New Jobs</h3>
          <p className="admin-stat-value">{analytics?.newJobs ?? 0}</p>
        </div>
        <div className="admin-stat-card">
          <h3>New Applications</h3>
          <p className="admin-stat-value">{analytics?.newApplications ?? 0}</p>
        </div>
      </section>
      <div className="admin-workspace-grid">
        {renderDistribution('Users by Role', usersByRole)}
        {renderDistribution('Jobs by Status', jobsByStatus)}
        {renderDistribution('Applications by Status', applicationsByStatus)}
      </div>
    </>
  );

  const renderReports = () => (
    <>
      {renderMetricGrid()}
      <section className="admin-section">
        <div className="admin-section-heading-row">
          <h2 className="admin-section-title">Recent Platform Activity</h2>
          <span className="admin-badge admin-badge-status">Live backend data</span>
        </div>
        <div className="admin-workspace-report-grid">
          <div>
            <h3>Users</h3>
            {reportRows.users.map((item) => (
              <p key={item._id}>{item.name} <span>{item.role}</span></p>
            ))}
          </div>
          <div>
            <h3>Jobs</h3>
            {reportRows.jobs.map((item) => (
              <p key={item._id}>{item.title} <span>{item.status}</span></p>
            ))}
          </div>
          <div>
            <h3>Applications</h3>
            {reportRows.applications.map((item) => (
              <p key={item._id}>{item.job?.title || item.jobTitle || 'Application'} <span>{item.status}</span></p>
            ))}
          </div>
        </div>
      </section>
      <div className="admin-workspace-grid">
        {renderDistribution('Users by Role', usersByRole)}
        {renderDistribution('Applications by Status', applicationsByStatus)}
      </div>
    </>
  );

  const renderSettings = () => (
    <div className="admin-workspace-settings-container">
      <div className="admin-settings-layout">
        <section className="admin-section admin-settings-form-section">
          <h2 className="admin-section-title"><User size={18} /> Profile Configuration</h2>
          
          {settingsError && <div className="admin-alert admin-alert-error">{settingsError}</div>}
          {settingsSuccess && <div className="admin-alert admin-alert-success">{settingsSuccess}</div>}
          
          <form className="admin-form-grid" onSubmit={handleSettingsSubmit}>
            <label className="admin-form-field">
              <span>Full Name</span>
              <input type="text" name="name" value={settingsForm.name} onChange={handleSettingsChange} required />
            </label>
            <label className="admin-form-field">
              <span>Email Address (Read-only)</span>
              <input type="email" value={user?.email || ''} readOnly disabled className="admin-input-disabled" />
            </label>
            <label className="admin-form-field">
              <span>Phone Number</span>
              <input type="text" name="phone" value={settingsForm.phone} onChange={handleSettingsChange} />
            </label>
            <label className="admin-form-field">
              <span>Location</span>
              <input type="text" name="location" value={settingsForm.location} onChange={handleSettingsChange} />
            </label>
            
            <div className="admin-form-divider" style={{ gridColumn: '1 / -1', margin: '10px 0', borderBottom: '1px solid var(--bg-tertiary)' }}></div>
            
            <h3 style={{ gridColumn: '1 / -1', fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Security</h3>
            
            <label className="admin-form-field">
              <span>Current Password</span>
              <input type="password" name="currentPassword" value={settingsForm.currentPassword} onChange={handleSettingsChange} placeholder="Required if changing password" />
            </label>
            <label className="admin-form-field">
              <span>New Password</span>
              <input type="password" name="newPassword" value={settingsForm.newPassword} onChange={handleSettingsChange} placeholder="Leave blank to keep current" />
            </label>

            <div className="admin-form-actions" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button className="admin-primary-btn" type="submit" disabled={settingsLoading}>
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </section>

        <div className="admin-settings-sidebar">
          <section className="admin-section">
            <h2 className="admin-section-title"><Settings size={18} /> System Status</h2>
            <div className="admin-workspace-settings">
              <div>
                <span>Role privileges</span>
                <strong>{user?.role || 'admin'}</strong>
              </div>
              <div>
                <span>Account state</span>
                <strong>{user?.isActive ? 'Active' : 'Inactive'}</strong>
              </div>
              <div>
                <span>Identity verification</span>
                <strong>{user?.isVerified ? 'Verified' : 'Pending'}</strong>
              </div>
              <div>
                <span>API connection</span>
                <strong>/api/auth/me</strong>
              </div>
            </div>
          </section>
          
          <section className="admin-section">
            <h2 className="admin-section-title">Operational Queues</h2>
            <div className="admin-workspace-settings">
              <div>
                <span>Jobs awaiting review</span>
                <strong>{stats?.jobs?.pending ?? 0}</strong>
              </div>
              <div>
                <span>Pending applications</span>
                <strong>{stats?.applications?.pending ?? 0}</strong>
              </div>
              <div>
                <span>Restricted accounts</span>
                <strong>{stats?.users?.banned ?? 0}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <section className="admin-section">
      <div className="admin-profile-panel">
        <div className="admin-profile-avatar">
          <User size={30} />
        </div>
        <div>
          <h2>{user?.name || 'Admin User'}</h2>
          <p>{user?.email || 'Email not available'}</p>
          <span className="admin-badge admin-badge-role">{user?.role || 'admin'}</span>
        </div>
      </div>
      <div className="admin-workspace-settings">
        <div>
          <span>Last login</span>
          <strong>{formatDate(user?.lastLogin)}</strong>
        </div>
        <div>
          <span>Phone</span>
          <strong>{user?.phone || 'Not provided'}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{user?.location || 'Not provided'}</strong>
        </div>
        <div>
          <span>Verified</span>
          <strong>{user?.isVerified ? 'Yes' : 'No'}</strong>
        </div>
      </div>
    </section>
  );

  const content = {
    analytics: renderAnalytics,
    reports: renderReports,
    settings: renderSettings,
    profile: renderProfile,
  };

  return (
    <AdminLayout>
      <div className="admin-page admin-workspace-page">
        {renderHeader()}
        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
        {loading ? (
          <div className="admin-page admin-loading">Loading {config.title.toLowerCase()}...</div>
        ) : (
          content[page]?.()
        )}
        {!loading && !error ? (
          <div className="admin-workspace-footnote">
            <CheckCircle2 size={15} />
            Connected to admin analytics, dashboard stats, and authenticated profile endpoints.
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminWorkspacePage;
