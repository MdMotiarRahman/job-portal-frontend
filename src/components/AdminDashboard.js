import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  FileText,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';

import AdminLayout from './AdminLayout';
import ReminderWidget from './ReminderWidget';
import {
  approveJob,
  closeJob,
  deleteUser,
  getAnalytics,
  getApplications,
  getDashboardStats,
  getJobs,
  getUsers,
  rejectJob,
  updateApplicationStatus,
  updateUserStatus,
  verifyUser,
} from '../services/adminService';
import '../styles/adminDashboard.css';

const statusActions = ['activate', 'deactivate', 'ban', 'unban'];
const appStatuses = ['Pending', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'];

const getStatusBadgeClass = (status) => {
  if (['Accepted', 'Shortlisted', 'Interview Scheduled'].includes(status)) return 'admin-badge-success';
  if (status === 'Rejected') return 'admin-badge-error';
  if (status === 'Reviewing') return 'admin-badge-status';
  return 'admin-badge-warning';
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, analyticsRes, usersRes, jobsRes, appsRes] = await Promise.all([
        getDashboardStats(),
        getAnalytics('month'),
        getUsers({ limit: 6, page: 1 }),
        getJobs({ limit: 6, page: 1 }),
        getApplications({ limit: 6, page: 1 }),
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUserAction = async (userId, action) => {
    if (!statusActions.includes(action)) return;

    try {
      setError('');
      setSuccess('');
      let payload = {};

      if (action === 'ban') {
        const reason = window.prompt('Enter ban reason');
        if (!reason) return;
        payload = { reason };
      }

      await updateUserStatus(userId, action, payload);
      setSuccess(`User ${action}d successfully.`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      setError('');
      setSuccess('');
      await verifyUser(userId);
      setSuccess('User verified successfully.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    const ok = window.confirm('Are you sure you want to delete this user?');
    if (!ok) return;

    try {
      setError('');
      setSuccess('');
      await deleteUser(userId);
      setSuccess('User deleted successfully.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      setError('');
      setSuccess('');
      await approveJob(jobId, '');
      setSuccess('Job approved successfully.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve job.');
    }
  };

  const handleRejectJob = async (jobId) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;

    try {
      setError('');
      setSuccess('');
      await rejectJob(jobId, reason);
      setSuccess('Job rejected successfully.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject job.');
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      setError('');
      setSuccess('');
      await closeJob(jobId);
      setSuccess('Job closed successfully.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close job.');
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      setError('');
      setSuccess('');
      await updateApplicationStatus(applicationId, status);
      setSuccess('Application status updated.');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page admin-loading">Loading admin dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <h1>Admin Portal</h1>
              <p className="admin-subtitle">
                Monitor users, jobs, applications, and platform activity.
              </p>
            </div>
            <button className="admin-refresh-btn" onClick={loadAll}>
              <RefreshCw size={16} strokeWidth={2} />
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
        {success ? <div className="admin-alert admin-alert-success">{success}</div> : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>
              <Users size={18} /> Total Users
            </h3>
            <p className="admin-stat-value">{stats?.users?.total ?? 0}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <Briefcase size={18} /> Active Jobs
            </h3>
            <p className="admin-stat-value">{stats?.jobs?.active ?? 0}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <ShieldCheck size={18} /> Pending Jobs
            </h3>
            <p className="admin-stat-value">{stats?.jobs?.pending ?? 0}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <FileText size={18} /> Total Applications
            </h3>
            <p className="admin-stat-value">{stats?.applications?.total ?? 0}</p>
          </div>
        </section>

        <section className="admin-section">
          <div className="dashboard-card">
            <ReminderWidget 
              title="System Reminders" 
              limit={5}
            />
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Users</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="admin-badge admin-badge-role">{user.role}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge-${
                            user.isBanned ? 'error' : user.isActive ? 'success' : 'warning'
                          }`}
                        >
                          {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <button
                          className="admin-action-btn admin-action-neutral"
                          onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="admin-action-btn admin-action-warning"
                          onClick={() => handleUserAction(user._id, user.isBanned ? 'unban' : 'ban')}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button
                          className="admin-action-btn admin-action-success"
                          onClick={() => handleVerifyUser(user._id)}
                        >
                          Verify
                        </button>
                        <button
                          className="admin-action-btn admin-action-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Jobs</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No jobs found.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.company?.name || 'N/A'}</td>
                      <td>
                        <span className="admin-badge admin-badge-status">{job.status}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            job.isApproved ? 'admin-badge-success' : 'admin-badge-warning'
                          }`}
                        >
                          {job.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <button
                          className="admin-action-btn admin-action-success"
                          onClick={() => handleApproveJob(job._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="admin-action-btn admin-action-warning"
                          onClick={() => handleRejectJob(job._id)}
                        >
                          Reject
                        </button>
                        <button
                          className="admin-action-btn admin-action-danger"
                          onClick={() => handleCloseJob(job._id)}
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Applications</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Seeker</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No applications found.</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.jobTitle}</td>
                      <td>{app.seeker?.name || 'N/A'}</td>
                      <td>
                        <span className={`admin-badge ${getStatusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={app.status}
                          onChange={(e) => handleApplicationStatus(app._id, e.target.value)}
                        >
                          {appStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2 className="admin-section-title">Monthly Analytics</h2>
          <div className="admin-analytics-grid">
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
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
