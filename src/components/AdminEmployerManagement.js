import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  X,
  Ban,
  Eye,
  Globe,
  MapPin,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import {
  approveEmployer,
  getAllEmployers,
  getPendingEmployers,
  rejectEmployer,
} from '../services/adminService';
import '../styles/adminModule.css';

const formatDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AdminEmployerManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
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
      if (currentTab === 'pending') {
        response = await getPendingEmployers({ page, limit });
      } else {
        response = await getAllEmployers({
          verificationStatus: currentTab === 'all' ? null : currentTab,
          page, limit,
          search: search || null,
        });
      }
      const data = response.data;
      setEmployers(data.employers || data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employers.');
    } finally {
      setLoading(false);
    }
  }, [page, search, currentTab]);

  useEffect(() => { setPage(1); }, [search, currentTab]);
  useEffect(() => { loadEmployers(); }, [loadEmployers]);

  const openDetails = (e) => { setSelectedEmployer(e); setModalMode('details'); setShowModal(true); setRejectionReason(''); setAdminNotes(''); };
  const openApprove = (e) => { setSelectedEmployer(e); setModalMode('approve'); setShowModal(true); setAdminNotes(''); };
  const openReject = (e) => { setSelectedEmployer(e); setModalMode('reject'); setShowModal(true); setRejectionReason(''); };
  const closeModal = () => { setShowModal(false); setSelectedEmployer(null); setModalMode('details'); setActionLoading(false); };

  const handleApprove = async () => {
    if (!selectedEmployer) return;
    setActionLoading(true);
    try {
      setError(''); setSuccess('');
      await approveEmployer(selectedEmployer.user._id, { adminNotes });
      setSuccess(`Employer approved successfully.`);
      closeModal();
      await loadEmployers();
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve.'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedEmployer || !rejectionReason.trim()) { setError('Rejection reason is required.'); return; }
    setActionLoading(true);
    try {
      setError(''); setSuccess('');
      await rejectEmployer(selectedEmployer.user._id, { rejectionReason, adminNotes });
      setSuccess(`Employer rejected successfully.`);
      closeModal();
      await loadEmployers();
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject.'); }
    finally { setActionLoading(false); }
  };

  const statusBadge = (s) => {
    if (s === 'approved') return 'adm-badge-success';
    if (s === 'rejected') return 'adm-badge-error';
    return 'adm-badge-warning';
  };

  const tabs = [
    { id: 'all', label: 'All Employers', icon: Building2 },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected', icon: Ban },
  ];

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <h1>Employer Verification</h1>
            <p>Review company registrations, verify accounts, and manage approvals.</p>
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div className="admin-alert admin-alert-success">{success}</div>}

        <div className="adm-mod-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`adm-mod-tab ${currentTab === tab.id ? 'active' : ''}`} onClick={() => navigate(`/admin/employers/${tab.id}`)}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="adm-mod-card">
          <div className="adm-mod-toolbar">
            <div className="adm-mod-search">
              <Search size={15} />
              <input type="text" placeholder="Search company or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading employers...</p></div>
          ) : employers.length === 0 ? (
            <div className="adm-mod-empty"><Building2 size={36} /><p>No employers found</p><span>Try adjusting your search or filters.</span></div>
          ) : (
            <div className="adm-mod-table-wrap">
              <table className="adm-mod-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((emp) => (
                    <tr key={emp.user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <UserAvatar user={emp.user} size={36} />
                          <div>
                            <p className="adm-mod-cell-main">{emp.profile?.companyName || 'N/A'}</p>
                            <p className="adm-mod-cell-sub">{emp.profile?.industry || 'Industry not set'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="adm-mod-cell-main">{emp.user.name}</p>
                        <p className="adm-mod-cell-sub">{emp.user.email}</p>
                      </td>
                      <td><span className={`adm-badge ${statusBadge(emp.profile?.verificationStatus)}`}>{emp.profile?.verificationStatus || 'Unknown'}</span></td>
                      <td className="adm-mod-date">{formatDate(emp.user.createdAt)}</td>
                      <td><button className="adm-mod-view-btn" onClick={() => openDetails(emp)}><Eye size={14} /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="adm-mod-pagination">
              <span>Page {page} of {totalPages}</span>
              <div className="adm-mod-pagination-btns">
                <button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                <button disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedEmployer && (
          <div className="adm-modal-backdrop" onClick={closeModal}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <button className="adm-modal-close" onClick={closeModal}><X size={18} /></button>

              <div className="adm-modal-header">
                <UserAvatar user={selectedEmployer.user} size={52} />
                <div>
                  <h2>{selectedEmployer.profile?.companyName || 'Company'}</h2>
                  <p>{selectedEmployer.user.email}</p>
                </div>
              </div>

              <div className="adm-modal-body">
                {modalMode === 'details' && (
                  <>
                    <div className="adm-modal-status-row">
                      <span className={`adm-badge ${statusBadge(selectedEmployer.profile?.verificationStatus)}`}>{selectedEmployer.profile?.verificationStatus || 'Unknown'}</span>
                      <span className="adm-badge adm-badge-role">{selectedEmployer.user.role}</span>
                    </div>

                    <div className="adm-modal-info">
                      <div className="adm-modal-info-item"><Building2 size={14} /><div><span>Company</span><strong>{selectedEmployer.profile?.companyName || '—'}</strong></div></div>
                      <div className="adm-modal-info-item"><Users size={14} /><div><span>Size</span><strong>{selectedEmployer.profile?.companySize || '—'} employees</strong></div></div>
                      <div className="adm-modal-info-item"><Mail size={14} /><div><span>Email</span><strong>{selectedEmployer.user.email}</strong></div></div>
                      <div className="adm-modal-info-item"><Phone size={14} /><div><span>Phone</span><strong>{selectedEmployer.user.phone || selectedEmployer.profile?.phone || '—'}</strong></div></div>
                      <div className="adm-modal-info-item"><MapPin size={14} /><div><span>Location</span><strong>{selectedEmployer.profile?.location || '—'}</strong></div></div>
                      <div className="adm-modal-info-item"><Globe size={14} /><div><span>Website</span><strong>{selectedEmployer.profile?.companyWebsite || '—'}</strong></div></div>
                      {selectedEmployer.profile?.companyDescription && (
                        <div className="adm-modal-wide"><span>Description</span><p>{selectedEmployer.profile.companyDescription}</p></div>
                      )}
                      {selectedEmployer.profile?.rejectionReason && (
                        <div className="adm-modal-banner adm-modal-banner-error"><Ban size={14} /><div><strong>Rejection Reason</strong><p>{selectedEmployer.profile.rejectionReason}</p></div></div>
                      )}
                    </div>

                    <div className="adm-modal-actions">
                      {selectedEmployer.profile?.verificationStatus === 'pending' ? (
                        <>
                          <button className="adm-action adm-action-danger" onClick={() => openReject(selectedEmployer)}>Reject</button>
                          <button className="adm-action adm-action-success" onClick={() => openApprove(selectedEmployer)}>Approve</button>
                        </>
                      ) : (
                        <button className="adm-action adm-action-neutral" onClick={closeModal}>Close</button>
                      )}
                    </div>
                  </>
                )}

                {modalMode === 'approve' && (
                  <>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Approve Employer</h3>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>You are about to approve <strong>{selectedEmployer.profile?.companyName}</strong>. They will be able to post jobs.</p>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Notes (Optional)</span>
                      <textarea rows={3} placeholder="Add notes for this approval..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    </label>
                    <div className="adm-modal-actions">
                      <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => setModalMode('details')}>Back</button>
                      <button className="adm-action adm-action-success" disabled={actionLoading} onClick={handleApprove}>
                        {actionLoading && <Loader2 size={14} className="adm-spin" />} Confirm Approval
                      </button>
                    </div>
                  </>
                )}

                {modalMode === 'reject' && (
                  <>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Reject Employer</h3>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary)' }}>You are about to reject <strong>{selectedEmployer.profile?.companyName}</strong>.</p>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rejection Reason *</span>
                      <textarea rows={3} placeholder="Explain why..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Notes (Optional)</span>
                      <textarea rows={2} placeholder="Internal notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    </label>
                    <div className="adm-modal-actions">
                      <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={() => setModalMode('details')}>Back</button>
                      <button className="adm-action adm-action-danger" disabled={actionLoading || !rejectionReason.trim()} onClick={handleReject}>
                        {actionLoading && <Loader2 size={14} className="adm-spin" />} Confirm Rejection
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployerManagement;
