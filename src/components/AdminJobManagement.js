import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase, CheckCircle2, Clock, Loader2, Search, X, Ban, Eye,
  MapPin, Building2, DollarSign, Lock, PauseCircle, Edit3, Trash2,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import UserAvatar from './UserAvatar';
import {
  approveJob, closeJob, deleteJob, getJobs, rejectJob, reopenJob,
} from '../services/adminService';
import '../styles/adminModule.css';

const formatDate = (v) => {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Not listed';
  const c = salary.currency || 'USD';
  const min = salary.min ? Number(salary.min).toLocaleString() : 'Open';
  const max = salary.max ? Number(salary.max).toLocaleString() : 'Open';
  return `${c} ${min} – ${max}`;
};

const AdminJobManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: pagination.page, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (currentTab === 'pending') { params.isApproved = false; }
      else if (currentTab === 'approved') { params.isApproved = true; }
      else if (currentTab === 'rejected') { params.status = 'inactive'; params.isApproved = false; }
      else if (currentTab === 'inactive') { params.status = 'inactive'; }
      else if (currentTab === 'closed') { params.status = 'closed'; }

      const res = await getJobs(params);
      setJobs(res.data.jobs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) { setError(err.response?.data?.message || 'Failed to load jobs.'); }
    finally { setLoading(false); }
  }, [pagination.page, searchTerm, currentTab]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const openDetails = (job) => { setSelectedJob(job); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setSelectedJob(null); setActionLoading(false); };

  const runAction = async (fn) => {
    setError(''); setSuccess(''); setActionLoading(true);
    try { await fn(); await loadJobs(); }
    catch (err) { setError(err.response?.data?.message || 'Action failed.'); }
    finally { setActionLoading(false); closeModal(); }
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', icon: Briefcase },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'rejected', label: 'Rejected', icon: Ban },
    { id: 'inactive', label: 'Inactive', icon: PauseCircle },
    { id: 'closed', label: 'Closed', icon: Lock },
  ];

  return (
    <AdminLayout>
      <div className="admin-page adm-mod">
        <div className="adm-mod-header">
          <div className="adm-mod-header-text">
            <h1>Job Management</h1>
            <p>Review job postings, manage approvals, and keep the board accurate.</p>
          </div>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        {success && <div className="admin-alert admin-alert-success">{success}</div>}

        <div className="adm-mod-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`adm-mod-tab ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => { setPagination(p => ({ ...p, page: 1 })); navigate(`/admin/jobs/${tab.id}`); }}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="adm-mod-card">
          <div className="adm-mod-toolbar">
            <div className="adm-mod-search">
              <Search size={15} />
              <input type="text" placeholder="Search title, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="adm-mod-empty"><Loader2 size={28} className="adm-spin" /><p>Loading jobs...</p></div>
          ) : jobs.length === 0 ? (
            <div className="adm-mod-empty"><Briefcase size={36} /><p>No jobs found</p><span>Try adjusting your search or filters.</span></div>
          ) : (
            <div className="adm-mod-table-wrap">
              <table className="adm-mod-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Employer</th>
                    <th>Type</th>
                    <th>Approval</th>
                    <th>Salary</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <p className="adm-mod-cell-main">{job.title}</p>
                        <p className="adm-mod-cell-sub"><MapPin size={11} style={{ display: 'inline', verticalAlign: -1 }} /> {job.location || 'Remote'}</p>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserAvatar user={job.company} size={28} />
                          <div>
                            <p className="adm-mod-cell-main">{job.company?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="adm-badge adm-badge-info">{job.jobType}</span></td>
                      <td>
                        <span className={`adm-badge ${job.isApproved ? 'adm-badge-success' : 'adm-badge-warning'}`}>
                          {job.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="adm-mod-date">{formatSalary(job.salary)}</td>
                      <td><button className="adm-mod-view-btn" onClick={() => openDetails(job)}><Eye size={14} /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="adm-mod-pagination">
              <span>Page {pagination.page} of {pagination.pages} · {pagination.total} jobs</span>
              <div className="adm-mod-pagination-btns">
                <button disabled={pagination.page <= 1 || loading} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
                <button disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedJob && (
          <div className="adm-modal-backdrop" onClick={closeModal}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <button className="adm-modal-close" onClick={closeModal}><X size={18} /></button>
              <div className="adm-modal-header">
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2>{selectedJob.title}</h2>
                  <p>{selectedJob.location || 'Remote'}</p>
                </div>
              </div>

              <div className="adm-modal-body">
                <div className="adm-modal-status-row">
                  <span className={`adm-badge ${selectedJob.isApproved ? 'adm-badge-success' : 'adm-badge-warning'}`}>{selectedJob.isApproved ? 'Approved' : 'Pending'}</span>
                  <span className="adm-badge adm-badge-info">{selectedJob.jobType}</span>
                  <span className="adm-badge adm-badge-neutral">{selectedJob.status}</span>
                </div>

                <div className="adm-modal-info">
                  <div className="adm-modal-info-item"><Building2 size={14} /><div><span>Employer</span><strong>{selectedJob.company?.name || 'N/A'}</strong></div></div>
                  <div className="adm-modal-info-item"><DollarSign size={14} /><div><span>Salary</span><strong>{formatSalary(selectedJob.salary)}</strong></div></div>
                  <div className="adm-modal-info-item"><MapPin size={14} /><div><span>Location</span><strong>{selectedJob.location || 'Remote'}</strong></div></div>
                  <div className="adm-modal-info-item"><Clock size={14} /><div><span>Experience</span><strong>{selectedJob.experienceLevel || '—'}</strong></div></div>
                  {selectedJob.skills?.length > 0 && (
                    <div className="adm-modal-wide"><span>Skills</span><p>{selectedJob.skills.join(', ')}</p></div>
                  )}
                  {selectedJob.description && (
                    <div className="adm-modal-wide"><span>Description</span><p>{selectedJob.description}</p></div>
                  )}
                </div>

                <div className="adm-modal-actions">
                  {!selectedJob.isApproved && (
                    <button className="adm-action adm-action-success" disabled={actionLoading}
                      onClick={() => runAction(() => approveJob(selectedJob._id, ''))}>Approve</button>
                  )}
                  <button className="adm-action adm-action-warning" disabled={actionLoading}
                    onClick={() => { const r = window.prompt('Rejection reason'); if (r) runAction(() => rejectJob(selectedJob._id, r)); }}>Reject</button>
                  {selectedJob.status === 'closed' ? (
                    <button className="adm-action adm-action-success" disabled={actionLoading}
                      onClick={() => runAction(() => reopenJob(selectedJob._id))}>Reopen</button>
                  ) : (
                    <button className="adm-action adm-action-danger" disabled={actionLoading}
                      onClick={() => runAction(() => closeJob(selectedJob._id))}>Close</button>
                  )}
                </div>

                <div className="adm-modal-danger">
                  <button className="adm-action adm-action-danger" disabled={actionLoading}
                    onClick={() => { if (window.confirm('Delete permanently?')) runAction(() => deleteJob(selectedJob._id)); }}>
                    <Trash2 size={14} /> Delete Job
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

export default AdminJobManagement;
