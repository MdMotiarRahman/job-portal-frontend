import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
  Building2,
  MapPin,
} from "lucide-react";

import {
  getMyApplications,
} from "../services/seekerService";

import messageService from "../services/messageService";

import "../styles/employerDashboard.css";
import "../styles/myApplications.css";
import { getFileUrl } from "../utils/fileUrl";

const MyApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await getMyApplications();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.applications || [];

        setApplications(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase().replace(/\s+/g, "");

    if (value === "accepted" || value === "shortlisted") {
      return "emp-status-badge emp-status-active";
    }

    if (value === "rejected") {
      return "emp-status-badge emp-status-closed";
    }

    if (value === "interviewscheduled") {
      return "emp-status-badge emp-status-open";
    }

    return "emp-status-badge emp-status-pending";
  };

  const getCompanyName = (company) => {
    if (!company) return "Company not available";

    if (typeof company === "object") {
      return company.name || company.email || "Company not available";
    }

    return company;
  };

  const startConversation = async (app) => {
    try {
      const employerId =
        typeof app.job?.company === "object"
          ? app.job.company._id
          : app.job?.company;

      const conv = await messageService.createConversation(
        employerId,
        app.job?._id
      );

      navigate(`/seeker/messages?conversation=${conv._id}`);
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  return (
    <div className="my-applications-page">
      <div className="my-applications-hero">
        <h1>My Applications</h1>
        <p>
          Track your job applications, resume submissions, interview details,
          and employer messages in one place.
        </p>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      ) : applications.length === 0 ? (
        <div className="my-empty-state">
          <FileText size={42} />
          <p>No applications found</p>
        </div>
      ) : (
        <div className="my-applications-grid">
          {applications.map((app) => (
            <div
              className="my-application-card"
              key={app._id}
            >
              <div className="my-application-header">
                <div className="my-application-title">
                  <h3>
                    {app.job?.title || app.jobTitle || "Job Application"}
                  </h3>

                  <p>
                    <Building2 size={14} />{" "}
                    {getCompanyName(app.job?.company)}
                  </p>
                </div>

                <span className={getStatusClass(app.status)}>
                  {app.status || "Pending"}
                </span>
              </div>

              <div className="my-application-meta">
                <div className="my-application-meta-item">
                  <span className="my-application-meta-label">
                    Job
                  </span>
                  <span className="my-application-meta-value">
                    {app.job?.title || app.jobTitle || "N/A"}
                  </span>
                </div>

                <div className="my-application-meta-item">
                  <span className="my-application-meta-label">
                    Location
                  </span>
                  <span className="my-application-meta-value">
                    {app.job?.location || "Not available"}
                  </span>
                </div>

                <div className="my-application-meta-item">
                  <span className="my-application-meta-label">
                    Applied
                  </span>
                  <span className="my-application-meta-value">
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="my-application-section">
                <div className="my-application-label">
                  Cover Letter
                </div>

                <div className="my-application-text">
                  {app.coverLetter || "No cover letter provided."}
                </div>
              </div>

              <div className="my-application-actions">
                {app.resume && (
                  <a
                    href={getFileUrl(app.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="my-application-btn"
                  >
                    <FileText size={14} />
                    View Resume
                  </a>
                )}

                {app.job?.company && (
                  <button
                    type="button"
                    className="my-application-btn primary"
                    onClick={() => startConversation(app)}
                  >
                    <MessageSquare size={14} />
                    Message Employer
                  </button>
                )}
              </div>

              {app.status === "Rejected" && (
                <div className="my-application-box rejected">
                  <div className="my-application-box-title">
                    <XCircle size={18} />
                    Application Rejected
                  </div>
                  <p>
                    Sorry, you were not selected for this position.
                  </p>
                </div>
              )}

              {app.status !== "Rejected" &&
                (
                  app.status === "Shortlisted" ||
                  app.status === "Interview Scheduled" ||
                  app.status === "Accepted"
                ) && (
                  <div className="my-application-box interview">
                    <div className="my-application-box-title">
                      <CheckCircle2 size={18} />
                      Interview Details
                    </div>

                    <p>
                      <strong>Date:</strong>{" "}
                      {app.interviewDate || "Not set"}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {app.interviewTime || "Not set"}
                    </p>

                    <p>
                      <strong>Mode / Location:</strong>{" "}
                      {app.interviewMode || "Not set"}
                    </p>

                    <p>
                      <strong>Employer Message:</strong>{" "}
                      {app.employerMessage || "—"}
                    </p>
                  </div>
                )}

              {(app.status === "Pending" || !app.status) && (
                <div className="my-application-box pending">
                  <div className="my-application-box-title">
                    <Clock3 size={18} />
                    Under Review
                  </div>

                  <p>
                    Your application is under review.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;