import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Mail,
  FileText,
  Briefcase,
  MapPin,
  GraduationCap,
  Code,
} from 'lucide-react';

import {
  getMyProfile,
  getMyApplications,
} from '../services/seekerService';

import '../styles/seekerDashboard.css';

const SeekerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await getMyProfile();

      console.log(profileRes.data);

      setProfile(profileRes.data);

      const appRes = await getMyApplications();

      if (Array.isArray(appRes.data)) {
        setApplications(appRes.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const profileImage = profile?.profileImage
  ? profile.profileImage.startsWith('http')
    ? profile.profileImage
    : `http://localhost:5000/${profile.profileImage.replace(/\\/g, '/')}`
  : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  return (
    <div className="seeker-dashboard">

      {/* TOP HEADER */}
      <div className="dashboard-top">

        <div>
          <h1>
            Welcome back,
            <span> {profile?.name || 'User'}</span>
          </h1>

          <p>
            Manage your professional profile and job applications.
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
            to="/jobs/apply"
            className="dashboard-btn primary"
          >
            Apply Job
          </Link>

        </div>

      </div>

      {/* PROFILE CARD */}
      {profile && (
        <div className="profile-card">

          <div className="profile-header">

            {/* PROFILE IMAGE */}
            <div className="avatar">

              <img
                src={profileImage}
                alt="profile"
                onError={(e) => {
                  e.target.src =
                     'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                }}
              />

            </div>

            {/* USER INFO */}
            <div className="profile-info">

              <h2>{profile.name}</h2>

              <div className="email-row">
                <Mail size={18} />
                <span>{profile.email}</span>
              </div>

            </div>

          </div>

          {/* INFO GRID */}
          <div className="profile-grid">

            <div className="profile-item">

              <div className="icon-box">
                <MapPin size={20} />
              </div>

              <div>
                <h4>Location</h4>
                <p>{profile.location || 'No location added'}</p>
              </div>

            </div>

            <div className="profile-item">

              <div className="icon-box">
                <GraduationCap size={20} />
              </div>

              <div>
                <h4>Education</h4>
                <p>{profile.education || 'No education added'}</p>
              </div>

            </div>

            <div className="profile-item">

              <div className="icon-box">
                <Code size={20} />
              </div>

              <div>
                <h4>Skills</h4>
                <p>{profile.skills || 'No skills added'}</p>
              </div>

            </div>

          </div>

          {/* BIO */}
          <div className="bio-box">

            <h3>About Me</h3>

            <p>
              {profile.bio || 'No bio added yet'}
            </p>

          </div>

        </div>
      )}

      {/* APPLICATIONS */}
      <div className="applications-section">

        <div className="section-title">

          <Briefcase size={24} />

          <h2>Applied Jobs</h2>

        </div>

        {applications.length === 0 ? (

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

              <h3>{app.jobTitle}</h3>

              <p>
                <strong>Status:</strong> {app.status}
              </p>

              <p className="cover-letter">
                {app.coverLetter}
              </p>

              {app.resume && (
                <a
                  href={`http://localhost:5000/${app.resume}`}
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