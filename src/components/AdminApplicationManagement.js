import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCw, Search, X, CheckCircle2, Clock, Ban, Award } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getApplications, updateApplicationStatus } from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminApplicationManagement.css';

const appStatuses = ['Pending', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'];

const getStatusBadgeClass = (status) => {
  if (['Accepted', 'Shortlisted', 'Interview Scheduled'].includes(status)) return 'admin-badge-success';
  if (status === 'Rejected') return 'admin-badge-error';
  if (status === 'Reviewing') return 'admin-badge-status';
  return 'admin-badge-warning';
};

const AdminApplicationManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [reviewApplication, setReviewApplication] = useState(null);
  const [nextStatus, setNextStatus] = useState('Pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryParams = useMemo(() => {
    const params = {
      page: pagination.page,
      limit: 10,
    };

    if (currentTab === 'pending') params.status = 'Pending';
    if (currentTab === 'reviewing') params.status = 'Reviewing';
    if (currentTab === 'shortlisted') params.status = 'Shortlisted';
    if (currentTab === 'interview') params.status = 'Interview Scheduled';
    if (currentTab === 'accepted') params.status = 'Accepted';
    if (currentTab === 'rejected') params.status = 'Rejected';

    if (searchTerm.trim()) params.search = searchTerm.trim();

    return params;
  }, [currentTab, pagination.page, searchTerm]);

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
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    return applications.reduce(
      (summary, application) => {
        summary.total += 1;
        summary[application.status] = (summary[application.status] || 0) + 1;
        return summary;
      },
      { total: 0, Pending: 0, Reviewing: 0, Shortlisted: 0, 'Interview Scheduled': 0, Accepted: 0, Rejected: 0 }
    );
  }, [applications]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
    loadApplications();
  };

  const openReviewPanel = (application) => {
    setReviewApplication(application);
    setNextStatus(application.status || 'Pending');
    setError('');
    setSuccess('');
  };

  const closeReviewPanel = () => {
    setReviewApplication(null);
    setNextStatus('Pending');
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
      closeReviewPanel();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdatingId('');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Applications', icon: <FileText size={16} /> },
    { id: 'pending', label: 'Pending', icon: <Clock size={16} /> },
    { id: 'reviewing', label: 'Reviewing', icon: <CheckCircle2 size={16} /> },
    { id: 'shortlisted', label: 'Shortlisted', icon: <Award size={16} /> },
    { id: 'interview', label: 'Interview', icon: <Clock size={16} /> },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle2 size={16} /> },
    { id: 'rejected', label: 'Rejected', icon: <Ban size={16} /> },
  ];

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
            <h3>Reviewing</h3>
            <p className="admin-stat-value">{stats.Reviewing}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Shortlisted</h3>
            <p className="admin-stat-value">{stats.Shortlisted}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Interview</h3>
            <p className="admin-stat-value">{stats['Interview Scheduled']}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Accepted</h3>
            <p className="admin-stat-value">{stats.Accepted}</p>
          </div>
        </section>

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setPagination((curr) => ({ ...curr, page: 1 }));
                navigate(`/admin/applications/${tab.id}`);
              }}
            >
              <span className="admin-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <section className="admin-section">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <FileText size={18} />
              {tabs.find(t => t.id === currentTab)?.label || 'All Applications'}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading applications...</td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="7">No applications found.</td>
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
                        </div>
                      </td>
                      <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn admin-action-neutral"
                          onClick={() => openReviewPanel(application)}
                        >
                          Review
                        </button>
                      </td>
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

        {reviewApplication ? (
          <div className="admin-application-modal-backdrop" role="presentation">
            <section className="admin-application-modal" role="dialog" aria-modal="true" aria-labelledby="application-review-title">
              <div className="admin-application-modal-header">
                <div>
                  <p className="admin-subtitle" style={{ marginBottom: 4 }}>Application review</p>
                  <h2 id="application-review-title">
                    {reviewApplication.seeker?.name || 'Unknown seeker'}
                  </h2>
                </div>
                <button
                  type="button"
                  className="admin-icon-btn admin-application-modal-close"
                  onClick={closeReviewPanel}
                  aria-label="Close application review"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="admin-application-review-grid">
                <div>
                  <span>Job</span>
                  <strong>{reviewApplication.job?.title || reviewApplication.jobTitle || 'Untitled job'}</strong>
                </div>
                <div>
                  <span>Candidate Email</span>
                  <strong>{reviewApplication.seeker?.email || 'Not available'}</strong>
                </div>
                <div>
                  <span>Current Status</span>
                  <strong>{reviewApplication.status}</strong>
                </div>
                <div>
                  <span>Submitted</span>
                  <strong>{new Date(reviewApplication.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="admin-application-review-section">
                <span>Cover Letter</span>
                <p>{reviewApplication.coverLetter || 'No cover letter provided.'}</p>
              </div>

              <label className="admin-application-review-status">
                <span>Update Status</span>
                <select
                  className="admin-select"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value)}
                >
                  {appStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-application-modal-actions">
                {reviewApplication.resume ? (
                  <a
                    className="admin-action-btn admin-action-neutral"
                    href={reviewApplication.resume}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Resume
                  </a>
                ) : null}
                <button type="button" className="admin-action-btn admin-action-neutral" onClick={closeReviewPanel}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-primary-btn"
                  disabled={updatingId === reviewApplication._id || nextStatus === reviewApplication.status}
                  onClick={() => handleStatusChange(reviewApplication._id, nextStatus)}
                >
                  {updatingId === reviewApplication._id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationManagement;
