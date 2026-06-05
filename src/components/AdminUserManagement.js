import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  ShieldX,
  UserRound,
  X,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { deleteUser, getUsers, updateUserStatus, verifyUser } from '../services/adminService';
import '../styles/adminDashboard.css';

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
  { value: 'pending', label: 'Pending Verification' },
];

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'employer', label: 'Employer' },
  { value: 'seeker', label: 'Seeker' },
];

const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;

  // Details modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('details');
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const authSummary = useMemo(() => {
    return {
      icon: <UserRound size={18} />,
    };
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const query = {
        page,
        limit,
      };

      // Backend only supports active/inactive/banned in filter; pending verification is handled client-side.
      if (role) query.role = role;
      if (status && status !== 'pending') query.status = status;
      if (searchTerm.trim()) query.search = searchTerm.trim();

      const res = await getUsers(query);

      const nextUsers = res.data.users || [];
      const nextPagination = res.data.pagination || { total: 0, page, pages: 1 };

      // client-side pending verification filter
      const enrichedUsers =
        status === 'pending'
          ? nextUsers.filter((u) => u && u.isVerified === false)
          : nextUsers;

      setUsers(enrichedUsers);
      setPagination({ ...nextPagination, page });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, status, searchTerm]);

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [role, status, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openDetails = (u) => {
    setSelectedUser(u);
    setModalMode('details');
    setBanReason('');
    setActionLoading(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalMode('details');
    setBanReason('');
    setActionLoading(false);
  };

  const handleAction = async (action) => {
    if (!selectedUser) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      if (action === 'verify') {
        await verifyUser(selectedUser._id);
        setSuccess('User verified successfully.');
      } else if (action === 'activate') {
        await updateUserStatus(selectedUser._id, 'activate', {});
        setSuccess('User activated successfully.');
      } else if (action === 'deactivate') {
        await updateUserStatus(selectedUser._id, 'deactivate', {});
        setSuccess('User deactivated successfully.');
      } else if (action === 'ban') {
        if (!banReason.trim()) {
          setError('Ban reason is required.');
          return;
        }
        await updateUserStatus(selectedUser._id, 'ban', { reason: banReason.trim() });
        setSuccess('User banned successfully.');
      } else if (action === 'unban') {
        await updateUserStatus(selectedUser._id, 'unban', {});
        setSuccess('User unbanned successfully.');
      } else if (action === 'delete') {
        const ok = window.confirm('Delete user permanently? This cannot be undone.');
        if (!ok) return;
        await deleteUser(selectedUser._id);
        setSuccess('User deleted successfully.');
        closeModal();
      }

      await loadUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'User action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadgeClass = (u) => {
    if (u.isBanned) return 'admin-badge-error';
    if (!u.isActive) return 'admin-badge-warning';
    return 'admin-badge-success';
  };

  const pages = Math.max(pagination.pages || 1, 1);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <p className="admin-subtitle" style={{ marginBottom: 6 }}>
                {authSummary.icon} User management
              </p>
              <h1>Users</h1>
              <p className="admin-subtitle">Manage accounts: status, bans, verification, and deletion.</p>
            </div>
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

        <section className="admin-section">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <UserRound size={18} /> All Users
            </h2>

            <div className="admin-filter-row">
              <div className="admin-search-field">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {roleOptions.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="employer-state">
              <Loader2 size={32} className="animate-spin" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="employer-state">
              <ShieldX size={48} />
              <p>No users found</p>
              <span>Try adjusting your search or filters.</span>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="admin-badge admin-badge-role">{u.role}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.isVerified ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${statusBadgeClass(u)}`}>
                          {u.isBanned ? 'Banned' : u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-action-btn admin-action-neutral"
                          onClick={() => openDetails(u)}
                        >
                          Manage <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 ? (
            <div className="admin-pagination">
              <span>
                Page {page} of {pages}
              </span>
              <div className="admin-pagination-actions">
                <button
                  className="admin-action-btn admin-action-neutral"
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="admin-action-btn admin-action-neutral"
                  type="button"
                  disabled={page >= pages || loading}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {showModal && selectedUser ? (
          <div className="employer-modal-backdrop" onClick={closeModal}>
            <section
              className="employer-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="employer-modal-header">
                <div>
                  <p className="admin-subtitle" style={{ marginBottom: 4 }}>User management</p>
                  <h2>{selectedUser.name}</h2>
                </div>
                <button className="admin-icon-btn employer-modal-close" type="button" onClick={closeModal} aria-label="Close">
                  x
                </button>
              </div>

              <div className="employer-detail-grid">
                <div>
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>
                <div>
                  <span>Role</span>
                  <strong>{selectedUser.role}</strong>
                </div>
                <div>
                  <span>Verification</span>
                  <strong>{selectedUser.isVerified ? 'Verified' : 'Pending'}</strong>
                </div>
                <div>
                  <span>Account</span>
                  <strong>
                    {selectedUser.isBanned ? 'Banned' : selectedUser.isActive ? 'Active' : 'Inactive'}
                  </strong>
                </div>
                {selectedUser.bannedReason ? (
                  <div className="employer-detail-wide employer-rejection-reason">
                    <span>Ban reason</span>
                    <p>{selectedUser.bannedReason}</p>
                  </div>
                ) : null}
                {selectedUser.adminNotes ? (
                  <div className="employer-detail-wide">
                    <span>Admin notes</span>
                    <p>{selectedUser.adminNotes}</p>
                  </div>
                ) : null}
              </div>

              <div className="employer-modal-actions" style={{ flexWrap: 'wrap' }}>
                {!selectedUser.isVerified ? (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-success"
                    disabled={actionLoading}
                    onClick={() => handleAction('verify')}
                  >
                    Verify
                  </button>
                ) : null}

                {selectedUser.isActive ? (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-neutral"
                    disabled={actionLoading}
                    onClick={() => handleAction('deactivate')}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-neutral"
                    disabled={actionLoading}
                    onClick={() => handleAction('activate')}
                  >
                    Activate
                  </button>
                )}

                {selectedUser.isBanned ? (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-warning"
                    disabled={actionLoading}
                    onClick={() => handleAction('unban')}
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-action-btn admin-action-warning"
                    disabled={actionLoading}
                    onClick={() => setModalMode('ban')}
                  >
                    Ban
                  </button>
                )}

                <button
                  type="button"
                  className="admin-action-btn admin-action-danger"
                  disabled={actionLoading}
                  onClick={() => handleAction('delete')}
                >
                  Delete
                </button>

                {modalMode === 'ban' ? (
                  <div style={{ width: '100%', marginTop: 10 }}>
                    <label className="admin-form-field" style={{ width: '100%' }}>
                      <span>Ban reason *</span>
                      <textarea
                        rows={3}
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-neutral"
                        disabled={actionLoading}
                        onClick={() => setModalMode('details')}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-warning"
                        disabled={actionLoading || !banReason.trim()}
                        onClick={() => handleAction('ban')}
                      >
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        Confirm Ban
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;

