import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText, CheckCircle2, Clock, Loader2, Search, X, Ban, Eye,
  Briefcase, User, File, Download,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import { getApplications, updateApplicationStatus } from '../services/adminService';
import '../styles/adminModule.css';

const formatDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AdminApplicationManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pagination.page, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (currentTab === 'pending') params.status = 'pending';
      else if (currentTab === 'reviewed') params.status = 'reviewed';
      else if (currentTab === 'shortlisted') params.status = 'shortlisted';
      else if (currentTab === 'rejected') params.status = 'rejected';

      const res = await getApplications(params);
      setApplications(res.data.applications || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) { setError(err.response?.data?.message || 'Failed to load applications.'); }
    finally { setLoading(false); }
  }, [pagination.page, searchTerm, currentTab]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const openDetails = (app) => { setSelectedApp(app); setShowModal(true); setNewStatus(app.status); setRejectionReason(''); };
  const closeModal = () => { setShowModal(false); setSelectedApp(null); setActionLoading(false); };

  const handleStatusUpdate = async () => {
    if (!selectedApp || !newStatus) return;
    setActionLoading(true);
    setError(''); setSuccess('');
    try {
      const payload = { status: newStatus };
      if (newStatus === 'rejected') payload.rejectionReason = rejectionReason;
      await updateApplicationStatus(selectedApp._id, payload);
      setSuccess(`Application status updated to ${newStatus}.`);
      closeModal();
      await loadApplications();
    } catch (err) { setError(err.response?.data?.message || 'Failed to update.'); }
    finally { setActionLoading(false); }
  };

  const statusBadge = (s) => {
    if (s === 'shortlisted' || s === 'accepted') return 'adm-badge-success';
    if (s === 'rejected') return 'adm-badge-error';
    if (s === 'reviewed') return 'adm-badge-info';
    return 'adm-badge-warning';
  };

  const tabs = [
    { id: 'all', label: 'All Applications', icon: FileText },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'reviewed', label: 'Reviewed', icon: CheckCircle2 },
    { id: 'shortlisted', label: 'Shortlisted', icon: Briefcase },
    { id: 'rejected', label: 'Rejected', icon: Ban },
  ];

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <h1>Application Management</h1>
            <p>Review job applications, update statuses, and manage candidate pipeline.</p>
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div className="admin-alert admin-alert-success">{success}</div>}

        <div className="adm-mod-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`adm-mod-tab ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => { setPagination(p => ({ ...p, page: 1 })); navigate(`/admin/applications/${tab.id}`); }}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="adm-mod-card">
          <div className="adm-mod-toolbar">
            <div className="adm-mod-search">
              <Search size={15} />
              <input type="text" placeholder="Search applicant, job..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading applications...</p></div>
          ) : applications.length === 0 ? (
            <div className="adm-mod-empty"><FileText size={36} /><p>No applications found</p><span>Try adjusting your search or filters.</span></div>
          ) : (
            <div className="adm-mod-table-wrap">
              <table className="adm-mod-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <UserAvatar user={app.seeker || app.user} size={36} />
                          <div>
                            <p className="adm-mod-cell-main">{app.seeker?.name || app.user?.name || 'N/A'}</p>
                            <p className="adm-mod-cell-sub">{app.seeker?.email || app.user?.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="adm-mod-cell-main">{app.job?.title || 'N/A'}</p>
                        <p className="adm-mod-cell-sub">{app.job?.company?.name || '—'}</p>
                      </td>
                      <td><span className={`adm-badge ${statusBadge(app.status)}`}>{app.status}</span></td>
                      <td className="adm-mod-date">{formatDate(app.createdAt)}</td>
                      <td><button className="adm-mod-view-btn" onClick={() => openDetails(app)}><Eye size={14} /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="adm-mod-pagination">
              <span>Page {pagination.page} of {pagination.pages} · {pagination.total} applications</span>
              <div className="adm-mod-pagination-btns">
                <button disabled={pagination.page <= 1 || loading} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
                <button disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedApp && (
          <div className="adm-modal-backdrop" onClick={closeModal}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <button className="adm-modal-close" onClick={closeModal}><X size={18} /></button>
              <div className="adm-modal-header">
                <UserAvatar user={selectedApp.seeker || selectedApp.user} size={52} />
                <div>
                  <h2>{selectedApp.seeker?.name || selectedApp.user?.name || 'Candidate'}</h2>
                  <p>{selectedApp.job?.title || 'Job'}</p>
                </div>
              </div>

              <div className="adm-modal-body">
                <div className="adm-modal-status-row">
                  <span className={`adm-badge ${statusBadge(selectedApp.status)}`}>{selectedApp.status}</span>
                </div>

                <div className="adm-modal-info">
                  <div className="adm-modal-info-item"><User size={14} /><div><span>Candidate</span><strong>{selectedApp.seeker?.name || selectedApp.user?.name || '—'}</strong></div></div>
                  <div className="adm-modal-info-item"><Briefcase size={14} /><div><span>Job</span><strong>{selectedApp.job?.title || '—'}</strong></div></div>
                  <div className="adm-modal-info-item"><FileText size={14} /><div><span>Applied</span><strong>{formatDate(selectedApp.createdAt)}</strong></div></div>
                  {selectedApp.coverLetter && (
                    <div className="adm-modal-wide"><span>Cover Letter</span><p style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.coverLetter}</p></div>
                  )}
                  {selectedApp.resume?.url && (
                    <div className="adm-modal-info-item"><File size={14} /><div><span>Resume</span><strong><a href={selectedApp.resume.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)' }}>Download Resume</a></strong></div></div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14, marginTop: 4 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Update Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {newStatus === 'rejected' && (
                    <textarea placeholder="Rejection reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', marginTop: 8, boxSizing: 'border-box' }} rows={3} />
                  )}
                </div>

                <div className="adm-modal-actions" style={{ marginTop: 14 }}>
                  <button className="adm-action adm-action-neutral" disabled={actionLoading} onClick={closeModal}>Cancel</button>
                  <button className="adm-action adm-action-success" disabled={actionLoading || newStatus === selectedApp.status} onClick={handleStatusUpdate}>
                    {actionLoading && <Loader2 size={14} className="adm-spin" />} Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationManagement;
