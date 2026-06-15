import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Briefcase, Building2, ArrowLeft, Share2, Heart, CheckCircle2, Loader2 } from 'lucide-react';
import '../styles/publicPages.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (data.success) setJob(data.data);
        else setError('Job not found');
      } catch {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return (
    <div className="pp-loading">
      <Loader2 size={32} className="pp-spin" />
      <p>Loading job details...</p>
    </div>
  );

  if (error || !job) return (
    <div className="pp-error-state">
      <Briefcase size={48} />
      <h2>Job Not Found</h2>
      <p>{error || 'This job listing may have been removed.'}</p>
      <Link to="/jobs" className="pp-btn-primary">Browse Jobs</Link>
    </div>
  );

  const salary = job.salary?.min || job.salary?.max
    ? `${job.salary.currency || 'USD'} ${job.salary.min ? Number(job.salary.min).toLocaleString() : 'Open'} – ${job.salary.max ? Number(job.salary.max).toLocaleString() : 'Open'}`
    : 'Not specified';

  return (
    <div className="pp-page">
      <div className="pp-container">
        <button className="pp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to results
        </button>

        <div className="pp-job-detail-grid">
          <div className="pp-job-detail-main">
            <div className="pp-card">
              <div className="pp-job-detail-header">
                <div className="pp-job-company-logo">
                  <Building2 size={28} />
                </div>
                <div>
                  <h1>{job.title}</h1>
                  <p className="pp-job-company-name">{job.company?.name || 'Company'}</p>
                </div>
              </div>

              <div className="pp-job-meta-row">
                <span className="pp-meta-item"><MapPin size={14} /> {job.location || 'Remote'}</span>
                <span className="pp-meta-item"><Briefcase size={14} /> {job.jobType || 'Full-time'}</span>
                <span className="pp-meta-item"><DollarSign size={14} /> {salary}</span>
                <span className="pp-meta-item"><Clock size={14} /> {job.experienceLevel || 'Any level'}</span>
              </div>

              {job.description && (
                <div className="pp-job-section">
                  <h3>Job Description</h3>
                  <div className="pp-prose">{job.description}</div>
                </div>
              )}

              {job.requirements?.length > 0 && (
                <div className="pp-job-section">
                  <h3>Requirements</h3>
                  <ul className="pp-check-list">
                    {job.requirements.map((r, i) => (
                      <li key={i}><CheckCircle2 size={14} /> {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.skills?.length > 0 && (
                <div className="pp-job-section">
                  <h3>Required Skills</h3>
                  <div className="pp-tags">
                    {job.skills.map((s, i) => (
                      <span key={i} className="pp-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits?.length > 0 && (
                <div className="pp-job-section">
                  <h3>Benefits</h3>
                  <ul className="pp-check-list">
                    {job.benefits.map((b, i) => (
                      <li key={i}><CheckCircle2 size={14} /> {b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pp-job-detail-sidebar">
            <div className="pp-card pp-sticky-card">
              <h3>Apply for this position</h3>
              <p className="pp-muted">Submit your application before the deadline.</p>
              <Link to={`/apply-job/${job._id}`} className="pp-btn-primary pp-full-width">
                Apply Now
              </Link>
              <div className="pp-sidebar-actions">
                <button className="pp-btn-outline"><Heart size={14} /> Save</button>
                <button className="pp-btn-outline"><Share2 size={14} /> Share</button>
              </div>
            </div>

            {job.company && (
              <div className="pp-card">
                <h3>About the Company</h3>
                <div className="pp-company-mini">
                  <div className="pp-company-mini-logo"><Building2 size={20} /></div>
                  <div>
                    <p className="pp-company-mini-name">{job.company.name}</p>
                    <p className="pp-muted">{job.company.email || ''}</p>
                  </div>
                </div>
                {job.company.profile?.companyDescription && (
                  <p className="pp-company-desc">{job.company.profile.companyDescription}</p>
                )}
                <Link to={`/companies/${job.company._id}`} className="pp-link">View Company Profile →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
