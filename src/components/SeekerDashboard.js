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
  MessageSquare,
} from 'lucide-react';

import {
  getMyProfile,
  getMyApplications,
} from '../services/seekerService';

import ReminderWidget from './ReminderWidget';

import '../styles/seekerDashboard.css';
import { getFileUrl } from "../utils/fileUrl";

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
      const myApplications = Array.isArray(appRes.data)
  ? appRes.data
  : appRes.data?.applications || [];

const allJobs = Array.isArray(jobsRes.data)
  ? jobsRes.data
  : jobsRes.data?.jobs || [];

const appliedJobIds = myApplications
  .map((item) => item.job?._id || item.job)
  .filter(Boolean);

const filteredJobs = allJobs.filter(
  (job) => !appliedJobIds.includes(job._id)
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

          <Link
            to="/seeker/messages"
            className="dashboard-btn"
          >
            <MessageSquare size={16} style={{ marginRight: 6 }} />
            Messages
          </Link>

        </div>

      </div>

      {/* PROFILE */}
      {profile && (

        <div className="profile-card">

          <div className="profile-header">

            <div className="avatar">

              <img
  src={
    profile.profileImage
      ? getFileUrl(profile.profileImage)
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  }
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

      {/* IMPORTANT UPDATES WIDGET */}
      <div className="dashboard-section" style={{ marginTop: '24px' }}>
        <div className="section-card">
          <ReminderWidget 
            title="Important Updates" 
            limit={4}
          />
        </div>
      </div>

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
                {job.company?.name || job.company || 'N/A'}

              </p>

              <p>

                <MapPin size={16} />
                {" "}
                {job.location || 'Location not specified'}

              </p>

              <p className="cover-letter">
                {job.description
                  ? `${job.description.slice(0, 140)}${job.description.length > 140 ? '...' : ''}`
                  : 'No description provided.'}
              </p>

              <Link
                to={`/apply-job/${job._id}`}
                className="resume-btn"
              >
                Apply Now
              </Link>

            </div>

          ))

        )}

      </div>

    </div>

  );

};

export default SeekerDashboard;
