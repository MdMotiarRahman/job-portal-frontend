import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Clock3,
  MapPin,
  Building2,
  BadgeDollarSign,
  FileText,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  User2,
  Briefcase,
} from "lucide-react";

import adminService from "../services/admin.service";
import "../styles/dashboard.css";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadPendingJobs = async () => {
    try {
      setLoading(true);
      setNotice("");
      const data = await adminService.getPendingJobs();
      setJobs(data);
    } catch (error) {
      console.log(error);
      setNotice(error?.response?.data?.message || "Unable to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const handleApprove = async (jobId) => {
    try {
      setActionId(jobId);
      await adminService.approveJob(jobId);
      setNotice("Job approved successfully.");
      await loadPendingJobs();
    } catch (error) {
      console.log(error);
      setNotice(error?.response?.data?.message || "Unable to approve job");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (jobId) => {
    try {
      setActionId(jobId);
      await adminService.rejectJob(jobId);
      setNotice("Job rejected successfully.");
      await loadPendingJobs();
    } catch (error) {
      console.log(error);
      setNotice(error?.response?.data?.message || "Unable to reject job");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div className="hero-card">
            <div className="hero-badge">
              <ShieldCheck size={16} />
              Admin Review Panel
            </div>

            <h1 className="hero-title">Approve jobs before they go live.</h1>

            <p className="hero-subtitle">
              Review employer submissions, approve quality postings, and keep
              the platform clean and professional for job seekers.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-action primary"
                onClick={loadPendingJobs}
              >
                <RefreshCcw size={18} />
                Refresh Queue
              </button>

              <div className="hero-action secondary" style={{ cursor: "default" }}>
                <Clock3 size={18} />
                Pending Review Only
              </div>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">
                <Briefcase size={16} />
                Pending Jobs
              </div>
              <div className="summary-value">{jobs.length}</div>
              <div className="summary-note">Waiting for your approval</div>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <User2 size={16} />
                Employers
              </div>
              <div className="summary-value">{jobs.length}</div>
              <div className="summary-note">Unique jobs in queue</div>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <CheckCircle2 size={16} />
                Approved
              </div>
              <div className="summary-value">Live</div>
              <div className="summary-note">Approved jobs appear publicly</div>
            </div>

            <div className="summary-card">
              <div className="summary-label">
                <XCircle size={16} />
                Rejected
              </div>
              <div className="summary-value">—</div>
              <div className="summary-note">Rejected jobs stay hidden</div>
            </div>
          </div>
        </div>

        {notice && (
          <div className="panel-card" style={{ marginBottom: "1rem" }}>
            <strong>{notice}</strong>
          </div>
        )}

        <div className="panel-card">
          <div className="section-head">
            <h2 className="section-title">Pending Jobs</h2>
            <button type="button" className="section-action" onClick={loadPendingJobs}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-row">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              No pending jobs right now. Everything is up to date.
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-top">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-company">
                        {job.company} · {job.employer?.name || "Employer"}
                      </div>
                    </div>

                    <span className="status-pill status-pending">pending</span>
                  </div>

                  <div className="job-meta">
                    <span>
                      <Building2 size={14} />
                      {job.company}
                    </span>
                    <span>
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span>
                      <BadgeDollarSign size={14} />
                      {job.salary}
                    </span>
                    <span>
                      <FileText size={14} />
                      {job.type || "—"}
                    </span>
                  </div>

                  <div className="card-divider" />

                  <p className="muted-text mb-2">{job.description}</p>

                  <div className="chip-list">
                    {(job.requirements || []).map((item, idx) => (
                      <span key={idx} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 gap-2 flex-wrap">
                    <small className="muted-text">
                      Submitted on {formatDate(job.createdAt)}
                    </small>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleApprove(job._id)}
                        disabled={actionId === job._id}
                      >
                        {actionId === job._id ? "Please wait..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleReject(job._id)}
                        disabled={actionId === job._id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;