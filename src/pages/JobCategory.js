import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Loader2, Building2 } from 'lucide-react';
import '../styles/publicPages.css';

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Design', 'Engineering', 'Sales', 'Legal', 'Remote',
];

const JobCategory = () => {
  const { category } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs?search=${encodeURIComponent(category)}&limit=20`);
        const data = await res.json();
        setJobs(data.data?.jobs || data.jobs || []);
      } catch { setJobs([]); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, [category]);

  const displayName = category?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'All';

  return (
    <div className="pp-page">
      <div className="pp-container">
        <Link to="/jobs" className="pp-back-link"><ArrowLeft size={15} /> All Jobs</Link>
        <div className="pp-page-header">
          <h1>{displayName} Jobs</h1>
          <p>Browse the latest {displayName.toLowerCase()} opportunities from top employers.</p>
        </div>

        <div className="pp-category-pills">
          {CATEGORIES.map(c => (
            <Link key={c} to={`/category/${c.toLowerCase()}`} className={`pp-pill ${c.toLowerCase() === category?.toLowerCase() ? 'active' : ''}`}>{c}</Link>
          ))}
        </div>

        {loading ? (
          <div className="pp-loading"><Loader2 size={28} className="pp-spin" /><p>Loading jobs...</p></div>
        ) : jobs.length === 0 ? (
          <div className="pp-empty"><Briefcase size={48} /><p>No jobs found in this category</p></div>
        ) : (
          <div className="pp-job-list">
            {jobs.map(j => (
              <Link to={`/jobs/${j._id}`} key={j._id} className="pp-job-list-item">
                <div className="pp-job-list-company"><Building2 size={20} /></div>
                <div className="pp-job-list-info">
                  <h4>{j.title}</h4>
                  <p className="pp-muted">{j.company?.name || 'Company'} · <MapPin size={13} style={{display:'inline'}} /> {j.location || 'Remote'}</p>
                </div>
                <div className="pp-job-list-meta">
                  <span className="pp-tag">{j.jobType}</span>
                  {j.salary?.min && <span className="pp-meta-item"><DollarSign size={13} /> {Number(j.salary.min).toLocaleString()}+</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCategory;
