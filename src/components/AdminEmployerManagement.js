import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  approveEmployer,
  getAllEmployers,
  getPendingEmployers,
  rejectEmployer,
} from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminEmployerManagement.css';

const AdminEmployerManagement = () => {
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('details');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const loadEmployers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let response;

      if (verificationFilter === 'pending') {
        response = await getPendingEmployers({ page, limit });
      } else {
        response = await getAllEmployers({
          verificationStatus: verificationFilter === 'all' ? null : verificationFilter,
          page,
          limit,
          search: search || null,
        });
      }

      const data = response.data;
      const employerList = data.employers || data.data || [];
      setEmployers(employerList);
      setFilteredEmployers(employerList);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employers.');
    } finally {
      setLoading(false);
    }
  }, [page, search, verificationFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, verificationFilter]);

  useEffect(() => {
    loadEmployers();
  }, [loadEmployers]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="admin-badge admin-badge-warning">Pending</span>;
      case 'approved':
        return <span className="admin-badge admin-badge-success">Approved</span>;
      case 'rejected':
        return <span className="admin-badge admin-badge-error">Rejected</span>;
      default:
        return <span className="admin-badge admin-badge-status">Unknown</span>;
    }
  };

  const openDetails = (employer) => {
    setSelectedEmployer(employer);
    setModalMode('details');
    setShowModal(true);
    setRejectionReason('');
    setAdminNotes('');
  };

  const openApproveModal = (employer) => {
    setSelectedEmployer(employer);
    setModalMode('approve');
    setShowModal(true);
    setAdminNotes('');
  };

  const openRejectModal = (employer) => {
    setSelectedEmployer(employer);
    setModalMode('reject');
    setShowModal(true);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedEmployer) return;

    setActionLoading(true);
    try {
      setError('');
      setSuccess('');

      await approveEmployer(selectedEmployer.user._id, { adminNotes });

      setSuccess(`Employer "${selectedEmployer.profile?.companyName}" approved successfully!`);
      setShowModal(false);
      await loadEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve employer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEmployer || !rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    setActionLoading(true);
    try {
      setError('');
      setSuccess('');

      await rejectEmployer(selectedEmployer.user._id, {
        rejectionReason,
        adminNotes,
      });

      setSuccess(`Employer "${selectedEmployer.profile?.companyName}" rejected successfully!`);
      setShowModal(false);
      await loadEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject employer.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = employers.filter(
    (employer) => employer.profile?.verificationStatus === 'pending'
  ).length;
  const approvedCount = employers.filter(
    (employer) => employer.profile?.verificationStatus === 'approved'
  ).length;
  const rejectedCount = employers.filter(
    (employer) => employer.profile?.verificationStatus === 'rejected'
  ).length;

  return (
    <AdminLayout>
      <div className="admin-page admin-employer-management">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <p className="admin-subtitle" style={{ marginBottom: 6 }}>Employer verification</p>
              <h1>Employers</h1>
              <p className="admin-subtitle">
                Review company registrations, verify employer accounts, and manage approval decisions.
              </p>
            </div>
            <button
              className="admin-refresh-btn"
              onClick={loadEmployers}
              disabled={loading}
              title="Refresh employer list"
              type="button"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} strokeWidth={2} />
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="admin-alert admin-alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="admin-alert admin-alert-success">
            <CheckCircle2 size={18} />
            {success}
          </div>
        ) : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Pending Review</h3>
            <p className="admin-stat-value">{pendingCount}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Approved</h3>
            <p className="admin-stat-value">{approvedCount}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Rejected</h3>
            <p className="admin-stat-value">{rejectedCount}</p>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <Building2 size={18} />
              All Employers
            </h2>
            <div className="admin-filter-row">
              <div className="admin-search-field">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search company or email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                className="admin-select"
                value={verificationFilter}
                onChange={(event) => setVerificationFilter(event.target.value)}
              >
                <option value="all">All Employers</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="employer-state">
              <Loader2 size={32} className="animate-spin" />
              <p>Loading employers...</p>
            </div>
          ) : filteredEmployers.length === 0 ? (
            <div className="employer-state">
              <Building2 size={48} />
              <p>No employers found</p>
              <span>Try adjusting your search or filters.</span>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table employer-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact Person</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployers.map((employer) => (
                      <tr key={employer.user._id}>
                        <td>
                          <div className="company-info">
                            <div className="company-avatar">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <strong>{employer.profile?.companyName || 'N/A'}</strong>
                              <div className="admin-muted-text">
                                {employer.profile?.companySize
                                  ? `${employer.profile.companySize} employees`
                                  : 'Company size not listed'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{employer.user.name}</td>
                        <td className="email-cell">{employer.user.email}</td>
                        <td>{getStatusBadge(employer.profile?.verificationStatus)}</td>
                        <td>
                          {employer.user.createdAt
                            ? new Date(employer.user.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="admin-action-btn admin-action-neutral"
                            onClick={() => openDetails(employer)}
                            title="View details"
                            type="button"
                          >
                            Review
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <div className="admin-pagination">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="admin-pagination-actions">
                    <button
                      className="admin-action-btn admin-action-neutral"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="admin-action-btn admin-action-neutral"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        {showModal && selectedEmployer ? (
          <div className="employer-modal-backdrop" onClick={() => setShowModal(false)}>
            <section
              className="employer-modal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="employer-modal-title"
            >
              {modalMode === 'details' ? (
                <>
                  <div className="employer-modal-header">
                    <div>
                      <p className="admin-subtitle" style={{ marginBottom: 4 }}>Employer review</p>
                      <h2 id="employer-modal-title">Employer Details</h2>
                    </div>
                    <button
                      className="admin-icon-btn employer-modal-close"
                      onClick={() => setShowModal(false)}
                      type="button"
                      aria-label="Close employer details"
                    >
                      x
                    </button>
                  </div>

                  <div className="employer-detail-grid">
                    <div>
                      <span>Company Name</span>
                      <strong>{selectedEmployer.profile?.companyName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Company Size</span>
                      <strong>{selectedEmployer.profile?.companySize || 'N/A'}</strong>
                    </div>
                    <div>
                      <span>Contact Person</span>
                      <strong>{selectedEmployer.user.name}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{selectedEmployer.user.email}</strong>
                    </div>
                    {selectedEmployer.user.phone ? (
                      <div>
                        <span>Phone</span>
                        <strong>{selectedEmployer.user.phone}</strong>
                      </div>
                    ) : null}
                    {selectedEmployer.profile?.industry ? (
                      <div>
                        <span>Industry</span>
                        <strong>{selectedEmployer.profile.industry}</strong>
                      </div>
                    ) : null}
                    {selectedEmployer.profile?.location ? (
                      <div>
                        <span>Location</span>
                        <strong>{selectedEmployer.profile.location}</strong>
                      </div>
                    ) : null}
                    {selectedEmployer.profile?.companyWebsite ? (
                      <div>
                        <span>Website</span>
                        <strong>
                          <a
                            href={selectedEmployer.profile.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {selectedEmployer.profile.companyWebsite}
                          </a>
                        </strong>
                      </div>
                    ) : null}
                    <div>
                      <span>Status</span>
                      <strong>{getStatusBadge(selectedEmployer.profile?.verificationStatus)}</strong>
                    </div>
                    {selectedEmployer.profile?.rejectionReason ? (
                      <div className="employer-detail-wide employer-rejection-reason">
                        <span>Rejection Reason</span>
                        <p>{selectedEmployer.profile.rejectionReason}</p>
                      </div>
                    ) : null}
                    {selectedEmployer.profile?.companyDescription ? (
                      <div className="employer-detail-wide">
                        <span>Company Description</span>
                        <p>{selectedEmployer.profile.companyDescription}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="employer-modal-actions">
                    {selectedEmployer.profile?.verificationStatus === 'pending' ? (
                      <>
                        <button
                          className="admin-action-btn admin-action-danger"
                          onClick={() => openRejectModal(selectedEmployer)}
                          type="button"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                        <button
                          className="admin-action-btn admin-action-success"
                          onClick={() => openApproveModal(selectedEmployer)}
                          type="button"
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </button>
                      </>
                    ) : (
                      <button
                        className="admin-action-btn admin-action-neutral"
                        onClick={() => setShowModal(false)}
                        type="button"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </>
              ) : null}

              {modalMode === 'approve' ? (
                <>
                  <div className="employer-modal-header">
                    <div>
                      <p className="admin-subtitle" style={{ marginBottom: 4 }}>Employer review</p>
                      <h2 id="employer-modal-title">Approve Employer</h2>
                    </div>
                    <button
                      className="admin-icon-btn employer-modal-close"
                      onClick={() => setShowModal(false)}
                      type="button"
                      aria-label="Close approval dialog"
                    >
                      x
                    </button>
                  </div>

                  <p className="employer-modal-description">
                    You are about to approve <strong>{selectedEmployer.profile?.companyName}</strong>.
                    They will be able to post jobs and manage applications.
                  </p>

                  <label className="admin-form-field employer-modal-field">
                    <span>Admin Notes (Optional)</span>
                    <textarea
                      placeholder="Add any notes for this approval..."
                      value={adminNotes}
                      onChange={(event) => setAdminNotes(event.target.value)}
                      rows="4"
                    />
                  </label>

                  <div className="employer-modal-actions">
                    <button
                      className="admin-action-btn admin-action-neutral"
                      onClick={() => setModalMode('details')}
                      disabled={actionLoading}
                      type="button"
                    >
                      Back
                    </button>
                    <button
                      className="admin-action-btn admin-action-success"
                      onClick={handleApprove}
                      disabled={actionLoading}
                      type="button"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={13} /> : null}
                      Confirm Approval
                    </button>
                  </div>
                </>
              ) : null}

              {modalMode === 'reject' ? (
                <>
                  <div className="employer-modal-header">
                    <div>
                      <p className="admin-subtitle" style={{ marginBottom: 4 }}>Employer review</p>
                      <h2 id="employer-modal-title">Reject Employer</h2>
                    </div>
                    <button
                      className="admin-icon-btn employer-modal-close"
                      onClick={() => setShowModal(false)}
                      type="button"
                      aria-label="Close rejection dialog"
                    >
                      x
                    </button>
                  </div>

                  <p className="employer-modal-description">
                    You are about to reject <strong>{selectedEmployer.profile?.companyName}</strong>.
                    They will be notified of the rejection.
                  </p>

                  <label className="admin-form-field employer-modal-field">
                    <span>Rejection Reason *</span>
                    <textarea
                      placeholder="Explain why you are rejecting this employer registration..."
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      rows="4"
                      required
                    />
                  </label>

                  <label className="admin-form-field employer-modal-field">
                    <span>Admin Notes (Optional)</span>
                    <textarea
                      placeholder="Internal notes for this rejection..."
                      value={adminNotes}
                      onChange={(event) => setAdminNotes(event.target.value)}
                      rows="3"
                    />
                  </label>

                  <div className="employer-modal-actions">
                    <button
                      className="admin-action-btn admin-action-neutral"
                      onClick={() => setModalMode('details')}
                      disabled={actionLoading}
                      type="button"
                    >
                      Back
                    </button>
                    <button
                      className="admin-action-btn admin-action-danger"
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                      type="button"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={13} /> : null}
                      Confirm Rejection
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployerManagement;
