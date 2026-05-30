
import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  BadgeDollarSign,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

import employerService from "../services/employer.service";
import "../styles/dashboard.css";

const EmployerDashboard = () => {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "",
    description: "",
    requirements: "",
  });

  // =========================
  // LOAD JOBS
  // =========================

  const loadJobs = async () => {

    try {

      setLoading(true);

      const data = await employerService.getMyJobs();

      setJobs(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadJobs();

  }, []);

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {

    return {

      total: jobs.length,

      pending: jobs.filter(
        (job) => job.status === "pending"
      ).length,

      approved: jobs.filter(
        (job) => job.status === "approved"
      ).length,

      rejected: jobs.filter(
        (job) => job.status === "rejected"
      ).length,

    };

  }, [jobs]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  // =========================
  // CREATE JOB
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setCreating(true);

      const payload = {

        ...formData,

        salary: Number(formData.salary),

        requirements: formData.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

      };

      await employerService.createJob(payload);

      alert("Job created successfully");

      setFormData({
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "",
        description: "",
        requirements: "",
      });

      loadJobs();

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.message ||
        "Error creating job"
      );

    } finally {

      setCreating(false);

    }

  };

  // =========================
  // VIEW APPLICANTS
  // =========================

  const viewApplicants = async (jobId, title) => {

    try {

      const data =
        await employerService.getApplicants(jobId);

      setSelectedApplicants(data);

      setSelectedJobTitle(title);

      setShowApplicants(true);

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.message ||
        "Unable to load applicants"
      );

    }

  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusClass = (status) => {

    const value =
      String(status || "").toLowerCase();

    if (value === "approved") {
      return "status-pill status-approved";
    }

    if (value === "rejected") {
      return "status-pill status-rejected";
    }

    return "status-pill status-pending";

  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (value) => {

    if (!value) return "—";

    return new Date(value).toLocaleDateString();

  };

  return (

    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* HERO */}

        <div className="dashboard-hero">

          <div className="hero-card">

            <div className="hero-badge">

              <Briefcase size={16} />
              Employer Workspace

            </div>

            <h1 className="hero-title">
              Manage hiring in one place.
            </h1>

            <p className="hero-subtitle">
              Create jobs, track approval status,
              and review applicants easily.
            </p>

            <div className="hero-actions">

              <button
                type="button"
                className="hero-action primary"
                onClick={() =>
                  document
                    .getElementById("create-job-panel")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >

                <PlusCircle size={18} />
                Create Job

              </button>

              <button
                type="button"
                className="hero-action secondary"
                onClick={loadJobs}
              >

                <RefreshCcw size={18} />
                Refresh Jobs

              </button>

            </div>

          </div>

          {/* STATS */}

          <div className="summary-grid">

            <div className="summary-card">

              <div className="summary-label">

                <Briefcase size={16} />
                Total Jobs

              </div>

              <div className="summary-value">
                {stats.total}
              </div>

            </div>

            <div className="summary-card">

              <div className="summary-label">

                <Clock3 size={16} />
                Pending

              </div>

              <div className="summary-value">
                {stats.pending}
              </div>

            </div>

            <div className="summary-card">

              <div className="summary-label">

                <CheckCircle2 size={16} />
                Approved

              </div>

              <div className="summary-value">
                {stats.approved}
              </div>

            </div>

            <div className="summary-card">

              <div className="summary-label">

                <XCircle size={16} />
                Rejected

              </div>

              <div className="summary-value">
                {stats.rejected}
              </div>

            </div>

          </div>

        </div>

        {/* CREATE JOB */}

        <div
          className="panel-card"
          id="create-job-panel"
        >

          <div className="section-head">

            <h2 className="section-title">
              Create Job
            </h2>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <input
                type="text"
                name="title"
                placeholder="Job Title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="company"
                placeholder="Company"
                className="form-control"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="salary"
                placeholder="Salary"
                className="form-control"
                value={formData.salary}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="type"
                placeholder="Job Type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
              />

              <input
                type="text"
                name="requirements"
                placeholder="React, Node.js, MongoDB"
                className="form-control full"
                value={formData.requirements}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Job Description"
                className="form-control full"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
              />

            </div>

            <div className="d-flex gap-2 mt-3">

              <button
                type="submit"
                className="primary-btn"
                disabled={creating}
              >

                {creating
                  ? "Creating..."
                  : "Create Job"}

              </button>

            </div>

          </form>

        </div>

        {/* JOBS */}

        <div className="panel-card">

          <div className="section-head">

            <h2 className="section-title">
              My Jobs
            </h2>

          </div>

          {loading ? (

            <div className="loading-row">
              Loading jobs...
            </div>

          ) : jobs.length === 0 ? (

            <div className="empty-state">
              No jobs found.
            </div>

          ) : (

            <div className="jobs-grid">

              {jobs.map((job) => (

                <div
                  key={job._id}
                  className="job-card"
                >

                  <div className="job-top">

                    <div>

                      <h3 className="job-title">
                        {job.title}
                      </h3>

                      <div className="job-company">
                        {job.company}
                      </div>

                    </div>

                    <span
                      className={getStatusClass(job.status)}
                    >
                      {job.status}
                    </span>

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

                  </div>

                  <div className="card-divider" />

                  <p className="muted-text mb-2">
                    {job.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-3">

                    <small className="muted-text">

                      Posted on{" "}
                      {formatDate(job.createdAt)}

                    </small>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() =>
                        viewApplicants(
                          job._id,
                          job.title
                        )
                      }
                    >

                      <Eye size={16} />
                      View Applicants

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* APPLICANTS */}

        {showApplicants && (

          <div className="panel-card mt-4">

            <div className="section-head">

              <h2 className="section-title">

                Applicants for "
                {selectedJobTitle}"

              </h2>

              <button
                type="button"
                className="section-action"
                onClick={() =>
                  setShowApplicants(false)
                }
              >
                Close
              </button>

            </div>

            {selectedApplicants.length === 0 ? (

              <div className="empty-state">
                No applicants yet.
              </div>

            ) : (

              selectedApplicants.map((applicant) => (

                <div
                  key={applicant._id}
                  className="applicant-card"
                >

                  <div className="applicant-head">

                    <div>

                      <h4 className="applicant-name">
                        {applicant.seeker?.name}
                      </h4>

                      <div className="applicant-email">
                        {applicant.seeker?.email}
                      </div>

                    </div>

                    <span
                      className={getStatusClass(
                        applicant.status
                      )}
                    >
                      {applicant.status}
                    </span>

                  </div>

                  <div className="card-divider" />

                  <p className="muted-text mb-2">

                    <strong>Cover Letter:</strong>{" "}
                    {applicant.coverLetter || "—"}

                  </p>

                  <p className="muted-text mb-2">

                    <strong>Resume:</strong>{" "}

                    {applicant.resume ? (

                      <a
                        href={
                          applicant.resume.startsWith("http")
                            ? applicant.resume
                            : `http://localhost:5000/${applicant.resume}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Resume
                      </a>

                    ) : (

                      "Not uploaded"

                    )}

                  </p>

                  <p className="muted-text mb-0">

                    <strong>Applied:</strong>{" "}
                    {formatDate(applicant.createdAt)}

                  </p>

                  {/* ACTIONS */}

                  <div className="mt-3">

                    {/* STATUS */}

                    <select
                      className="form-control mb-2"
                      value={applicant.status || "Pending"}
                      onChange={async (e) => {

                        const newStatus = e.target.value;

                        try {

                          await employerService.updateApplicationStatus(
                            applicant._id,
                            {
                              status: newStatus
                            }
                          );

                          // CLEAR INTERVIEW INFO IF REJECTED
                          if (newStatus === "Rejected") {

                            await employerService.updateApplicationDetails(
                              applicant._id,
                              {
                                interviewDate: "",
                                interviewTime: "",
                                interviewMode: "",
                                employerMessage:
                                  "Sorry, you were not selected for this job."
                              }
                            );

                          }

                          viewApplicants(
                            applicant.job._id,
                            selectedJobTitle
                          );

                        } catch (error) {

                          console.log(error);

                        }

                      }}
                    >

                      <option>Pending</option>
                      <option>Reviewing</option>
                      <option>Shortlisted</option>
                      <option>Interview Scheduled</option>
                      <option>Accepted</option>
                      <option>Rejected</option>

                    </select>

                    {/* SHOW ONLY IF NOT REJECTED */}

                    {applicant.status !== "Rejected" && (

                      <>

                        <input
                          type="date"
                          className="form-control mb-2"
                          value={applicant.interviewDate || ""}
                          onChange={async (e) => {

                            try {

                              await employerService.updateApplicationDetails(
                                applicant._id,
                                {
                                  interviewDate: e.target.value
                                }
                              );

                              viewApplicants(
                                applicant.job._id,
                                selectedJobTitle
                              );

                            } catch (error) {

                              console.log(error);

                            }

                          }}
                        />

                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Interview Time"
                          value={applicant.interviewTime || ""}
                          onChange={async (e) => {

                            try {

                              await employerService.updateApplicationDetails(
                                applicant._id,
                                {
                                  interviewTime: e.target.value
                                }
                              );

                              viewApplicants(
                                applicant.job._id,
                                selectedJobTitle
                              );

                            } catch (error) {

                              console.log(error);

                            }

                          }}
                        />

                        <input
                          type="text"
                          className="form-control mb-2"
                          placeholder="Interview Mode / Location"
                          value={applicant.interviewMode || ""}
                          onChange={async (e) => {

                            try {

                              await employerService.updateApplicationDetails(
                                applicant._id,
                                {
                                  interviewMode: e.target.value
                                }
                              );

                              viewApplicants(
                                applicant.job._id,
                                selectedJobTitle
                              );

                            } catch (error) {

                              console.log(error);

                            }

                          }}
                        />

                        <textarea
                          className="form-control"
                          placeholder="Employer Message"
                          value={applicant.employerMessage || ""}
                          onChange={async (e) => {

                            try {

                              await employerService.updateApplicationDetails(
                                applicant._id,
                                {
                                  employerMessage: e.target.value
                                }
                              );

                              viewApplicants(
                                applicant.job._id,
                                selectedJobTitle
                              );

                            } catch (error) {

                              console.log(error);

                            }

                          }}
                        />

                      </>

                    )}

                    {/* REJECTED MESSAGE */}

                    {applicant.status === "Rejected" && (

                      <div className="rejected-message mt-2">

                        Sorry, you were not selected for this job.

                      </div>

                    )}

                  </div>

                </div>

              ))

            )}

          </div>

        )}

      </div>

    </div>

  );

};

export default EmployerDashboard;