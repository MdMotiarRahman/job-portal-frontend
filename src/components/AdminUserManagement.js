import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  ShieldX,
  UserRound,
  X,
  Users,
  ShieldAlert,
  Ban,
  UserCheck,
  Clock,
  Mail,
  MapPin,
  Calendar,
  Trash2,
  Eye,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import { deleteUser, getUsers, updateUserStatus, verifyUser, updateUser } from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminUserMgmt.css';

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'employer', label: 'Employer' },
  { value: 'seeker', label: 'Seeker' },
];

const availablePermissions = [
  'manage_users',
  'manage_jobs',
  'manage_employers',
  'manage_settings',
  'view_reports',
];

const formatDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('details');
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rbacForm, setRbacForm] = useState({ role: '', permissions: [] });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const query = { page, limit };
      if (role) query.role = role;
      if (currentTab === 'active') query.status = 'active';
      if (currentTab === 'inactive') query.status = 'inactive';
      if (currentTab === 'banned') query.status = 'banned';
      if (searchTerm.trim()) query.search = searchTerm.trim();

      const res = await getUsers(query);
      let nextUsers = res.data.users || [];
      const nextPagination = res.data.pagination || { total: 0, page, pages: 1 };

      if (currentTab === 'pending') {
        nextUsers = nextUsers.filter((u) => u && u.isVerified === false);
      }

      setUsers(nextUsers);
      setPagination({ ...nextPagination, page });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, currentTab, searchTerm]);

  useEffect(() => { setPage(1); }, [role, currentTab, searchTerm]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openDetails = (u) => {
    setSelectedUser(u);
    setModalMode('details');
    setBanReason('');
    setRbacForm({ role: u.role || 'seeker', permissions: u.permissions || [] });
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
        if (!banReason.trim()) { setError('Ban reason is required.'); setActionLoading(false); return; }
        await updateUserStatus(selectedUser._id, 'ban', { reason: banReason.trim() });
        setSuccess('User banned successfully.');
      } else if (action === 'unban') {
        await updateUserStatus(selectedUser._id, 'unban', {});
        setSuccess('User unbanned successfully.');
      } else if (action === 'delete') {
        const ok = window.confirm('Delete user permanently? This cannot be undone.');
        if (!ok) { setActionLoading(false); return; }
        await deleteUser(selectedUser._id);
        setSuccess('User deleted successfully.');
        closeModal();
      } else if (action === 'update_rbac') {
        const res = await updateUser(selectedUser._id, { role: rbacForm.role, permissions: rbacForm.permissions });
        setSuccess('Role and permissions updated.');
        setModalMode('details');
        setSelectedUser(res.data.user);
      }
      await loadUsers();
      if (action !== 'update_rbac' && action !== 'delete') closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'User action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const togglePermission = (perm) => {
    setRbacForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const statusBadge = (u) => {
    if (u.isBanned) return { cls: 'adm-badge-error', text: 'Banned' };
    if (!u.isActive) return { cls: 'adm-badge-warning', text: 'Inactive' };
    return { cls: 'adm-badge-success', text: 'Active' };
  };

  const pages = Math.max(pagination.pages || 1, 1);

  const tabs = [
    { id: 'all', label: 'All Users', icon: Users },
    { id: 'active', label: 'Active', icon: UserCheck },
    { id: 'banned', label: 'Banned', icon: Ban },
    { id: 'pending', label: 'Pending', icon: Clock },
  ];

  return (
    <AdminLayout>
      <div className="admin-page adm-umgmt">
        {/* Header */}
        <div className="adm-umgmt-header">
          <div className="adm-umgmt-header-text">
            <h1>User Management</h1>
            <p>Manage accounts, roles, verification and access control.</p>
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div className="admin-alert admin-alert-success">{success}</div>}

        {/* Tabs */}
        <div className="adm-umgmt-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`adm-umgmt-tab ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => navigate(`/admin/users/${tab.id}`)}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters + Table */}
        <div className="adm-umgmt-card">
          <div className="adm-umgmt-toolbar">
            <div className="adm-umgmt-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="adm-umgmt-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {roleOptions.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="adm-umgmt-empty">
              <Loader2 size={28} className="adm-spin" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="adm-umgmt-empty">
              <ShieldX size={36} />
              <p>No users found</p>
              <span>Try adjusting your search or filters.</span>
            </div>
          ) : (
            <div className="adm-umgmt-table-wrap">
              <table className="adm-umgmt-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const st = statusBadge(u);
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="adm-umgmt-user-cell">
                            <UserAvatar user={u} size={36} />
                            <div>
                              <p className="adm-umgmt-user-name">{u.name}</p>
                              <p className="adm-umgmt-user-email">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="adm-badge adm-badge-role">{u.role}</span></td>
                        <td>
                          <span className={`adm-badge ${u.isVerified ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                            {u.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td><span className={`adm-badge ${st.cls}`}>{st.text}</span></td>
                        <td className="adm-umgmt-date">{formatDate(u.createdAt || u.lastLogin)}</td>
                        <td>
                          <button className="adm-umgmt-view-btn" onClick={() => openDetails(u)} title="View details">
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="adm-umgmt-pagination">
              <span>Page {page} of {pages}</span>
              <div className="adm-umgmt-pagination-btns">
                <button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                <button disabled={page >= pages || loading} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="adm-modal-backdrop" onClick={closeModal}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <button className="adm-modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>

              {/* Modal Header */}
              <div className="adm-modal-header">
                <UserAvatar user={selectedUser} size={52} />
                <div>
                  <h2>{selectedUser.name}</h2>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="adm-modal-body">
                {modalMode === 'details' && (
                  <>
                    {/* Status Row */}
                    <div className="adm-modal-status-row">
                      <span className={`adm-badge ${selectedUser.isVerified ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                        {selectedUser.isVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className={`adm-badge ${statusBadge(selectedUser).cls}`}>
                        {statusBadge(selectedUser).text}
                      </span>
                      <span className="adm-badge adm-badge-role">{selectedUser.role}</span>
                    </div>

                    {/* Info Grid */}
                    <div className="adm-modal-info">
                      <div className="adm-modal-info-item">
                        <Mail size={14} />
                        <div>
                          <span>Email</span>
                          <strong>{selectedUser.email}</strong>
                        </div>
                      </div>
                      <div className="adm-modal-info-item">
                        <UserRound size={14} />
                        <div>
                          <span>Role</span>
                          <strong>{selectedUser.role}</strong>
                        </div>
                      </div>
                      <div className="adm-modal-info-item">
                        <Calendar size={14} />
                        <div>
                          <span>Last Login</span>
                          <strong>{formatDate(selectedUser.lastLogin)}</strong>
                        </div>
                      </div>
                      <div className="adm-modal-info-item">
                        <MapPin size={14} />
                        <div>
                          <span>Location</span>
                          <strong>{selectedUser.location || '—'}</strong>
                        </div>
                      </div>
                    </div>

                    {selectedUser.bannedReason && (
                      <div className="adm-modal-banner adm-modal-banner-error">
                        <Ban size={14} />
                        <div>
                          <strong>Ban Reason</strong>
                          <p>{selectedUser.bannedReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="adm-modal-actions">
                      <button className="adm-action adm-action-primary" disabled={actionLoading} onClick={() => setModalMode('rbac')}>
                        <ShieldAlert size={14} /> Manage RBAC
                      </button>
                      {!selectedUser.isVerified && (
                        <button className="adm-action adm-action-success" disabled={actionLoading} onClick={() => handleAction('verify')}>
                          <CheckCircle2 size={14} /> Verify
                        </button>
                      )}
                      {selectedUser.isActive ? (
                        <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => handleAction('deactivate')}>
                          Deactivate
                        </button>
                      ) : (
                        <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => handleAction('activate')}>
                          Activate
                        </button>
                      )}
                      {selectedUser.isBanned ? (
                        <button className="adm-action adm-action-warning" disabled={actionLoading} onClick={() => handleAction('unban')}>
                          Unban
                        </button>
                      ) : (
                        <button className="adm-action adm-action-warning" disabled={actionLoading} onClick={() => setModalMode('ban')}>
                          <Ban size={14} /> Ban
                        </button>
                      )}
                    </div>

                    <div className="adm-modal-danger">
                      <button className="adm-action adm-action-danger" disabled={actionLoading} onClick={() => handleAction('delete')}>
                        <Trash2 size={14} /> Delete User
                      </button>
                    </div>
                  </>
                )}

                {modalMode === 'ban' && (
                  <div className="adm-modal-ban-form">
                    <h3>Ban User</h3>
                    <p>Provide a reason for banning <strong>{selectedUser.name}</strong>.</p>
                    <textarea
                      rows={3}
                      placeholder="Enter ban reason..."
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    />
                    <div className="adm-modal-ban-actions">
                      <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => setModalMode('details')}>Cancel</button>
                      <button className="adm-action adm-action-warning" disabled={actionLoading || !banReason.trim()} onClick={() => handleAction('ban')}>
                        {actionLoading ? <Loader2 size={14} className="adm-spin" /> : null}
                        Confirm Ban
                      </button>
                    </div>
                  </div>
                )}

                {modalMode === 'rbac' && (
                  <div className="adm-modal-rbac">
                    <h3>Role & Permissions</h3>
                    <label className="adm-rbac-field">
                      <span>Role</span>
                      <select className="adm-umgmt-select" value={rbacForm.role} onChange={(e) => setRbacForm({ ...rbacForm, role: e.target.value })}>
                        <option value="seeker">Seeker</option>
                        <option value="employer">Employer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <div className="adm-rbac-perms">
                      <span>Permissions</span>
                      {availablePermissions.map(perm => (
                        <label key={perm} className="adm-rbac-check">
                          <input
                            type="checkbox"
                            checked={rbacForm.permissions.includes(perm)}
                            onChange={() => togglePermission(perm)}
                          />
                          <span>{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </label>
                      ))}
                    </div>
                    <div className="adm-modal-rbac-actions">
                      <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => setModalMode('details')}>Cancel</button>
                      <button className="adm-action adm-action-primary" disabled={actionLoading} onClick={() => handleAction('update_rbac')}>
                        {actionLoading ? <Loader2 size={14} className="adm-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;
