import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageSquare,
} from "lucide-react";

import {
  getMyApplications,
} from "../services/seekerService";

import messageService from "../services/messageService";

import "../styles/seekerDashboard.css";

const MyApplications = () => {

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchApplications = async () => {

      try {

        const response =
          await getMyApplications();

        if (Array.isArray(response.data)) {

          setApplications(response.data);

        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchApplications();

  }, []);

  const getStatusClass = (status) => {

    const value =
      String(status || "").toLowerCase();

    if (
      value === "accepted" ||
      value === "shortlisted"
    ) {
      return "status-approved";
    }

    if (value === "rejected") {
      return "status-rejected";
    }

    return "status-pending";

  };

  return (

    <div className="seeker-dashboard">

      <div className="section-title">

        <Briefcase size={24} />

        <h2>My Applications</h2>

      </div>

      {loading ? (

        <p>Loading applications...</p>

      ) : applications.length === 0 ? (

        <div className="empty-state">

          <FileText size={40} />

          <p>No applications found</p>

        </div>

      ) : (

        applications.map((app) => (

          <div
            className="application-card"
            key={app._id}
          >

            <div className="d-flex justify-content-between align-items-center">

              <h3>{app.job?.title}</h3>

              <span
                className={`status-pill ${getStatusClass(app.status)}`}
              >
                {app.status}
              </span>

            </div>

            <p>
              <strong>Company:</strong>{" "}
              {app.job?.company}
            </p>

            <p className="cover-letter">
              {app.coverLetter}
            </p>

            {/* RESUME */}
            {app.resume && (

              <a
                href={
                  app.resume.startsWith("http")
                    ? app.resume
                    : `http://localhost:5000/${app.resume.replace(/\\/g, "/")}`
                }
                target="_blank"
                rel="noreferrer"
                className="resume-btn"
              >
                View Resume
              </a>

            )}

            {/* MESSAGE EMPLOYER */}
            {app.job?.company && (
              <button
                className="resume-btn"
                style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none', background: 'var(--brand-primary)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
                onClick={async () => {
                  try {
                    const employerId = typeof app.job.company === 'object' ? app.job.company._id : app.job.company;
                    const conv = await messageService.createConversation(employerId, app.job?._id);
                    navigate(`/seeker/messages?conversation=${conv._id}`);
                  } catch (err) {
                    console.error('Failed to start conversation', err);
                  }
                }}
              >
                <MessageSquare size={14} />
                Message Employer
              </button>
            )}

            {/* REJECTED MESSAGE */}
            {app.status === "Rejected" && (

              <div className="rejected-box">

                <XCircle size={20} />

                <p>
                  Sorry, you were not selected
                  for this position.
                </p>

              </div>

            )}

            {/* INTERVIEW DETAILS */}
            {app.status !== "Rejected" &&
              (
                app.status === "Shortlisted" ||
                app.status === "Interview Scheduled" ||
                app.status === "Accepted"
              ) && (

              <div className="interview-box">

                <div className="interview-title">

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

            {/* PENDING MESSAGE */}
            {app.status === "Pending" && (

              <div className="pending-box">

                <Clock3 size={18} />

                <p>
                  Your application is under review.
                </p>

              </div>

            )}

          </div>

        ))

      )}

    </div>

  );

};

export default MyApplications;