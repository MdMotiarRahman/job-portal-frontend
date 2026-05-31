import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Briefcase,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileText,
  MapPin,
  PlusCircle,
  RefreshCcw,
  Trash2,
  X,
} from 'lucide-react';
import EmployerLayout from './EmployerLayout';
import employerService from '../services/employer.service';
import '../styles/adminDashboard.css';
import '../styles/dashboard.css';

const emptyForm = {
  title: '',
  location: '',
  jobType: 'Full-time',
  experienceLevel: 'Entry',
  status: 'active',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'USD',
  skills: '',
  requirements: '',
  description: '',
};

const applicationStatuses = [
  'Pending',
  'Reviewing',
  'Shortlisted',
  'Interview Scheduled',
  'Accepted',
  'Rejected',
];

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Not listed';

  const currency = salary.currency || 'USD';
  const min = salary.min ? Number(salary.min).toLocaleString() : 'Open';
  const max = salary.max ? Number(salary.max).toLocaleString() : 'Open';
  return `${currency} ${min} - ${max}`;
};

const getApprovalBadge = (job) => {
  if (job.isApproved) return 'admin-badge-success';
  if (job.status === 'closed') return 'admin-badge-status';
  return 'admin-badge-warning';
};

const getApplicationBadge = (status) => {
  const value = String(status || '').toLowerCase();
  if (['accepted', 'shortlisted', 'interview scheduled'].includes(value)) {
    return 'admin-badge-success';
  }
  if (value === 'rejected') return 'admin-badge-error';
  if (value === 'reviewing') return 'admin-badge-status';
  return 'admin-badge-warning';
};

const EmployerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [applicationDrafts, setApplicationDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryData, jobList, applicationList] = await Promise.all([
        employerService.getSummary(),
        employerService.getMyJobs(),
        employerService.getApplications(),
      ]);

      setSummary(summaryData);
      setJobs(jobList);
      setApplications(applicationList);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    return jobs.reduce(
      (jobStats, job) => {
        jobStats.total += 1;
        jobStats.applications += Array.isArray(job.applications) ? job.applications.length : 0;
        if (job.isApproved) jobStats.approved += 1;
        if (!job.isApproved) jobStats.pending += 1;
        if (job.status === 'closed') jobStats.closed += 1;
        return jobStats;
      },
      { total: 0, pending: 0, approved: 0, closed: 0, applications: 0 }
    );
  }, [jobs]);

  const visibleApplications = useMemo(() => {
    if (!selectedJobId) return applications;
    return applications.filter((application) => application.job?._id === selectedJobId);
  }, [applications, selectedJobId]);

  const resetForm = () => {
    setEditingJob(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Entry',
      status: job.status || 'active',
      salaryMin: job.salary?.min ?? '',
      salaryMax: job.salary?.max ?? '',
      salaryCurrency: job.salary?.currency || 'USD',
      skills: (job.skills || []).join(', '),
      requirements: (job.requirements || []).join('\n'),
      description: job.description || '',
    });

    document.getElementById('employer-job-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const buildPayload = () => ({
    ...formData,
    salaryMin: formData.salaryMin === '' ? null : Number(formData.salaryMin),
    salaryMax: formData.salaryMax === '' ? null : Number(formData.salaryMax),
    skills: formData.skills,
    requirements: formData.requirements
      .split('\n')
      .map((requirement) => requirement.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = editingJob
        ? await employerService.updateJob(editingJob._id, buildPayload())
        : await employerService.createJob(buildPayload());

      setMessage(response.message || 'Job saved successfully.');
      resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setSaving(false);
    }
  };

  const runJobAction = async (action, successMessage) => {
    setError('');
    setMessage('');

    try {
      await action();
      setMessage(successMessage);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Job action failed.');
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}" and all applications for this job? This cannot be undone.`
    );
    if (!confirmed) return;

    await runJobAction(() => employerService.deleteJob(job._id), 'Job deleted successfully.');
  };

  const viewJobApplications = (jobId) => {
    setSelectedJobId(jobId);
    document.getElementById('employer-applications')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const getApplicationDraft = (application) => {
    return applicationDrafts[application._id] || {
      status: application.status || 'Pending',
      interviewDate: application.interviewDate || '',
      interviewTime: application.interviewTime || '',
      interviewMode: application.interviewMode || '',
      employerMessage: application.employerMessage || '',
    };
  };

  const updateApplicationDraft = (applicationId, field, value) => {
    setApplicationDrafts((currentDrafts) => ({
      ...currentDrafts,
      [applicationId]: {
        ...currentDrafts[applicationId],
        [field]: value,
      },
    }));
  };

  const saveApplication = async (application) => {
    setError('');
    setMessage('');

    try {
      const draft = getApplicationDraft(application);
      await employerService.updateApplication(application._id, draft);
      setMessage('Application updated successfully.');
      const nextApplications = await employerService.getApplications();
      setApplications(nextApplications);
      setApplicationDrafts((currentDrafts) => {
        const { [application._id]: removedDraft, ...remainingDrafts } = currentDrafts;
        return remainingDrafts;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application.');
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="admin-page admin-loading">Loading employer dashboard...</div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="admin-page employer-admin-page" id="overview">
        <div className="admin-header-card">
          <div className="admin-header">
            <div>
              <p className="admin-subtitle" style={{ marginBottom: 6 }}>Employer workspace</p>
              <h1>Employer Dashboard</h1>
              <p className="admin-subtitle">
                Manage job posts, review applications, and move candidates through your hiring pipeline.
              </p>
            </div>
            <div className="admin-toolbar">
              <span className="admin-badge admin-badge-status">
                {summary?.profile?.verificationStatus || 'pending'}
              </span>
              <button className="admin-refresh-btn" onClick={loadDashboard} type="button">
                <RefreshCcw size={16} strokeWidth={2} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
        {message ? <div className="admin-alert admin-alert-success">{message}</div> : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>
              <Briefcase size={18} /> Total Jobs
            </h3>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <Clock3 size={18} /> Pending Approval
            </h3>
            <p className="admin-stat-value">{stats.pending}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <CheckCircle2 size={18} /> Approved Jobs
            </h3>
            <p className="admin-stat-value">{stats.approved}</p>
          </div>
          <div className="admin-stat-card">
            <h3>
              <FileText size={18} /> Applications
            </h3>
            <p className="admin-stat-value">{stats.applications}</p>
          </div>
        </section>

        <section className="admin-section" id="employer-job-form">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <PlusCircle size={18} />
              {editingJob ? 'Edit Job' : 'Create Job'}
            </h2>
            {editingJob ? (
              <button type="button" className="admin-action-btn admin-action-neutral" onClick={resetForm}>
                <X size={13} />
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form className="admin-form-grid employer-admin-form" onSubmit={handleSubmit}>
            <label className="admin-form-field">
              <span>Job Title</span>
              <input name="title" value={formData.title} onChange={handleChange} required />
            </label>

            <label className="admin-form-field">
              <span>Location</span>
              <input name="location" value={formData.location} onChange={handleChange} required />
            </label>

            <label className="admin-form-field">
              <span>Job Type</span>
              <select name="jobType" value={formData.jobType} onChange={handleChange}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Experience Level</span>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                <option>Entry</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Status</span>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Currency</span>
              <input name="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} />
            </label>

            <label className="admin-form-field">
              <span>Minimum Salary</span>
              <input
                name="salaryMin"
                type="number"
                min="0"
                value={formData.salaryMin}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field">
              <span>Maximum Salary</span>
              <input
                name="salaryMax"
                type="number"
                min="0"
                value={formData.salaryMax}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field admin-form-field-wide">
              <span>Skills (comma separated)</span>
              <input
                name="skills"
                placeholder="React, Node.js, MongoDB"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-form-field admin-form-field-wide">
              <span>Requirements (one per line)</span>
              <textarea
                name="requirements"
                rows="3"
                value={formData.requirements}
                onChange={handleChange}
              />
            </label>

            <label className="admin-form-field admin-form-field-wide">
              <span>Description</span>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>

            <div className="admin-form-actions">
              <button className="admin-primary-btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-section" id="employer-jobs">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <Briefcase size={18} />
              My Jobs
            </h2>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table employer-admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Applications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="7">No jobs yet. Create your first job above.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong>{job.title}</strong>
                        <div className="admin-muted-text">
                          <MapPin size={12} /> {job.location} · Posted {formatDate(job.createdAt)}
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-status">{job.jobType}</span>
                      </td>
                      <td>
                        <BadgeDollarSign size={13} /> {formatSalary(job.salary)}
                      </td>
                      <td>
                        <span className="admin-badge admin-badge-status">{job.status}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${getApprovalBadge(job)}`}>
                          {job.isApproved ? 'Approved' : job.status === 'closed' ? 'Closed' : 'Pending'}
                        </span>
                      </td>
                      <td>{Array.isArray(job.applications) ? job.applications.length : 0}</td>
                      <td className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-action-btn admin-action-neutral"
                          onClick={() => viewJobApplications(job._id)}
                        >
                          <Eye size={13} />
                          Apps
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn admin-action-neutral"
                          onClick={() => openEditJob(job)}
                        >
                          <Edit3 size={13} />
                          Edit
                        </button>
                        {job.status === 'closed' ? (
                          <button
                            type="button"
                            className="admin-action-btn admin-action-success"
                            onClick={() =>
                              runJobAction(
                                () => employerService.reopenJob(job._id),
                                'Job reopened successfully.'
                              )
                            }
                          >
                            Reopen
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn admin-action-warning"
                            onClick={() =>
                              runJobAction(
                                () => employerService.closeJob(job._id),
                                'Job closed successfully.'
                              )
                            }
                          >
                            Close
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-action-btn admin-action-danger"
                          onClick={() => handleDeleteJob(job)}
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
        </section>

        <section className="admin-section" id="employer-applications">
          <div className="admin-section-heading-row">
            <h2 className="admin-section-title">
              <FileText size={18} />
              Applications
            </h2>
            <select
              className="admin-select employer-admin-filter"
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
            >
              <option value="">All jobs</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {visibleApplications.length === 0 ? (
            <div className="admin-empty-state">No applications found for this view.</div>
          ) : (
            <div className="employer-application-grid">
              {visibleApplications.map((application) => {
                const draft = getApplicationDraft(application);
                const isRejected = draft.status === 'Rejected';

                return (
                  <article className="employer-application-card" key={application._id}>
                    <div className="employer-application-head">
                      <div>
                        <h3>{application.seeker?.name || 'Unknown candidate'}</h3>
                        <p>{application.seeker?.email || 'No email available'}</p>
                        <span>
                          {application.job?.title || application.jobTitle} · Applied{' '}
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                      <span className={`admin-badge ${getApplicationBadge(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <p className="employer-cover-letter">
                      <strong>Cover Letter:</strong>{' '}
                      {application.coverLetter || 'No cover letter provided.'}
                    </p>

                    {application.resume ? (
                      <a
                        className="employer-resume-link"
                        href={
                          application.resume.startsWith('http')
                            ? application.resume
                            : `http://localhost:5000/${application.resume.replace(/\\/g, '/')}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Resume
                      </a>
                    ) : (
                      <p className="admin-muted-text">No resume uploaded.</p>
                    )}

                    <div className="employer-application-actions">
                      <label className="admin-form-field">
                        <span>Status</span>
                        <select
                          value={draft.status}
                          onChange={(event) =>
                            updateApplicationDraft(application._id, 'status', event.target.value)
                          }
                        >
                          {applicationStatuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>

                      {!isRejected ? (
                        <>
                          <label className="admin-form-field">
                            <span>Interview Date</span>
                            <input
                              type="date"
                              value={draft.interviewDate}
                              onChange={(event) =>
                                updateApplicationDraft(
                                  application._id,
                                  'interviewDate',
                                  event.target.value
                                )
                              }
                            />
                          </label>

                          <label className="admin-form-field">
                            <span>Interview Time</span>
                            <input
                              type="text"
                              placeholder="10:30 AM"
                              value={draft.interviewTime}
                              onChange={(event) =>
                                updateApplicationDraft(
                                  application._id,
                                  'interviewTime',
                                  event.target.value
                                )
                              }
                            />
                          </label>

                          <label className="admin-form-field">
                            <span>Mode / Location</span>
                            <input
                              type="text"
                              placeholder="Google Meet or office address"
                              value={draft.interviewMode}
                              onChange={(event) =>
                                updateApplicationDraft(
                                  application._id,
                                  'interviewMode',
                                  event.target.value
                                )
                              }
                            />
                          </label>
                        </>
                      ) : null}

                      <label className="admin-form-field employer-message-field">
                        <span>Message to Candidate</span>
                        <textarea
                          rows="3"
                          value={draft.employerMessage}
                          placeholder={
                            isRejected
                              ? 'Optional rejection note'
                              : 'Share interview details or next steps'
                          }
                          onChange={(event) =>
                            updateApplicationDraft(
                              application._id,
                              'employerMessage',
                              event.target.value
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="employer-application-footer">
                      <button
                        type="button"
                        className="admin-primary-btn"
                        onClick={() => saveApplication(application)}
                      >
                        Save Application
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
