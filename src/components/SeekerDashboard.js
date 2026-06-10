import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

import {
  Briefcase,
  FileText,
  MapPin,
  GraduationCap,
  Code,
  Building2,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock3,
  CheckCircle,
  XCircle,
  Search,
  Bell,
} from 'lucide-react';

import {
  getMyProfile,
  getMyApplications,
} from '../services/seekerService';

import recommendationService from '../services/recommendationService';

import ReminderWidget from './ReminderWidget';
import UserAvatar from './UserAvatar';
import { getFileUrl } from '../utils/fileUrl';

import '../styles/employerDashboard.css';
import '../styles/seekerDashboard.css';

const SeekerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const profileRes = await getMyProfile();
      setProfile(profileRes.data);

      const appRes = await getMyApplications();
      const myApplications = Array.isArray(appRes.data)
        ? appRes.data
        : appRes.data?.applications || [];
      setApplications(myApplications);

      const jobsRes = await api.get('/jobs');
      const allJobs = Array.isArray(jobsRes.data)
        ? jobsRes.data
        : jobsRes.data?.jobs || [];

      const appliedJobIds = myApplications
        .map((item) => item.job?._id)
        .filter(Boolean);

      const filteredJobs = allJobs.filter(
        (job) => job.status === 'active' && job.isApproved !== false && !appliedJobIds.includes(job._id)
      );
      setJobs(filteredJobs);

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
      console.log('Seeker dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      reviewing: applications.filter((app) =>
        ['Reviewing', 'Shortlisted', 'Interview Scheduled'].includes(app.status)
      ).length,
      interviews: applications.filter((app) => app.status === 'Interview Scheduled').length,
      accepted: applications.filter((app) => app.status === 'Accepted').length,
      rejected: applications.filter((app) => app.status === 'Rejected').length,
    };
  }, [applications]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.email,
      profile.location,
      profile.education,
      profile.skills,
      profile.resume,
      profile.profileImage,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const recentApplications = applications.slice(0, 5);
  const availableJobs = jobs.slice(0, 5);

  const firstName = profile?.name?.split(' ')[0] || 'Seeker';

  if (loading) {
    return (
      <div className="emp-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="emp-page seeker-modern-page">
      {/* HERO */}
      <div className="emp-hero seeker-hero">
        <div className="emp-hero-content">
          <div className="emp-hero-text">
            <div className="seeker-hero-profile">
              <UserAvatar profile={profile} size={72} />
              <div>
                <h2>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}</h2>
                <p>Track your applications, discover new jobs, and keep your seeker profile ready for employers.</p>
              </div>
            </div>
          </div>

          <div className="emp-hero-stats">
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{stats.total}</div>
              <div className="emp-hero-stat-label">Applications</div>
            </div>
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{jobs.length}</div>
              <div className="emp-hero-stat-label">Available Jobs</div>
            </div>
            <div className="emp-hero-stat">
              <div className="emp-hero-stat-value">{profileCompletion}%</div>
              <div className="emp-hero-stat-label">Profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="emp-quick-actions">
        <Link to="/jobs" className="emp-quick-action-card">
          <div className="emp-quick-action-icon">
            <Search size={18} />
          </div>
          <div className="emp-quick-action-info">
            <h4>Browse Jobs</h4>
            <p>Find new opportunities</p>
          </div>
        </Link>

        <Link to="/seeker/recommendations" className="emp-quick-action-card">
          <div className="emp-quick-action-icon rec-icon">
            <Sparkles size={18} />
          </div>
          <div className="emp-quick-action-info">
            <h4>Recommended for You</h4>
            <p>AI-matched jobs</p>
          </div>
        </Link>

        <Link to="/seeker/applications" className="emp-quick-action-card">
          <div className="emp-quick-action-icon">
            <FileText size={18} />
          </div>
          <div className="emp-quick-action-info">
            <h4>My Applications</h4>
            <p>Track job progress</p>
          </div>
        </Link>

        <Link to="/seeker/messages" className="emp-quick-action-card">
          <div className="emp-quick-action-icon">
            <MessageSquare size={18} />
          </div>
          <div className="emp-quick-action-info">
            <h4>Messages</h4>
            <p>Chat with employers</p>
          </div>
        </Link>
      </div>

      {/* STATS */}
      <div className="emp-stats-grid seeker-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-icon blue">
            <FileText size={18} />
          </div>
          <div className="emp-stat-label">Total Applications</div>
          <div className="emp-stat-value">{stats.total}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon amber">
            <Clock3 size={18} />
          </div>
          <div className="emp-stat-label">Under Review</div>
          <div className="emp-stat-value">{stats.reviewing}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon purple">
            <Briefcase size={18} />
          </div>
          <div className="emp-stat-label">Interviews</div>
          <div className="emp-stat-value">{stats.interviews}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon green">
            <CheckCircle size={18} />
          </div>
          <div className="emp-stat-label">Accepted</div>
          <div className="emp-stat-value">{stats.accepted}</div>
        </div>
        <div className="emp-stat-card">
          <div className="emp-stat-icon red">
            <XCircle size={18} />
          </div>
          <div className="emp-stat-label">Rejected</div>
          <div className="emp-stat-value">{stats.rejected}</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="emp-analytics-grid">
        {/* PROFILE SUMMARY */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Profile Summary</div>
          <div className="seeker-profile-summary">
            <div className="seeker-profile-row">
              <MapPin size={16} />
              <span>{profile?.location || 'No location added'}</span>
            </div>
            <div className="seeker-profile-row">
              <GraduationCap size={16} />
              <span>{profile?.education || 'No education added'}</span>
            </div>
            <div className="seeker-profile-row">
              <Code size={16} />
              <span>{profile?.skills || 'No skills added'}</span>
            </div>
          </div>
          <div className="seeker-progress-wrap">
            <div className="seeker-progress-head">
              <span>Profile Completion</span>
              <strong>{profileCompletion}%</strong>
            </div>
            <div className="seeker-progress-bar">
              <div className="seeker-progress-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <Link to="/seeker/profile" className="emp-action-btn success seeker-card-action">
            Complete Profile
          </Link>
        </div>

        {/* IMPORTANT UPDATES */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">
            <Bell size={16} />
            Important Updates
          </div>
          <ReminderWidget title="Important Updates" limit={4} />
        </div>

        {/* RECENT APPLICATIONS */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Recent Applications</div>
          {recentApplications.length === 0 ? (
            <div className="emp-empty-state">
              <FileText size={40} />
              <p className="emp-empty-text">You have not applied for any jobs yet.</p>
            </div>
          ) : (
            <div className="seeker-list">
              {recentApplications.map((application) => (
                <div className="seeker-list-item" key={application._id}>
                  <div>
                    <h4>{application.job?.title || application.jobTitle || 'Job Application'}</h4>
                    <p>
                      {application.job?.company?.name || application.job?.company || 'Company not available'}
                    </p>
                  </div>
                  <span className={`emp-status-badge emp-status-${String(application.status || 'pending').toLowerCase().replace(/\s+/g, '')}`}>
                    {application.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/seeker/applications" className="emp-action-btn seeker-card-action">
            View All Applications
          </Link>
        </div>

        {/* AVAILABLE JOBS */}
        <div className="emp-analytics-card">
          <div className="emp-analytics-title">Available Jobs</div>
          {availableJobs.length === 0 ? (
            <div className="emp-empty-state">
              <Briefcase size={40} />
              <p className="emp-empty-text">No available jobs found.</p>
            </div>
          ) : (
            <div className="seeker-list">
              {availableJobs.map((job) => (
                <div className="seeker-list-item" key={job._id}>
                  <div>
                    <h4>{job.title}</h4>
                    <p>
                      <Building2 size={14} />{' '}
                      {job.company?.name || job.company || 'Verified Employer'}
                    </p>
                    <p>
                      <MapPin size={14} />{' '}
                      {job.location || 'Location not specified'}
                    </p>
                  </div>
                  <Link to={`/apply-job/${job._id}`} className="emp-action-btn success">
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          )}
          <Link to="/jobs" className="emp-action-btn seeker-card-action">
            Browse More Jobs
          </Link>
        </div>
      </div>

      {/* RECOMMENDED JOBS SECTION */}
      {recommendations.length > 0 && (
        <div className="seeker-rec-section">
          <div className="seeker-rec-header">
            <div className="seeker-rec-title">
              <Sparkles size={20} />
              <h2>Recommended for You</h2>
            </div>
            <Link to="/seeker/recommendations" className="seeker-rec-view-all">
              View All
            </Link>
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
                  {rec.job.salary?.min && (
                    <span>${rec.job.salary.min.toLocaleString()}{rec.job.salary.max ? ` - $${rec.job.salary.max.toLocaleString()}` : ''}</span>
                  )}
                </div>
                <Link to={`/apply-job/${rec.job._id}`} className="rec-apply-btn">
                  Apply Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
