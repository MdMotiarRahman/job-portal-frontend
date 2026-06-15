import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Camera,
  X,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
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

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

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

  useEffect(() => { loadPage(); }, [loadPage]);

  const usersByRole = useMemo(() => asCountMap(analytics?.usersByRole), [analytics]);
  const jobsByStatus = useMemo(() => asCountMap(analytics?.jobsByStatus), [analytics]);
  const applicationsByStatus = useMemo(() => asCountMap(analytics?.applicationsByStatus), [analytics]);

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
      const formData = new FormData();
      formData.append('name', settingsForm.name);
      formData.append('phone', settingsForm.phone);
      formData.append('location', settingsForm.location);
      
      if (settingsForm.newPassword) {
        if (!settingsForm.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        formData.append('currentPassword', settingsForm.currentPassword);
        formData.append('newPassword', settingsForm.newPassword);
      }

      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }
      
      const res = await authService.updateMe(formData);
      setUser(res.data.user);

      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      if (stored.user) {
        stored.user.name = res.data.user.name;
        localStorage.setItem('user', JSON.stringify(stored));
      }

      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';

      window.dispatchEvent(new Event('admin-profile-updated'));
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSettingsError('Only image files are allowed.');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  /* ---- Shared Header ---- */
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
          {(page === 'analytics' || page === 'reports') && (
            <select className="admin-select" value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
          {page === 'reports' && (
            <button className="admin-primary-btn" type="button" onClick={exportReport}>
              <Download size={16} /> Export CSV
            </button>
          )}
          <button className="admin-refresh-btn" onClick={loadPage} type="button">
            <RefreshCw size={16} strokeWidth={2} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );

  /* ---- Distribution Bar Chart ---- */
  const DistributionChart = ({ title, rows, colors }) => {
    const entries = Object.entries(rows);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    const max = Math.max(...entries.map(([, c]) => c), 1);

    return (
      <div className="aw-card">
        <div className="aw-card-header">
          <h3>{title}</h3>
          <span className="aw-card-total">{total} total</span>
        </div>
        {entries.length === 0 ? (
          <p className="aw-empty">No data available yet.</p>
        ) : (
          <div className="aw-bars">
            {entries.map(([label, count], i) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div className="aw-bar-row" key={label}>
                  <span className="aw-bar-label">{label}</span>
                  <div className="aw-bar-track">
                    <div
                      className="aw-bar-fill"
                      style={{
                        width: `${Math.max((count / max) * 100, 4)}%`,
                        backgroundColor: colors[i % colors.length],
                      }}
                    />
                  </div>
                  <div className="aw-bar-value">
                    {count}
                    <span className="aw-bar-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ---- Analytics Page ---- */
  const renderAnalytics = () => {
    const kpis = [
      { label: 'Total Users', value: stats?.users?.total ?? 0, icon: Users, color: '#3b82f6' },
      { label: 'Total Jobs', value: stats?.jobs?.total ?? 0, icon: Briefcase, color: '#10b981' },
      { label: 'Applications', value: stats?.applications?.total ?? 0, icon: FileText, color: '#f59e0b' },
      { label: 'Approved Jobs', value: stats?.jobs?.approved ?? 0, icon: ShieldCheck, color: '#8b5cf6' },
    ];

    const periodKpis = [
      { label: 'New Users', value: analytics?.newUsers ?? 0, icon: TrendingUp, color: '#3b82f6' },
      { label: 'New Jobs', value: analytics?.newJobs ?? 0, icon: Briefcase, color: '#10b981' },
      { label: 'New Applications', value: analytics?.newApplications ?? 0, icon: Activity, color: '#f59e0b' },
    ];

    return (
      <>
        {/* Total Metrics */}
        <div className="aw-kpi-grid">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div className="aw-kpi" key={kpi.label}>
                <div className="aw-kpi-accent" style={{ background: kpi.color }} />
                <div className="aw-kpi-icon" style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="aw-kpi-label">{kpi.label}</p>
                  <h3 className="aw-kpi-value">{kpi.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Period Activity */}
        <div className="aw-section-header">
          <Activity size={16} />
          <h2>Period Activity</h2>
        </div>
        <div className="aw-period-grid">
          {periodKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div className="aw-period-card" key={kpi.label}>
                <div className="aw-period-icon" style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="aw-kpi-label">{kpi.label}</p>
                  <h3 className="aw-period-value">{kpi.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Distribution Charts */}
        <div className="aw-section-header">
          <BarChart3 size={16} />
          <h2>Distribution Overview</h2>
        </div>
        <div className="aw-charts-grid">
          <DistributionChart title="Users by Role" rows={usersByRole} colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']} />
          <DistributionChart title="Jobs by Status" rows={jobsByStatus} colors={['#10b981', '#f59e0b', '#ef4444', '#6b7280']} />
          <DistributionChart title="Applications by Status" rows={applicationsByStatus} colors={['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']} />
        </div>
      </>
    );
  };

  /* ---- Reports Page ---- */
  const renderReports = () => {
    const recentUsers = reportRows.users || [];
    const recentJobs = reportRows.jobs || [];
    const recentApps = reportRows.applications || [];

    return (
      <>
        {/* Summary Metrics */}
        <div className="aw-kpi-grid">
          {[
            { label: 'Total Users', value: stats?.users?.total ?? 0, icon: Users, color: '#3b82f6' },
            { label: 'Active Users', value: stats?.users?.active ?? 0, icon: CheckCircle2, color: '#10b981' },
            { label: 'Total Jobs', value: stats?.jobs?.total ?? 0, icon: Briefcase, color: '#f59e0b' },
            { label: 'Total Applications', value: stats?.applications?.total ?? 0, icon: FileText, color: '#8b5cf6' },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div className="aw-kpi" key={kpi.label}>
                <div className="aw-kpi-accent" style={{ background: kpi.color }} />
                <div className="aw-kpi-icon" style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="aw-kpi-label">{kpi.label}</p>
                  <h3 className="aw-kpi-value">{kpi.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Tables */}
        <div className="aw-section-header">
          <Clock size={16} />
          <h2>Recent Platform Activity</h2>
          <span className="aw-live-badge">Live data</span>
        </div>
        <div className="aw-report-grid">
          {/* Users Table */}
          <div className="aw-report-card">
            <div className="aw-report-card-header">
              <Users size={16} />
              <h3>Recent Users</h3>
            </div>
            {recentUsers.length === 0 ? (
              <p className="aw-empty">No users yet.</p>
            ) : (
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>User</span>
                  <span>Role</span>
                </div>
                {recentUsers.map((u) => (
                  <div className="aw-report-table-row" key={u._id}>
                    <div className="aw-report-user">
                      <UserAvatar user={u} size={28} />
                      <div>
                        <p className="aw-report-name">{u.name}</p>
                        <p className="aw-report-sub">{u.email}</p>
                      </div>
                    </div>
                    <span className={`aw-badge aw-badge-${u.role === 'admin' ? 'info' : u.role === 'employer' ? 'success' : 'neutral'}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jobs Table */}
          <div className="aw-report-card">
            <div className="aw-report-card-header">
              <Briefcase size={16} />
              <h3>Recent Jobs</h3>
            </div>
            {recentJobs.length === 0 ? (
              <p className="aw-empty">No jobs yet.</p>
            ) : (
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>Job</span>
                  <span>Status</span>
                </div>
                {recentJobs.map((j) => (
                  <div className="aw-report-table-row" key={j._id}>
                    <div>
                      <p className="aw-report-name">{j.title}</p>
                      <p className="aw-report-sub">{j.company?.name || j.location || '—'}</p>
                    </div>
                    <span className={`aw-badge aw-badge-${j.status === 'active' ? 'success' : j.status === 'closed' ? 'error' : 'warning'}`}>{j.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applications Table */}
          <div className="aw-report-card">
            <div className="aw-report-card-header">
              <FileText size={16} />
              <h3>Recent Applications</h3>
            </div>
            {recentApps.length === 0 ? (
              <p className="aw-empty">No applications yet.</p>
            ) : (
              <div className="aw-report-table">
                <div className="aw-report-table-head">
                  <span>Application</span>
                  <span>Status</span>
                </div>
                {recentApps.map((a) => (
                  <div className="aw-report-table-row" key={a._id}>
                    <div>
                      <p className="aw-report-name">{a.job?.title || a.jobTitle || 'Application'}</p>
                      <p className="aw-report-sub">{a.seeker?.name || a.user?.name || '—'}</p>
                    </div>
                    <span className={`aw-badge aw-badge-${a.status === 'accepted' || a.status === 'shortlisted' ? 'success' : a.status === 'rejected' ? 'error' : 'warning'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="aw-section-header">
          <BarChart3 size={16} />
          <h2>Distribution Overview</h2>
        </div>
        <div className="aw-charts-grid">
          <DistributionChart title="Users by Role" rows={usersByRole} colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']} />
          <DistributionChart title="Applications by Status" rows={applicationsByStatus} colors={['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']} />
        </div>
      </>
    );
  };

  /* ---- Settings Page ---- */
  const renderSettings = () => (
    <div className="aw-settings-layout">
      {/* Main Form */}
      <div className="aw-card">
        <div className="aw-card-header">
          <h3><User size={16} /> Profile Configuration</h3>
        </div>

        {settingsError && <div className="admin-alert admin-alert-error">{settingsError}</div>}
        {settingsSuccess && <div className="admin-alert admin-alert-success">{settingsSuccess}</div>}

        {/* Avatar Upload */}
        <div className="aw-avatar-section">
          <div className="aw-avatar-wrapper" onClick={() => imageInputRef.current?.click()} title="Click to upload photo">
            <UserAvatar profile={{ profileImage: imagePreview || user?.profileImage || '' }} user={user} size={72} />
            <div className="aw-avatar-overlay">
              <Camera size={18} color="#f1f5f9" />
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div className="aw-avatar-info">
            <p className="aw-avatar-title">Profile Photo</p>
            <p className="aw-avatar-sub">JPG, PNG. Max 5MB.</p>
            {imagePreview && (
              <button type="button" onClick={handleRemoveImage} className="aw-btn-remove">
                <X size={12} /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Profile Fields */}
        <div className="aw-section-header" style={{ marginTop: 4 }}>
          <User size={16} />
          <h2>Personal Information</h2>
        </div>
        <form className="aw-form-grid" onSubmit={handleSettingsSubmit}>
          <label className="aw-form-field">
            <span>Full Name</span>
            <input type="text" name="name" value={settingsForm.name} onChange={handleSettingsChange} required />
          </label>
          <label className="aw-form-field">
            <span>Email Address</span>
            <input type="email" value={user?.email || ''} readOnly disabled className="aw-input-disabled" />
          </label>
          <label className="aw-form-field">
            <span>Phone Number</span>
            <input type="text" name="phone" value={settingsForm.phone} onChange={handleSettingsChange} placeholder="Optional" />
          </label>
          <label className="aw-form-field">
            <span>Location</span>
            <input type="text" name="location" value={settingsForm.location} onChange={handleSettingsChange} placeholder="Optional" />
          </label>

          {/* Security Section */}
          <div className="aw-form-divider" />
          <div className="aw-section-header" style={{ marginTop: 0 }}>
            <ShieldCheck size={16} />
            <h2>Security</h2>
          </div>
          <label className="aw-form-field">
            <span>Current Password</span>
            <input type="password" name="currentPassword" value={settingsForm.currentPassword} onChange={handleSettingsChange} placeholder="Required if changing password" />
          </label>
          <label className="aw-form-field">
            <span>New Password</span>
            <input type="password" name="newPassword" value={settingsForm.newPassword} onChange={handleSettingsChange} placeholder="Leave blank to keep current" />
          </label>

          <div className="aw-form-actions">
            <button className="aw-btn-primary" type="submit" disabled={settingsLoading}>
              {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="aw-settings-sidebar">
        <div className="aw-card">
          <div className="aw-card-header">
            <h3><Settings size={16} /> System Status</h3>
          </div>
          <div className="aw-info-list">
            <div className="aw-info-row">
              <span>Role</span>
              <strong>{user?.role || 'admin'}</strong>
            </div>
            <div className="aw-info-row">
              <span>Account</span>
              <strong>{user?.isActive ? 'Active' : 'Inactive'}</strong>
            </div>
            <div className="aw-info-row">
              <span>Verified</span>
              <strong>{user?.isVerified ? 'Verified' : 'Pending'}</strong>
            </div>
            <div className="aw-info-row">
              <span>API</span>
              <strong>/api/auth/me</strong>
            </div>
          </div>
        </div>

        <div className="aw-card">
          <div className="aw-card-header">
            <h3><Clock size={16} /> Operational Queues</h3>
          </div>
          <div className="aw-info-list">
            <div className="aw-info-row">
              <span>Jobs pending review</span>
              <strong>{stats?.jobs?.pending ?? 0}</strong>
            </div>
            <div className="aw-info-row">
              <span>Pending applications</span>
              <strong>{stats?.applications?.pending ?? 0}</strong>
            </div>
            <div className="aw-info-row">
              <span>Restricted accounts</span>
              <strong>{stats?.users?.banned ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- Profile Page ---- */
  const renderProfile = () => (
    <>
      {/* Profile Header Card */}
      <div className="aw-card">
        <div className="aw-profile-hero">
          <div className="aw-profile-avatar-lg">
            <UserAvatar profile={{ profileImage: user?.profileImage || '' }} user={user} size={80} />
          </div>
          <div className="aw-profile-hero-info">
            <h2>{user?.name || 'Admin User'}</h2>
            <p>{user?.email || 'Email not available'}</p>
            <div className="aw-profile-badges">
              <span className="aw-badge aw-badge-info">{user?.role || 'admin'}</span>
              <span className={`aw-badge ${user?.isVerified ? 'aw-badge-success' : 'aw-badge-warning'}`}>
                {user?.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
              <span className={`aw-badge ${user?.isActive ? 'aw-badge-success' : 'aw-badge-error'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="aw-period-grid">
        <div className="aw-period-card">
          <div className="aw-period-icon" style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
            <Clock size={18} />
          </div>
          <div>
            <p className="aw-kpi-label">Last Login</p>
            <h3 className="aw-period-value" style={{ fontSize: 16 }}>{formatDate(user?.lastLogin)}</h3>
          </div>
        </div>
        <div className="aw-period-card">
          <div className="aw-period-icon" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
            <User size={18} />
          </div>
          <div>
            <p className="aw-kpi-label">Phone</p>
            <h3 className="aw-period-value" style={{ fontSize: 16 }}>{user?.phone || 'Not provided'}</h3>
          </div>
        </div>
        <div className="aw-period-card">
          <div className="aw-period-icon" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <p className="aw-kpi-label">Location</p>
            <h3 className="aw-period-value" style={{ fontSize: 16 }}>{user?.location || 'Not provided'}</h3>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="aw-card">
        <div className="aw-card-header">
          <h3><ShieldCheck size={16} /> Account Details</h3>
        </div>
        <div className="aw-info-grid">
          <div className="aw-info-item">
            <span>User ID</span>
            <strong>{user?._id || '—'}</strong>
          </div>
          <div className="aw-info-item">
            <span>Role</span>
            <strong>{user?.role || 'admin'}</strong>
          </div>
          <div className="aw-info-item">
            <span>Email Verified</span>
            <strong>{user?.isVerified ? 'Yes' : 'No'}</strong>
          </div>
          <div className="aw-info-item">
            <span>Account Active</span>
            <strong>{user?.isActive ? 'Yes' : 'No'}</strong>
          </div>
          <div className="aw-info-item">
            <span>Member Since</span>
            <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</strong>
          </div>
          <div className="aw-info-item">
            <span>Last Login</span>
            <strong>{formatDate(user?.lastLogin)}</strong>
          </div>
        </div>
      </div>
    </>
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
        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {loading ? (
          <div className="admin-page admin-loading">Loading {config.title.toLowerCase()}...</div>
        ) : (
          content[page]?.()
        )}
        {!loading && !error && (
          <div className="admin-workspace-footnote">
            <CheckCircle2 size={15} />
            Connected to admin analytics, dashboard stats, and authenticated profile endpoints.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWorkspacePage;
