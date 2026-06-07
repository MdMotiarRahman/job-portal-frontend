import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase, Edit3, Plus, RefreshCw, Search, Trash2, X, Clock, CheckCircle2, Ban, Lock, PauseCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import {
  approveJob,
  closeJob,
  createJob,
  deleteJob,
  getJobs,
  getUsers,
  rejectJob,
  reopenJob,
  updateJob,
} from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/adminJobManagement.css';

const emptyForm = {
  title: '',
  company: '',
  location: '',
  jobType: 'Full-time',
  experienceLevel: 'Entry',
  status: 'active',
  isApproved: false,
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'USD',
  skills: '',
  requirements: '',
  description: '',
  approvalNotes: '',
};

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) {
    return 'Not listed';
  }

  const currency = salary.currency || 'USD';
  const min = salary.min ? Number(salary.min).toLocaleString() : 'Open';
  const max = salary.max ? Number(salary.max).toLocaleString() : 'Open';
  return `${currency} ${min} - ${max}`;
};

const AdminJobManagement = () => {
  const navigate = useNavigate();
  const { filter } = useParams();
  const currentTab = filter || 'all';

  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const queryParams = useMemo(() => {
    const params = {
      page: pagination.page,
      limit: 10,
    };

    if (searchTerm.trim()) params.search = searchTerm.trim();

    if (currentTab === 'pending') {
      params.isApproved = false;
    } else if (currentTab === 'approved') {
      params.isApproved = true;
    } else if (currentTab === 'rejected') {
      params.status = 'inactive';
      params.isApproved = false;
    } else if (currentTab === 'inactive') {
      params.status = 'inactive';
    } else if (currentTab === 'closed') {
      params.status = 'closed';
    }

    return params;
  }, [currentTab, pagination.page, searchTerm]);

  const loadEmployers = useCallback(async () => {
    const response = await getUsers({ role: 'employer', limit: 100, page: 1 });
    setEmployers(response.data.users || []);
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getJobs(queryParams);
      setJobs(response.data.jobs || []);
      setPagination(response.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadEmployers().catch((err) => {
      setError(err.response?.data?.message || 'Failed to load employers.');
    });
  }, [loadEmployers]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const stats = useMemo(() => {
    return jobs.reduce(
      (summary, job) => {
        summary.total += 1;
        if (job.isApproved) summary.approved += 1;
        if (!job.isApproved) summary.pending += 1;
        if (job.status === 'closed') summary.closed += 1;
        return summary;
      },
      { total: 0, approved: 0, pending: 0, closed: 0 }
    );
  }, [jobs]);

  const resetForm = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setEditingJob(null);
    setForm({
      ...emptyForm,
      company: employers[0]?._id || '',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title || '',
      company: job.company?._id || job.company || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Entry',
      status: job.status || 'active',
      isApproved: Boolean(job.isApproved),
      salaryMin: job.salary?.min ?? '',
      salaryMax: job.salary?.max ?? '',
      salaryCurrency: job.salary?.currency || 'USD',
      skills: (job.skills || []).join(', '),
      requirements: (job.requirements || []).join('\n'),
      description: job.description || '',
      approvalNotes: job.approvalNotes || '',
    });
    setIsFormOpen(true);
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPagination((currentPagination) => ({ ...currentPagination, page: 1 }));
    loadJobs();
  };

  const buildPayload = () => ({
    ...form,
    salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
    skills: form.skills,
    requirements: form.requirements
      .split('\n')
      .map((requirement) => requirement.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingJob) {
        await updateJob(editingJob._id, buildPayload());
        setSuccess('Job updated successfully.');
      } else {
        await createJob(buildPayload());
        setSuccess('Job created successfully.');
      }

      resetForm();
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action) => {
    setError('');
    setSuccess('');
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || 'Job action failed.');
    }
  };

  const handleApprove = async (jobId) => {
    const notes = window.prompt('Approval notes (optional)') || '';
    await approveJob(jobId, notes);
    setSuccess('Job approved successfully.');
    await loadJobs();
  };

  const handleReject = async (jobId) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;

    await rejectJob(jobId, reason);
    setSuccess('Job rejected successfully.');
    await loadJobs();
  };

  const handleClose = async (jobId) => {
    await closeJob(jobId);
    setSuccess('Job closed successfully.');
    await loadJobs();
  };

  const handleReopen = async (jobId) => {
    await reopenJob(jobId);
    setSuccess('Job reopened successfully.');
    await loadJobs();
  };

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm('Delete this job permanently? This cannot be undone.');
    if (!confirmed) return;

    await deleteJob(jobId);
    setSuccess('Job deleted successfully.');
    await loadJobs();
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', icon: <Briefcase size={16} /> },
    { id: 'pending', label: 'Pending Approval', icon: <Clock size={16} /> },
    { id: 'approved', label: 'Approved', icon: <CheckCircle2 size={16} /> },
    { id: 'rejected', label: 'Rejected', icon: <Ban size={16} /> },
    { id: 'inactive', label: 'Inactive', icon: <PauseCircle size={16} /> },
    { id: 'closed', label: 'Closed', icon: <Lock size={16} /> },
  ];

  return (
    <AdminLayout>
      <div className="admin-page admin-job-management">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <p className="admin-subtitle" style={{ marginBottom: 6 }}>Job management</p>
              <h1>Jobs</h1>
              <p className="admin-subtitle">
                Review job postings, manage approvals, and keep the public board accurate.
              </p>
            </div>
            <div className="admin-toolbar">
              <button className="admin-refresh-btn" onClick={loadJobs} type="button">
                <RefreshCw size={16} strokeWidth={2} />
                Refresh
              </button>
              <button className="admin-primary-btn" onClick={openCreateForm} type="button">
                <Plus size={16} strokeWidth={2} />
                Add Job
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
        {success ? <div className="admin-alert admin-alert-success">{success}</div> : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>Loaded Jobs</h3>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Approved</h3>
            <p className="admin-stat-value">{stats.approved}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Pending</h3>
            <p className="admin-stat-value">{stats.pending}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Closed</h3>
            <p className="admin-stat-value">{stats.closed}</p>
          </div>
        </section>

        {isFormOpen ? (
          <section className="admin-section">
            <div className="admin-section-heading-row">
              <h2 className="admin-section-title">
                <Briefcase size={18} />
                {editingJob ? 'Edit Job' : 'Create Job'}
              </h2>
              <button
                className="admin-icon-btn admin-job-close-btn"
                onClick={resetForm}
                aria-label="Close job form"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form className="admin-form-grid" onSubmit={handleSubmit}>
              <label className="admin-form-field">
                <span>Job Title</span>
                <input name="title" value={form.title} onChange={handleFieldChange} required />
              </label>

              <label className="admin-form-field">
                <span>Employer</span>
                <select name="company" value={form.company} onChange={handleFieldChange} required>
                  <option value="">Select employer</option>
                  {employers.map((employer) => (
                    <option key={employer._id} value={employer._id}>
                      {employer.name} ({employer.email})
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-form-field">
                <span>Location</span>
                <input name="location" value={form.location} onChange={handleFieldChange} required />
              </label>

              <label className="admin-form-field">
                <span>Job Type</span>
                <select name="jobType" value={form.jobType} onChange={handleFieldChange}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>

              <label className="admin-form-field">
                <span>Experience</span>
                <select name="experienceLevel" value={form.experienceLevel} onChange={handleFieldChange}>
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                </select>
              </label>

              <label className="admin-form-field">
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleFieldChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label className="admin-form-field">
                <span>Minimum Salary</span>
                <input name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={handleFieldChange} />
              </label>

              <label className="admin-form-field">
                <span>Maximum Salary</span>
                <input name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={handleFieldChange} />
              </label>

              <label className="admin-form-field">
                <span>Currency</span>
                <input name="salaryCurrency" value={form.salaryCurrency} onChange={handleFieldChange} />
              </label>

              <label className="admin-form-field admin-form-field-wide">
                <span>Skills (comma separated)</span>
                <input name="skills" value={form.skills} onChange={handleFieldChange} required />
              </label>

              <label className="admin-form-field admin-form-field-wide">
                <span>Requirements (one per line)</span>
                <textarea name="requirements" value={form.requirements} onChange={handleFieldChange} rows="3" />
              </label>

              <label className="admin-form-field admin-form-field-wide">
                <span>Description</span>
                <textarea name="description" value={form.description} onChange={handleFieldChange} rows="4" required />
              </label>

              <label className="admin-checkbox-field">
                <input name="isApproved" type="checkbox" checked={form.isApproved} onChange={handleFieldChange} />
                <span>Approve this job</span>
              </label>

              <label className="admin-form-field admin-form-field-wide">
                <span>Approval Notes</span>
                <textarea name="approvalNotes" value={form.approvalNotes} onChange={handleFieldChange} rows="2" />
              </label>

              <div className="admin-form-actions">
                <button className="admin-action-btn admin-action-neutral" type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button className="admin-primary-btn" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setPagination((curr) => ({ ...curr, page: 1 }));
                navigate(`/admin/jobs/${tab.id}`);
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
              <Briefcase size={18} />
              {tabs.find((t) => t.id === currentTab)?.label || 'All Jobs'}
            </h2>
            <form className="admin-filter-row" onSubmit={handleSearchSubmit}>
              <div className="admin-search-field">
                <Search size={16} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title, location, description"
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
                  <th>Job</th>
                  <th>Employer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading jobs...</td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="7">No jobs found.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong>{job.title}</strong>
                        <div className="admin-muted-text">{job.location}</div>
                      </td>
                      <td>
                        {job.company?.name || 'N/A'}
                        <div className="admin-muted-text">{job.company?.email || ''}</div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-status">{job.jobType}</span>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-status">{job.status}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${job.isApproved ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                          {job.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>{formatSalary(job.salary)}</td>
                      <td className="admin-actions-cell">
                        <button type="button" className="admin-action-btn admin-action-neutral" onClick={() => openEditForm(job)}>
                          <Edit3 size={13} />
                          Edit
                        </button>
                        {!job.isApproved ? (
                          <button
                            type="button"
                            className="admin-action-btn admin-action-success"
                            onClick={() => runAction(() => handleApprove(job._id))}
                          >
                            Approve
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="admin-action-btn admin-action-warning"
                          onClick={() => runAction(() => handleReject(job._id))}
                        >
                          Reject
                        </button>
                        {job.status === 'closed' ? (
                          <button
                            type="button"
                            className="admin-action-btn admin-action-success"
                            onClick={() => runAction(() => handleReopen(job._id))}
                          >
                            Reopen
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn admin-action-danger"
                            onClick={() => runAction(() => handleClose(job._id))}
                          >
                            Close
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-action-btn admin-action-danger"
                          onClick={() => runAction(() => handleDelete(job._id))}
                        >
                          <Trash2 size={13} />
                          Delete
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
              Page {pagination.page} of {pagination.pages || 1} · {pagination.total} total jobs
            </span>
            <div className="admin-pagination-actions">
              <button
                type="button"
                className="admin-action-btn admin-action-neutral"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((currentPagination) => ({ ...currentPagination, page: currentPagination.page - 1 }))}
              >
                Previous
              </button>
              <button
                type="button"
                className="admin-action-btn admin-action-neutral"
                disabled={pagination.page >= pagination.pages}
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

export default AdminJobManagement;
