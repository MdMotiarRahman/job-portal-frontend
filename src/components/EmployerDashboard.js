import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
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
import employerService from '../services/employer.service';
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

const getApprovalClass = (job) => {
  if (job.isApproved) return 'status-pill status-approved';
  if (job.status === 'closed') return 'status-pill status-neutral';
  return 'status-pill status-pending';
};

const getApplicationStatusClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (['accepted', 'shortlisted', 'interview scheduled'].includes(value)) {
    return 'status-pill status-approved';
  }
  if (value === 'rejected') return 'status-pill status-rejected';
  if (value === 'reviewing') return 'status-pill status-neutral';
  return 'status-pill status-pending';
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

  return (
    <div className="dashboard-page employer-dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div className="hero-card employer-hero-card">
            <div className="hero-badge">
              <Briefcase size={16} />
              Employer Workspace
            </div>
            <h1 className="hero-title">Run hiring from one calm cockpit.</h1>
            <p className="hero-subtitle">
              Create and manage job posts, track approval status, and move candidates through
              review without leaving your dashboard.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="hero-action primary"
                onClick={() =>
                  document.getElementById('employer-job-form')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
              >
                <PlusCircle size={18} />
                Create Job
              </button>
              <button type="button" className="hero-action secondary" onClick={loadDashboard}>
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>

            {summary?.profile ? (
              <div className="employer-verification-strip">
                <Building2 size={18} />
                <span>
                  Verification status:{' '}
                  <strong>{summary.profile.verificationStatus || 'pending'}</strong>
                </span>
              </div>
            ) : null}
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">
                <Briefcase size={16} />
                Total Jobs
              </div>
              <div className="summary-value">{stats.total}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">
                <Clock3 size={16} />
                Pending Approval
              </div>
              <div className="summary-value">{stats.pending}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">
                <CheckCircle2 size={16} />
                Approved
              </div>
              <div className="summary-value">{stats.approved}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">
                <FileText size={16} />
                Applications
              </div>
              <div className="summary-value">{stats.applications}</div>
            </div>
          </div>
        </div>

        {error ? <div className="dashboard-alert dashboard-alert-error">{error}</div> : null}
        {message ? <div className="dashboard-alert dashboard-alert-success">{message}</div> : null}

        <section className="panel-card" id="employer-job-form">
          <div className="section-head">
            <h2 className="section-title">{editingJob ? 'Edit Job' : 'Create Job'}</h2>
            {editingJob ? (
              <button type="button" className="section-action" onClick={resetForm}>
                <X size={16} />
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="dashboard-field">
                <span>Job Title</span>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="dashboard-field">
                <span>Location</span>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="dashboard-field">
                <span>Job Type</span>
                <select
                  name="jobType"
                  className="form-select"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>

              <label className="dashboard-field">
                <span>Experience Level</span>
                <select
                  name="experienceLevel"
                  className="form-select"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                </select>
              </label>

              <label className="dashboard-field">
                <span>Status</span>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label className="dashboard-field">
                <span>Currency</span>
                <input
                  type="text"
                  name="salaryCurrency"
                  className="form-control"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                />
              </label>

              <label className="dashboard-field">
                <span>Minimum Salary</span>
                <input
                  type="number"
                  min="0"
                  name="salaryMin"
                  className="form-control"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </label>

              <label className="dashboard-field">
                <span>Maximum Salary</span>
                <input
                  type="number"
                  min="0"
                  name="salaryMax"
                  className="form-control"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </label>

              <label className="dashboard-field full">
                <span>Skills (comma separated)</span>
                <input
                  type="text"
                  name="skills"
                  className="form-control"
                  placeholder="React, Node.js, MongoDB"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="dashboard-field full">
                <span>Requirements (one per line)</span>
                <textarea
                  name="requirements"
                  className="form-control"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </label>

              <label className="dashboard-field full">
                <span>Description</span>
                <textarea
                  name="description"
                  className="form-control"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="dashboard-form-actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
              </button>
              {editingJob ? (
                <span className="muted-text">
                  Editing a job sends it back to admin approval before it appears publicly.
                </span>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel-card">
          <div className="section-head">
            <h2 className="section-title">My Jobs</h2>
            <button type="button" className="section-action" onClick={loadDashboard}>
              <RefreshCcw size={16} />
              Reload
            </button>
          </div>

          {loading ? (
            <div className="loading-row">Loading dashboard...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">No jobs yet. Create your first job above.</div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <article key={job._id} className="job-card">
                  <div className="job-top">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-company">{job.company?.name || summary?.user?.name}</div>
                    </div>
                    <span className={getApprovalClass(job)}>
                      {job.isApproved ? 'Approved' : job.status === 'closed' ? 'Closed' : 'Pending'}
                    </span>
                  </div>

                  <div className="job-meta">
                    <span>
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span>
                      <Briefcase size={14} />
                      {job.jobType}
                    </span>
                    <span>
                      <BadgeDollarSign size={14} />
                      {formatSalary(job.salary)}
                    </span>
                  </div>

                  <p className="muted-text job-description">{job.description}</p>

                  {job.skills?.length ? (
                    <div className="chip-list">
                      {job.skills.slice(0, 5).map((skill) => (
                        <span className="chip" key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="card-divider" />

                  <div className="job-footer">
                    <small className="muted-text">Posted {formatDate(job.createdAt)}</small>
                    <small className="muted-text">
                      {Array.isArray(job.applications) ? job.applications.length : 0} applications
                    </small>
                  </div>

                  <div className="job-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => viewJobApplications(job._id)}
                    >
                      <Eye size={15} />
                      Applicants
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => openEditJob(job)}>
                      <Edit3 size={15} />
                      Edit
                    </button>
                    {job.status === 'closed' ? (
                      <button
                        type="button"
                        className="secondary-btn"
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
                        className="secondary-btn"
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
                      className="danger-btn"
                      onClick={() => handleDeleteJob(job)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel-card" id="employer-applications">
          <div className="section-head">
            <h2 className="section-title">Applications</h2>
            <select
              className="form-select employer-filter-select"
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
            <div className="empty-state">No applications found for this view.</div>
          ) : (
            <div className="application-list">
              {visibleApplications.map((application) => {
                const draft = getApplicationDraft(application);
                const isRejected = draft.status === 'Rejected';

                return (
                  <article className="applicant-card" key={application._id}>
                    <div className="applicant-head">
                      <div>
                        <h4 className="applicant-name">
                          {application.seeker?.name || 'Unknown candidate'}
                        </h4>
                        <div className="applicant-email">{application.seeker?.email}</div>
                        <div className="muted-text">
                          Applied for {application.job?.title || application.jobTitle} on{' '}
                          {formatDate(application.createdAt)}
                        </div>
                      </div>
                      <span className={getApplicationStatusClass(application.status)}>
                        {application.status}
                      </span>
                    </div>

                    <div className="card-divider" />

                    <p className="muted-text">
                      <strong>Cover Letter:</strong>{' '}
                      {application.coverLetter || 'No cover letter provided.'}
                    </p>

                    {application.resume ? (
                      <a
                        className="resume-link"
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
                      <p className="muted-text">No resume uploaded.</p>
                    )}

                    <div className="application-action-grid">
                      <label className="dashboard-field">
                        <span>Status</span>
                        <select
                          className="form-select"
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
                          <label className="dashboard-field">
                            <span>Interview Date</span>
                            <input
                              type="date"
                              className="form-control"
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

                          <label className="dashboard-field">
                            <span>Interview Time</span>
                            <input
                              type="text"
                              className="form-control"
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

                          <label className="dashboard-field">
                            <span>Mode / Location</span>
                            <input
                              type="text"
                              className="form-control"
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

                      <label className="dashboard-field application-message-field">
                        <span>Message to Candidate</span>
                        <textarea
                          className="form-control"
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

                    <div className="dashboard-form-actions">
                      <button
                        type="button"
                        className="primary-btn"
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
    </div>
  );
};

export default EmployerDashboard;
