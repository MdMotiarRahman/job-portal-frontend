import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  getAllEmployers,
  getPendingEmployers,
  approveEmployer,
  rejectEmployer,
} from '../services/adminService';
import '../styles/adminEmployerManagement.css';

const AdminEmployerManagement = () => {
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all'); // all, pending, approved, rejected
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('details'); // details, approve, reject
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const loadEmployers = async () => {
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
      setEmployers(data.employers || data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setFilteredEmployers(data.employers || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, verificationFilter]);

  useEffect(() => {
    loadEmployers();
  }, [page, search, verificationFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">⏳ Pending</span>;
      case 'approved':
        return <span className="badge badge-success">✓ Approved</span>;
      case 'rejected':
        return <span className="badge badge-error">✗ Rejected</span>;
      default:
        return <span className="badge badge-default">Unknown</span>;
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
    (e) => e.profile?.verificationStatus === 'pending'
  ).length;

  return (
    <AdminLayout>
      <div className="admin-employer-management">
        {/* Header */}
        <div className="employer-header">
          <div className="employer-header-left">
            <Building2 size={28} className="header-icon" />
            <div>
              <h2>Employer Management</h2>
              <p className="text-muted">Review and manage employer registrations</p>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={loadEmployers}
            disabled={loading}
            title="Refresh employer list"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-content">{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} className="alert-icon" />
            <div className="alert-content">{success}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="employer-stats">
          <div className="stat-card">
            <div className="stat-icon stat-pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-approved">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {employers.filter((e) => e.profile?.verificationStatus === 'approved').length}
              </div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-rejected">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {employers.filter((e) => e.profile?.verificationStatus === 'rejected').length}
              </div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="employer-filters">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by company name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${verificationFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVerificationFilter('all')}
            >
              All Employers
            </button>
            <button
              className={`filter-btn ${verificationFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setVerificationFilter('pending')}
            >
              <Clock size={16} />
              Pending ({pendingCount})
            </button>
            <button
              className={`filter-btn ${verificationFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setVerificationFilter('approved')}
            >
              <CheckCircle2 size={16} />
              Approved
            </button>
            <button
              className={`filter-btn ${verificationFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setVerificationFilter('rejected')}
            >
              <XCircle size={16} />
              Rejected
            </button>
          </div>
        </div>

        {/* Employers Table */}
        <div className="employer-table-container">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={32} className="animate-spin" />
              <p>Loading employers...</p>
            </div>
          ) : filteredEmployers.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} />
              <p>No employers found</p>
              <span className="text-muted">Try adjusting your search or filters</span>
            </div>
          ) : (
            <>
              <table className="employer-table">
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
                    <tr key={employer.user._id} className="employer-row">
                      <td className="company-cell">
                        <div className="company-info">
                          <div className="company-avatar">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="company-name">
                              {employer.profile?.companyName || 'N/A'}
                            </div>
                            <div className="company-size text-muted">
                              {employer.profile?.companySize && `${employer.profile.companySize} employees`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{employer.user.name}</td>
                      <td className="email-cell">{employer.user.email}</td>
                      <td>
                        {getStatusBadge(employer.profile?.verificationStatus)}
                      </td>
                      <td className="text-muted text-sm">
                        {employer.user.createdAt
                          ? new Date(employer.user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <button
                          className="btn-action"
                          onClick={() => openDetails(employer)}
                          title="View details"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedEmployer && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {modalMode === 'details' && (
                <>
                  <div className="modal-header">
                    <div className="modal-title-section">
                      <Building2 size={24} />
                      <h3>Employer Details</h3>
                    </div>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="details-grid">
                      <div className="detail-group">
                        <label>Company Name</label>
                        <p className="detail-value">
                          {selectedEmployer.profile?.companyName || 'N/A'}
                        </p>
                      </div>

                      <div className="detail-group">
                        <label>Company Size</label>
                        <p className="detail-value">
                          {selectedEmployer.profile?.companySize || 'N/A'}
                        </p>
                      </div>

                      <div className="detail-group">
                        <label>Contact Person</label>
                        <p className="detail-value">{selectedEmployer.user.name}</p>
                      </div>

                      <div className="detail-group">
                        <label>Email</label>
                        <p className="detail-value">{selectedEmployer.user.email}</p>
                      </div>

                      {selectedEmployer.user.phone && (
                        <div className="detail-group">
                          <label>Phone</label>
                          <p className="detail-value">{selectedEmployer.user.phone}</p>
                        </div>
                      )}

                      {selectedEmployer.profile?.industry && (
                        <div className="detail-group">
                          <label>Industry</label>
                          <p className="detail-value">{selectedEmployer.profile.industry}</p>
                        </div>
                      )}

                      {selectedEmployer.profile?.location && (
                        <div className="detail-group">
                          <label>Location</label>
                          <p className="detail-value">{selectedEmployer.profile.location}</p>
                        </div>
                      )}

                      {selectedEmployer.profile?.companyWebsite && (
                        <div className="detail-group">
                          <label>Website</label>
                          <p className="detail-value">
                            <a
                              href={selectedEmployer.profile.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-primary"
                            >
                              {selectedEmployer.profile.companyWebsite}
                            </a>
                          </p>
                        </div>
                      )}

                      <div className="detail-group">
                        <label>Status</label>
                        <p className="detail-value">
                          {getStatusBadge(selectedEmployer.profile?.verificationStatus)}
                        </p>
                      </div>

                      {selectedEmployer.profile?.rejectionReason && (
                        <div className="detail-group full-width">
                          <label>Rejection Reason</label>
                          <p className="detail-value rejection-reason">
                            {selectedEmployer.profile.rejectionReason}
                          </p>
                        </div>
                      )}

                      {selectedEmployer.profile?.companyDescription && (
                        <div className="detail-group full-width">
                          <label>Company Description</label>
                          <p className="detail-value">
                            {selectedEmployer.profile.companyDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    {selectedEmployer.profile?.verificationStatus === 'pending' && (
                      <>
                        <button
                          className="btn-secondary"
                          onClick={() => openRejectModal(selectedEmployer)}
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                        <button
                          className="btn-success"
                          onClick={() => openApproveModal(selectedEmployer)}
                        >
                          <CheckCircle2 size={18} />
                          Approve
                        </button>
                      </>
                    )}
                    {selectedEmployer.profile?.verificationStatus !== 'pending' && (
                      <button className="btn-secondary" onClick={() => setShowModal(false)}>
                        Close
                      </button>
                    )}
                  </div>
                </>
              )}

              {modalMode === 'approve' && (
                <>
                  <div className="modal-header">
                    <div className="modal-title-section">
                      <CheckCircle2 size={24} className="text-success" />
                      <h3>Approve Employer</h3>
                    </div>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <p className="modal-description">
                      You are about to approve the employer account for{' '}
                      <strong>{selectedEmployer.profile?.companyName}</strong>. They will be able
                      to post jobs and manage applications.
                    </p>

                    <div className="form-group">
                      <label htmlFor="approve-notes">Admin Notes (Optional)</label>
                      <textarea
                        id="approve-notes"
                        className="form-textarea"
                        placeholder="Add any notes for this approval..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="4"
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => setModalMode('details')}
                      disabled={actionLoading}
                    >
                      Back
                    </button>
                    <button
                      className="btn-success"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                      Confirm Approval
                    </button>
                  </div>
                </>
              )}

              {modalMode === 'reject' && (
                <>
                  <div className="modal-header">
                    <div className="modal-title-section">
                      <XCircle size={24} className="text-error" />
                      <h3>Reject Employer</h3>
                    </div>
                    <button className="modal-close" onClick={() => setShowModal(false)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <p className="modal-description">
                      You are about to reject the employer account for{' '}
                      <strong>{selectedEmployer.profile?.companyName}</strong>. They will be
                      notified of the rejection.
                    </p>

                    <div className="form-group">
                      <label htmlFor="reject-reason">
                        Rejection Reason <span className="required">*</span>
                      </label>
                      <textarea
                        id="reject-reason"
                        className="form-textarea"
                        placeholder="Explain why you are rejecting this employer registration..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="4"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reject-notes">Admin Notes (Optional)</label>
                      <textarea
                        id="reject-notes"
                        className="form-textarea"
                        placeholder="Internal notes for this rejection..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => setModalMode('details')}
                      disabled={actionLoading}
                    >
                      Back
                    </button>
                    <button
                      className="btn-error"
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim()}
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                      Confirm Rejection
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployerManagement;
