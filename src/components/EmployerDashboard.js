import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmployerLayout from './EmployerLayout';
import employerService from '../services/employer.service';
import ReminderWidget from './ReminderWidget';
import '../styles/employerDashboard.css';
import '../styles/dashboard.css';
import { getFileUrl } from "../utils/fileUrl";

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'];
const STATUSES = ['Open', 'Closed', 'Draft', 'Pending Approval'];
const VALID_STATUSES = ['Pending', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'];
const VALID_JOB_STATUSES = ['Active', 'Closed'];

const EmployerDashboard = ({ page = 'overview' }) => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [activeTab, setActiveTab] = useState(page);

  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState({ summary: true, jobs: true, applications: true });
  const [error, setError] = useState(null);

  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '', location: '', jobType: 'Full-time', experienceLevel: 'Mid Level',
    salaryMin: '', salaryMax: '', description: '', requirements: '', skills: '',
    applicationDeadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [jobsSearch, setJobsSearch] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    try {
      const data = await employerService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    try {
      const data = await employerService.getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(prev => ({ ...prev, applications: true }));
    try {
      const data = await employerService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, applications: false }));
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadJobs();
    loadApplications();
  }, [loadSummary, loadJobs, loadApplications]);

  useEffect(() => {
    setActiveTab(page);
  }, [page]);

  useEffect(() => {
    if (page === 'edit-job' && jobId) {
      const loadJobForEdit = async () => {
        try {
          const data = await employerService.getMyJobs();
          const job = data.find(j => j._id === jobId);
          if (job) {
            setEditingJob(job);
            setFormData({
              title: job.title || '',
              location: job.location || '',
              jobType: job.jobType || 'Full-time',
              experienceLevel: job.experienceLevel || 'Mid Level',
              salaryMin: job.salary?.min?.toString() || '',
              salaryMax: job.salary?.max?.toString() || '',
              description: job.description || '',
              requirements: job.requirements || '',
              skills: job.skills?.join(', ') || '',
              applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
            });
          } else {
            navigate('/employer/jobs');
          }
        } catch (err) {
          console.error('Failed to load job for editing:', err);
          navigate('/employer/jobs');
        }
      };
      loadJobForEdit();
    } else if (page === 'new-job') {
      setEditingJob(null);
      setFormData({
        title: '', location: '', jobType: 'Full-time', experienceLevel: 'Mid Level',
        salaryMin: '', salaryMax: '', description: '', requirements: '', skills: '',
        applicationDeadline: ''
      });
      setFormErrors({});
    }
  }, [page, jobId, navigate]);

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        location: editingJob.location || '',
        jobType: editingJob.jobType || 'Full-time',
        experienceLevel: editingJob.experienceLevel || 'Mid Level',
        salaryMin: editingJob.salary?.min?.toString() || '',
        salaryMax: editingJob.salary?.max?.toString() || '',
        description: editingJob.description || '',
        requirements: editingJob.requirements || '',
        skills: editingJob.skills?.join(', ') || '',
        applicationDeadline: editingJob.applicationDeadline
          ? new Date(editingJob.applicationDeadline).toISOString().split('T')[0] : ''
      });
    }
  }, [editingJob]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
      errors.salary = 'Minimum salary cannot exceed maximum';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveJob = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const jobData = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      if (editingJob) {
        await employerService.updateJob(editingJob._id, jobData);
      } else {
        await employerService.createJob(jobData);
      }
      await loadJobs();
      await loadSummary();
      navigate('/employer/jobs');
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to save job' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Close this job?')) return;
    try {
      await employerService.updateJob(jobId, { status: 'Closed' });
      await loadJobs();
      await loadSummary();
    } catch (err) {
      alert('Failed to close job.');
    }
  };

  const handleReopenJob = async (jobId) => {
    try {
      await employerService.updateJob(jobId, { status: 'Active' });
      await loadJobs();
      await loadSummary();
    } catch (err) {
      alert('Failed to reopen job.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Permanently delete this job?')) return;
    try {
      await employerService.deleteJob(jobId);
      await loadJobs();
      await loadSummary();
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await employerService.updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchJob = selectedJob === 'all' || app.job?._id === selectedJob;
      const matchStatus = selectedStatus === 'all' || app.status === selectedStatus;
      return matchJob && matchStatus;
    });
  }, [applications, selectedJob, selectedStatus]);

  const filteredJobs = useMemo(() => {
    if (!jobsSearch.trim()) return jobs;
    const q = jobsSearch.toLowerCase();
    return jobs.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q)
    );
  }, [jobs, jobsSearch]);

  const uniqueJobsForFilter = useMemo(() => {
    const map = new Map();
    applications.forEach(a => {
      if (a.job && !map.has(a.job._id)) map.set(a.job._id, a.job);
    });
    return Array.from(map.values());
  }, [applications]);

  const allStatuses = useMemo(() => {
    const s = new Set(applications.map(a => a.status).filter(Boolean));
    return VALID_STATUSES.filter(v => s.has(v));
  }, [applications]);

  const getJobById = (id) => jobs.find(j => j._id === id);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleTabChange = (tab) => {
    if (tab === 'edit-job') {
      navigate('/employer/jobs/new');
    } else if (tab === 'jobs') {
      navigate('/employer/jobs');
    } else if (tab === 'overview') {
      navigate('/employer/dashboard');
    } else if (tab === 'applications') {
      navigate('/employer/applications');
    }
  };

  const handleEditJob = (job) => {
    navigate(`/employer/jobs/${job._id}/edit`);
  };

  const overviewLoading = loading.summary || loading.jobs || loading.applications;
  const jobsLoading = loading.jobs;
  const appsLoading = loading.applications;

  return (
    <EmployerLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {error && (
        <div className="admin-alert admin-alert-error" style={{ margin: '0 24px 16px' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>X</button>
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewSection
          summary={summary}
          jobs={jobs}
          applications={applications}
          loading={overviewLoading}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      )}

      {activeTab === 'jobs' && (
        <JobsSection
          jobs={filteredJobs}
          loading={jobsLoading}
          search={jobsSearch}
          onSearchChange={setJobsSearch}
          onEdit={handleEditJob}
          onClose={handleCloseJob}
          onReopen={handleReopenJob}
          onDelete={handleDeleteJob}
          onCreateNew={() => handleTabChange('edit-job')}
          formatDate={formatDate}
        />
      )}

      {(activeTab === 'edit-job' || activeTab === 'new-job') && (
        <JobFormSection
          editingJob={editingJob}
          formData={formData}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          onChange={handleFormChange}
          onSave={handleSaveJob}
          onCancel={() => handleTabChange('jobs')}
        />
      )}

      {activeTab === 'applications' && (
        <ApplicationsSection
          applications={filteredApplications}
          loading={appsLoading}
          selectedJob={selectedJob}
          selectedStatus={selectedStatus}
          onJobChange={setSelectedJob}
          onStatusChange={setSelectedStatus}
          uniqueJobs={uniqueJobsForFilter}
          allStatuses={allStatuses}
          onStatusUpdate={handleStatusUpdate}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      )}
    </EmployerLayout>
  );
};

/* ============================================
   OVERVIEW — Analytics + Visual Sections
   ============================================ */

const OverviewSection = ({ summary, jobs, applications, loading, formatDate, getInitials }) => {
  const userName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.name?.split(' ')[0] || 'Employer';
    } catch { return 'Employer'; }
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const pendingApproval = jobs.filter(j => j.status === 'Pending Approval').length;
  const closedJobs = jobs.filter(j => j.status === 'Closed').length;
  const totalJobs = jobs.length;

  const pipelineData = useMemo(() => {
    const counts = {};
    VALID_STATUSES.forEach(s => counts[s] = 0);
    applications.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return counts;
  }, [applications]);

  const topJobs = useMemo(() => {
    const appCounts = {};
    applications.forEach(a => {
      const jid = a.job?._id;
      if (jid) appCounts[jid] = (appCounts[jid] || 0) + 1;
    });
    return jobs
      .map(j => ({ ...j, appCount: appCounts[j._id] || 0 }))
      .sort((a, b) => b.appCount - a.appCount)
      .slice(0, 5);
  }, [jobs, applications]);

  const recentActivity = useMemo(() => {
    return applications
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 8)
      .map(a => ({
        id: a._id,
        text: <><strong>{a.seeker?.name || 'Candidate'}</strong> applied for <strong>{a.job?.title || 'a job'}</strong></>,
        time: formatDate(a.updatedAt || a.createdAt),
        type: a.status?.toLowerCase().replace(/\s+/g, '') || 'applied',
        status: a.status
      }));
  }, [applications, formatDate]);

  const trendsData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = applications.filter(a => {
        const created = new Date(a.createdAt).toISOString().split('T')[0];
        return created === dateStr;
      }).length;
      days.push({ label, count, date: dateStr });
    }
    return days;
  }, [applications]);

  const acceptanceRate = totalJobs > 0 ? Math.round(((pipelineData['Accepted'] || 0) / applications.length) * 100) || 0 : 0;

  const totalApps = applications.length;
  const maxTrend = Math.max(...trendsData.map(d => d.count), 1);

  const totalPipeline = Object.values(pipelineData).reduce((a, b) => a + b, 0) || 1;

  const statusColors = {
    'Pending': '#f59e0b',
    'Reviewing': '#6366f1',
    'Shortlisted': '#06b6d4',
    'Interview Scheduled': '#ec4899',
    'Accepted': '#10b981',
    'Rejected': '#ef4444'
  };

  const dotColors = {
    'Pending': 'reviewing',
    'Reviewing': 'applied',
    'Shortlisted': 'shortlisted',
    'Interview Scheduled': 'interview',
    'Accepted': 'accepted',
    'Rejected': 'rejected'
  };

  if (loading) {
    return (
      <div className="emp-page">
        <div className="emp-page-header"><h1>Employer Dashboard</h1></div>
        <div className="admin-loading"><div className="admin-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="emp-page">
      {/* Hero Banner */}
      <div className="emp-hero">
        <div className="emp-hero-content">
          <div className="emp-hero-text">
            <h2>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName}</h2>
            <p>Here's what's happening with your hiring pipeline today. You have {activeJobs} active job{activeJobs !== 1 ? 's' : ''} and {pipelineData['Pending'] || 0} application{pipelineData['Pending'] !== 1 ? 's' : ''} waiting for review.</p>
          </div>
          <div className="emp-hero-stats">
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{totalApps}</div>
              <div className="emp-hero-stat-label">Total Apps</div>
            </div>
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{activeJobs}</div>
              <div className="emp-hero-stat-label">Active Jobs</div>
            </div>
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{acceptanceRate}%</div>
              <div className="emp-hero-stat-label">Accept Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="emp-quick-actions">
        <a href="#create-job" className="emp-quick-action-card" onClick={(e) => { e.preventDefault(); }}>
          <div className="emp-quick-action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div className="emp-quick-action-info">
            <h4>Post New Job</h4>
            <p>Create a job listing</p>
          </div>
        </a>
        <a href="#view-apps" className="emp-quick-action-card" onClick={(e) => { e.preventDefault(); }}>
          <div className="emp-quick-action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="emp-quick-action-info">
            <h4>Review Applications</h4>
            <p>{pipelineData['Pending'] || 0} pending review</p>
          </div>
        </a>
        <a href="#view-jobs" className="emp-quick-action-card" onClick={(e) => { e.preventDefault(); }}>
          <div className="emp-quick-action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div className="emp-quick-action-info">
            <h4>Manage Jobs</h4>
            <p>{totalJobs} total listings</p>
          </div>
        </a>
        <a href="#view-interviews" className="emp-quick-action-card" onClick={(e) => { e.preventDefault(); }}>
          <div className="emp-quick-action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="2" y="4" width="20" height="18" rx="2"/><path d="M12 11v4"/><path d="M10 13h4"/></svg>
          </div>
          <div className="emp-quick-action-info">
            <h4>Interviews</h4>
            <p>{pipelineData['Interview Scheduled'] || 0} scheduled</p>
          </div>
        </a>
      </div>

      {/* Stats */}
      <div className="emp-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-icon blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div className="emp-stat-label">Active Jobs</div>
          <div className="emp-stat-value">{activeJobs}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="emp-stat-label">Total Applications</div>
          <div className="emp-stat-value">{totalApps}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="emp-stat-label">Pending Review</div>
          <div className="emp-stat-value">{pipelineData['Pending'] || 0}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="2" y="4" width="20" height="18" rx="2"/><path d="M12 11v4"/><path d="M10 13h4"/></svg>
          </div>
          <div className="emp-stat-label">Interviews</div>
          <div className="emp-stat-value">{pipelineData['Interview Scheduled'] || 0}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div className="emp-stat-label">Hired</div>
          <div className="emp-stat-value">{pipelineData['Accepted'] || 0}</div>
        </div>
      </div>

      {/* Pipeline + Top Jobs */}
      <div className="emp-analytics-grid">
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Application Pipeline</div>
          <div className="emp-pipeline-summary">
            {VALID_STATUSES.map(status => (
              <div
                key={status}
                className="emp-pipeline-summary-segment"
                style={{
                  width: `${((pipelineData[status] || 0) / totalPipeline) * 100}%`,
                  background: statusColors[status]
                }}
              />
            ))}
          </div>
          <div className="emp-pipeline">
            {VALID_STATUSES.map(status => (
              <div className="emp-pipeline-row" key={status}>
                <span className="emp-pipeline-label">{status}</span>
                <div className="emp-pipeline-bar-wrap">
                  <div
                    className={`emp-pipeline-bar ${dotColors[status] || 'applied'}`}
                    style={{ width: `${((pipelineData[status] || 0) / totalPipeline) * 100}%` }}
                  />
                </div>
                <span className="emp-pipeline-count">{pipelineData[status] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Top Jobs by Applications</div>
          {topJobs.length > 0 ? (
            <table className="emp-top-jobs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Applications</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map((job, i) => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="emp-top-jobs-title">{job.title}</td>
                    <td className="emp-top-jobs-apps">{job.appCount}</td>
                    <td>
                      <span className={`emp-status-badge emp-status-${job.status?.toLowerCase().replace(/\s+/g, '')}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="emp-empty-state">
              <div className="emp-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              </div>
              <p className="emp-empty-text">No jobs yet</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Recent Activity</div>
          {recentActivity.length > 0 ? (
            <div className="emp-activity-list">
              {recentActivity.map(item => (
                <div className="emp-activity-item" key={item.id}>
                  <div className={`emp-activity-dot ${item.type}`} />
                  <div>
                    <div className="emp-activity-text">{item.text}</div>
                    <div className="emp-activity-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="emp-empty-state">
              <div className="emp-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <p className="emp-empty-text">No recent activity</p>
            </div>
          )}
        </div>

        {/* Trends */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Application Trends (Last 7 Days)</div>
          <div className="emp-trends-chart">
            {trendsData.map((day, i) => (
              <div className="emp-trend-col" key={i}>
                <div className="emp-trend-bar-wrap">
                  <div
                    className="emp-trend-bar"
                    style={{ height: `${(day.count / maxTrend) * 100}%` }}
                    data-count={day.count}
                  />
                </div>
                <span className="emp-trend-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   MY JOBS — Clean Table
   ============================================ */

const JobsSection = ({ jobs, loading, search, onSearchChange, onEdit, onClose, onReopen, onDelete, onCreateNew, formatDate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;
  const totalPages = Math.ceil(jobs.length / perPage);
  const paginatedJobs = jobs.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <h1>My Jobs</h1>
        <div className="emp-page-header-row">
          <span className="emp-app-count">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
          <button className="admin-primary-btn" onClick={onCreateNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Create Job
          </button>
        </div>
      </div>

      <div className="emp-jobs-header">
        <div className="emp-jobs-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="emp-analytics-card">
          <div className="emp-empty-state">
            <div className="emp-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            </div>
            <p className="emp-empty-text">No jobs posted yet. Create your first job!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="emp-jobs-table-wrap">
            <table className="emp-jobs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Job Type</th>
                  <th>Salary Range</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Applications</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <div className="emp-job-title-cell">
                        <span className="emp-job-title-text">{job.title}</span>
                        <span className="emp-job-location">{job.location}</span>
                      </div>
                    </td>
                    <td>{job.jobType}</td>
                    <td className="emp-salary-range">
                      {job.salary?.min && job.salary?.max
                        ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                        : 'Not specified'}
                    </td>
                    <td>
                      <span className={`emp-status-badge emp-status-${job.status?.toLowerCase().replace(/\s+/g, '') || 'active'}`}>
                        {job.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <span className={`emp-status-badge emp-status-${job.approvalStatus?.toLowerCase().replace(/\s+/g, '') || 'pending'}`}>
                        {job.approvalStatus || 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{job.applicationCount || 0}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(job.createdAt)}</td>
                    <td>
                      <div className="emp-actions">
                        <button className="emp-action-btn" onClick={() => onEdit(job)} title="Edit">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        {job.status === 'Active' ? (
                          <button className="emp-action-btn danger" onClick={() => onClose(job._id)} title="Close">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                            Close
                          </button>
                        ) : (
                          <button className="emp-action-btn success" onClick={() => onReopen(job._id)} title="Reopen">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                            Reopen
                          </button>
                        )}
                        <button className="emp-action-btn danger" onClick={() => onDelete(job._id)} title="Delete">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="emp-pagination">
              <button className="emp-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`emp-page-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="emp-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ============================================
   CREATE / EDIT JOB — Two-Column Form
   ============================================ */

const JobFormSection = ({ editingJob, formData, formErrors, isSubmitting, onChange, onSave, onCancel }) => {
  const inputClass = (field) => `emp-form-input${formErrors[field] ? ' error' : ''}`;

  return (
    <div className="emp-form-page">
      <div className="emp-form-header">
        <h1>{editingJob ? 'Edit Job' : 'Create New Job'}</h1>
      </div>

      {/* Basic Info */}
      <div className="emp-form-section">
        <div className="emp-form-section-title">Basic Information</div>
        <div className="emp-form-grid">
          <div className="emp-form-group full-width">
            <label className="emp-form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              className={inputClass('title')}
              placeholder="e.g. Senior React Developer"
            />
            {formErrors.title && <span style={{ color: 'var(--error-color)', fontSize: 12 }}>{formErrors.title}</span>}
          </div>
          <div className="emp-form-group">
            <label className="emp-form-label">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onChange}
              className={inputClass('location')}
              placeholder="e.g. New York, NY"
            />
            {formErrors.location && <span style={{ color: 'var(--error-color)', fontSize: 12 }}>{formErrors.location}</span>}
          </div>
          <div className="emp-form-group">
            <label className="emp-form-label">Job Type</label>
            <select name="jobType" value={formData.jobType} onChange={onChange} className="emp-form-select">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="emp-form-group">
            <label className="emp-form-label">Experience Level</label>
            <select name="experienceLevel" value={formData.experienceLevel} onChange={onChange} className="emp-form-select">
              {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="emp-form-group">
            <label className="emp-form-label">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={onChange}
              className="emp-form-input"
            />
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="emp-form-section">
        <div className="emp-form-section-title">Compensation</div>
        <div className="emp-form-grid">
          <div className="emp-form-group">
            <label className="emp-form-label">Minimum Salary ($)</label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={onChange}
              className="emp-form-input"
              placeholder="e.g. 50000"
              min="0"
            />
          </div>
          <div className="emp-form-group">
            <label className="emp-form-label">Maximum Salary ($)</label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={onChange}
              className={inputClass('salary')}
              placeholder="e.g. 80000"
              min="0"
            />
            {formErrors.salary && <span style={{ color: 'var(--error-color)', fontSize: 12 }}>{formErrors.salary}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="emp-form-section">
        <div className="emp-form-section-title">Description & Requirements</div>
        <div className="emp-form-grid">
          <div className="emp-form-group full-width">
            <label className="emp-form-label">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              className={`emp-form-textarea${formErrors.description ? ' error' : ''}`}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              rows={6}
            />
            {formErrors.description && <span style={{ color: 'var(--error-color)', fontSize: 12 }}>{formErrors.description}</span>}
          </div>
          <div className="emp-form-group full-width">
            <label className="emp-form-label">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={onChange}
              className="emp-form-textarea"
              placeholder="List the qualifications, skills, and experience needed..."
              rows={4}
            />
          </div>
          <div className="emp-form-group full-width">
            <label className="emp-form-label">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={onChange}
              className="emp-form-input"
              placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
            />
          </div>
        </div>
      </div>

      {formErrors.submit && (
        <div className="admin-alert admin-alert-error">{formErrors.submit}</div>
      )}

      <div className="emp-form-actions">
        <button className="emp-form-cancel-btn" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button className="emp-form-save-btn" onClick={onSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </div>
  );
};

/* ============================================
   APPLICATIONS — Card-Based with Filters
   ============================================ */

const ApplicationsSection = ({ applications, loading, selectedJob, selectedStatus, onJobChange, onStatusChange, uniqueJobs, allStatuses, onStatusUpdate, formatDate, getInitials }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="emp-page">
      <div className="emp-page-header">
        <h1>Applications</h1>
        <span className="emp-app-count">{applications.length} application{applications.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="emp-apps-header">
        <div className="emp-apps-filters">
          <select
            className="emp-apps-select"
            value={selectedJob}
            onChange={(e) => onJobChange(e.target.value)}
          >
            <option value="all">All Jobs</option>
            {uniqueJobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
          <select
            className="emp-apps-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="emp-analytics-card">
          <div className="emp-empty-state">
            <div className="emp-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p className="emp-empty-text">No applications match your filters</p>
          </div>
        </div>
      ) : (
        <div className="emp-app-cards">
          {applications.map(app => (
            <div className="emp-app-card" key={app._id}>
              <div className="emp-app-card-header">
                <div className="emp-app-card-info">
                  <h3 className="emp-app-card-name">{app.seeker?.name || 'Unknown Candidate'}</h3>
                  <span className="emp-app-card-email">{app.seeker?.email || ''}</span>
                </div>
                <span className={`emp-status-badge emp-status-${app.status?.toLowerCase().replace(/\s+/g, '') || 'pending'}`}>
                  {app.status || 'Pending'}
                </span>
              </div>

              <div className="emp-app-card-meta">
                <div className="emp-app-meta-item">
                  <span className="emp-app-meta-label">Job</span>
                  <span className="emp-app-meta-value">{app.job?.title || 'N/A'}</span>
                </div>
                <div className="emp-app-meta-item">
                  <span className="emp-app-meta-label">Applied</span>
                  <span className="emp-app-meta-value">{formatDate(app.createdAt)}</span>
                </div>
                {app.seeker?.phone && (
                  <div className="emp-app-meta-item">
                    <span className="emp-app-meta-label">Phone</span>
                    <span className="emp-app-meta-value">{app.seeker.phone}</span>
                  </div>
                )}
              </div>

              {app.coverLetter && (
                <div className="emp-app-card-cover">
                  <div className="emp-app-cover-label">Cover Letter</div>
                  <div className="emp-app-cover-text">
                    {expandedId === app._id ? app.coverLetter : app.coverLetter.slice(0, 200) + (app.coverLetter.length > 200 ? '...' : '')}
                    {app.coverLetter.length > 200 && (
                      <button
                        onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12, marginLeft: 4 }}
                      >
                        {expandedId === app._id ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="emp-app-card-cover">
  <div className="emp-app-cover-label">Resume / CV</div>

  <div className="emp-app-cover-text">
    {app.resume ? (
      <a
        href={getFileUrl(app.resume)}
        target="_blank"
        rel="noreferrer"
        className="resume-link"
      >
        Open CV
      </a>
    ) : (
      "No CV uploaded"
    )}
  </div>
</div>

              <div className="emp-app-card-footer">
                <span className="emp-app-date">Last updated: {formatDate(app.updatedAt)}</span>
                <select
                  className="emp-app-status-select"
                  value={app.status || 'Pending'}
                  onChange={(e) => onStatusUpdate(app._id, e.target.value)}
                >
                  {VALID_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
