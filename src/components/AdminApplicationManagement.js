import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCw, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getApplications, updateApplicationStatus } from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminApplicationManagement.css';

const appStatuses = ['Pending', 'Approved', 'Rejected', 'Hired'];

const statusOptions = [
  { value: '', label: 'All Applications' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Hired', label: 'Hired' },
];

const getInitialStatus = (search) => {
  const params = new URLSearchParams(search);
  return params.get('status') || '';
};

const getStatusBadgeClass = (status) => {
  if (status === 'Approved' || status === 'Hired') return 'admin-badge-success';
  if (status === 'Rejected') return 'admin-badge-error';
  return 'admin-badge-warning';
};

const AdminApplicationManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filterStatus, setFilterStatus] = useState(getInitialStatus(location.search));
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryParams = useMemo(() => {
    const params = {
      page: pagination.page,
      limit: 10,
    };

    if (filterStatus) params.status = filterStatus;
    if (searchTerm.trim()) params.search = searchTerm.trim();

    return params;
  }, [filterStatus, pagination.page, searchTerm]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getApplications(queryParams);
      setApplications(response.data.applications || []);
      setPagination(response.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    setFilterStatus(getInitialStatus(location.search));
  }, [location.search]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return applications.reduce(
      (summary, application) => {
        summary.total += 1;
        summary[application.status] = (summary[application.status] || 0) + 1;
        return summary;
      },
      { total: 0, Pending: 0, Approved: 0, Rejected: 0, Hired: 0 }
    );
  }, [applications]);

  const handleFilterChange = (event) => {
    const nextStatus = event.target.value;
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
    setFilterStatus(nextStatus);
    navigate(nextStatus ? `/admin/applications?status=${nextStatus}` : '/admin/applications', { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
    loadApplications();
  };

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError('');
    setSuccess('');

    try {
      const response = await updateApplicationStatus(applicationId, status);
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application._id === applicationId
            ? { ...application, ...(response.data.application || {}), status }
            : application
        )
      );
      setSuccess('Application status updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page admin-application-management">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <p className="admin-subtitle" style={{ marginBottom: 6 }}>Application management</p>
              <h1>Applications</h1>
              <p className="admin-subtitle">
                Review seeker submissions, inspect resumes, and move candidates through the hiring workflow.
              </p>
            </div>
            <button className="admin-refresh-btn" onClick={loadApplications} type="button">
              <RefreshCw size={16} strokeWidth={2} />
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
        {success ? <div className="admin-alert admin-alert-success">{success}</div> : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Loaded</h3>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Pending</h3>
            <p className="admin-stat-value">{stats.Pending}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Approved</h3>
            <p className="admin-stat-value">{stats.Approved}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Hired</h3>
            <p className="admin-stat-value">{stats.Hired}</p>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <FileText size={18} />
              All Applications
            </h2>
            <form className="admin-filter-row" onSubmit={handleSearchSubmit}>
              <div className="admin-search-field">
                <Search size={16} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search job title or cover letter"
                />
              </div>
              <select className="admin-select" value={filterStatus} onChange={handleFilterChange}>
                {statusOptions.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="admin-refresh-btn" type="submit">
                Search
              </button>
            </form>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Cover Letter</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">Loading applications...</td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="6">No applications found.</td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id}>
                      <td>
                        <strong>{application.seeker?.name || 'Unknown seeker'}</strong>
                        <div className="admin-muted-text">{application.seeker?.email || ''}</div>
                      </td>
                      <td>
                        <strong>{application.job?.title || application.jobTitle || 'Untitled job'}</strong>
                        <div className="admin-muted-text">
                          {application.job?.company?.name || 'Company not available'}
                          {application.job?.location ? ` · ${application.job.location}` : ''}
                        </div>
                      </td>
                      <td className="admin-application-cover">
                        {application.coverLetter || 'No cover letter provided.'}
                      </td>
                      <td>
                        {application.resume ? (
                          <a className="admin-application-link" href={application.resume} target="_blank" rel="noreferrer">
                            View Resume
                          </a>
                        ) : (
                          <span className="admin-muted-text">No resume</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-application-status-cell">
                          <span className={`admin-badge ${getStatusBadgeClass(application.status)}`}>
                            {application.status}
                          </span>
                          <select
                            className="admin-select admin-application-status-select"
                            value={application.status}
                            disabled={updatingId === application._id}
                            onChange={(event) => handleStatusChange(application._id, event.target.value)}
                          >
                            {appStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              Page {pagination.page} of {pagination.pages || 1} · {pagination.total} total applications
            </span>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-action-btn admin-action-neutral"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPagination((currentPagination) => ({ ...currentPagination, page: currentPagination.page - 1 }))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-action-btn admin-action-neutral"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => setPagination((currentPagination) => ({ ...currentPagination, page: currentPagination.page + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationManagement;
