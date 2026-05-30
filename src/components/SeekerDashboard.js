import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import axios from 'axios';

import {
  Mail,
  FileText,
  Briefcase,
  MapPin,
  GraduationCap,
  Code,
  Building2,
  DollarSign,
} from 'lucide-react';

import {
  getMyProfile,
  getMyApplications,
} from '../services/seekerService';

import '../styles/seekerDashboard.css';

const SeekerDashboard = () => {

  const [profile, setProfile] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  // ============================
  // FETCH DATA
  // ============================

  const fetchData = async () => {

    try {

      setLoading(true);

      // PROFILE
      const profileRes =
        await getMyProfile();

      setProfile(profileRes.data);

      // APPLICATIONS
      const appRes =
        await getMyApplications();

      // APPROVED JOBS
      const jobsRes =
        await axios.get(
          'http://localhost:5000/api/jobs'
        );

      // REMOVE ALREADY APPLIED JOBS
      const appliedJobIds =
        appRes.data.map(
          (item) => item.job?._id
        );

      const filteredJobs =
        jobsRes.data.filter(
          (job) =>
            !appliedJobIds.includes(job._id)
        );

      setJobs(filteredJobs);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchData();

  }, []);

  const profileImage = profile?.profileImage
    ? profile.profileImage.startsWith('http')
      ? profile.profileImage
      : `http://localhost:5000/${profile.profileImage.replace(/\\/g, '/')}`
    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  return (

    <div className="seeker-dashboard">

      {/* HEADER */}
      <div className="dashboard-top">

        <div>

          <h1>
            Welcome back,
            <span> {profile?.name || 'User'}</span>
          </h1>

          <p>
            Find jobs and manage applications easily.
          </p>

        </div>

        <div className="dashboard-buttons">

          <Link
            to="/seeker/profile"
            className="dashboard-btn"
          >
            Edit Profile
          </Link>

          <Link
            to="/seeker/applications"
            className="dashboard-btn primary"
          >
            My Applications
          </Link>

        </div>

      </div>

      {/* PROFILE */}
      {profile && (

        <div className="profile-card">

          <div className="profile-header">

            <div className="avatar">

              <img
                src={profileImage}
                alt="profile"
              />

            </div>

            <div className="profile-info">

              <h2>{profile.name}</h2>

              <div className="email-row">

                <Mail size={18} />

                <span>{profile.email}</span>

              </div>

            </div>

          </div>

          <div className="profile-grid">

            <div className="profile-item">

              <div className="icon-box">
                <MapPin size={20} />
              </div>

              <div>

                <h4>Location</h4>

                <p>
                  {profile.location ||
                    'No location added'}
                </p>

              </div>

            </div>

            <div className="profile-item">

              <div className="icon-box">
                <GraduationCap size={20} />
              </div>

              <div>

                <h4>Education</h4>

                <p>
                  {profile.education ||
                    'No education added'}
                </p>

              </div>

            </div>

            <div className="profile-item">

              <div className="icon-box">
                <Code size={20} />
              </div>

              <div>

                <h4>Skills</h4>

                <p>
                  {profile.skills ||
                    'No skills added'}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* AVAILABLE JOBS */}
      <div className="applications-section">

        <div className="section-title">

          <Briefcase size={24} />

          <h2>Available Jobs</h2>

        </div>

        {loading ? (

          <p>Loading jobs...</p>

        ) : jobs.length === 0 ? (

          <div className="empty-state">

            <FileText size={40} />

            <p>No approved jobs found</p>

          </div>

        ) : (

          jobs.map((job) => (

            <div
              className="application-card"
              key={job._id}
            >

              <h3>{job.title}</h3>

              <p>

                <Building2 size={16} />
                {" "}
                {job.company}

              </p>

              <p className="cover-letter">
                {app.coverLetter}
              </p>

              {app.resume && (
                <a
                  href={app.resume.startsWith('http') ? app.resume : `http://localhost:5000/${app.resume.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="resume-btn"
                >
                  View Resume
                </a>
              )}

            </div>

          ))

        )}

      </div>

    </div>

  );

};

export default SeekerDashboard;