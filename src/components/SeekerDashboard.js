import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import api from '../services/api';

import {
  Mail,
  FileText,
  Briefcase,
  MapPin,
  GraduationCap,
  Code,
  Building2,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import {
  getMyProfile,
  getMyApplications,
} from '../services/seekerService';

import recommendationService from '../services/recommendationService';

import ReminderWidget from './ReminderWidget';

import '../styles/seekerDashboard.css';

const SeekerDashboard = () => {

  const [profile, setProfile] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [recLoading, setRecLoading] = useState(false);

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
        await api.get('/jobs');

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

      // RECOMMENDATIONS
      setRecLoading(true);
      try {
        const recRes = await recommendationService.getJobRecommendations(6);
        if (recRes.success) {
          setRecommendations(recRes.data || []);
        }
      } catch (recErr) {
        console.log('Recommendations not available:', recErr);
      } finally {
        setRecLoading(false);
      }

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

      {/* IMPORTANT UPDATES WIDGET */}
      <div className="dashboard-section" style={{ marginTop: '24px' }}>
        <div className="section-card">
          <ReminderWidget 
            title="Important Updates" 
            limit={4}
          />
        </div>
      </div>

      {/* RECOMMENDED JOBS */}
      {recommendations.length > 0 && (
        <div className="applications-section">
          <div className="section-title">
            <Sparkles size={24} />
            <h2>Recommended for You</h2>
          </div>
          <div className="rec-jobs-grid">
            {recommendations.map((rec) => (
              <div className="rec-job-card" key={rec.job._id}>
                <div className="rec-job-header">
                  <div className="rec-job-info">
                    <h3>{rec.job.title}</h3>
                    <p className="rec-job-company">
                      <Building2 size={14} />
                      {rec.job.company?.name || 'N/A'}
                    </p>
                    <p className="rec-job-location">
                      <MapPin size={14} />
                      {rec.job.location}
                    </p>
                  </div>
                  <div className={`rec-score ${rec.matchScore >= 70 ? 'high' : rec.matchScore >= 40 ? 'mid' : 'low'}`}>
                    <TrendingUp size={14} />
                    <span>{rec.matchScore}%</span>
                  </div>
                </div>
                <div className="rec-job-skills">
                  {(rec.job.skills || []).slice(0, 4).map((skill, i) => (
                    <span className="rec-skill-tag" key={i}>{skill}</span>
                  ))}
                  {(rec.job.skills || []).length > 4 && (
                    <span className="rec-skill-more">+{rec.job.skills.length - 4}</span>
                  )}
                </div>
                <div className="rec-job-meta">
                  <span>{rec.job.jobType}</span>
                  <span>{rec.job.experienceLevel}</span>
                  {rec.job.salary?.min && <span>${rec.job.salary.min.toLocaleString()}{rec.job.salary.max ? ` - $${rec.job.salary.max.toLocaleString()}` : ''}</span>}
                </div>
                <Link to={`/apply-job/${rec.job._id}`} className="rec-apply-btn">
                  Apply Now
                </Link>
              </div>
            ))}
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
