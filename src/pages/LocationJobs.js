import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, ArrowLeft, Loader2, Building2 } from 'lucide-react';
import '../styles/publicPages.css';

const LocationJobs = () => {
  const { location } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs?location=${encodeURIComponent(location)}&limit=20`);
        const data = await res.json();
        setJobs(data.data?.jobs || data.jobs || []);
      } catch { setJobs([]); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, [location]);

  const displayName = location?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'All';

  return (
    <div className="pp-page">
      <div className="pp-container">
        <Link to="/jobs" className="pp-back-link"><ArrowLeft size={15} /> All Jobs</Link>
        <div className="pp-page-header">
          <h1>Jobs in {displayName}</h1>
          <p>Find the best job opportunities in {displayName.toLowerCase()}.</p>
        </div>

        {loading ? (
          <div className="pp-loading"><Loader2 size={28} className="pp-spin" /><p>Loading jobs...</p></div>
        ) : jobs.length === 0 ? (
          <div className="pp-empty"><MapPin size={48} /><p>No jobs found in {displayName}</p></div>
        ) : (
          <div className="pp-job-list">
            {jobs.map(j => (
              <Link to={`/jobs/${j._id}`} key={j._id} className="pp-job-list-item">
                <div className="pp-job-list-company"><Building2 size={20} /></div>
                <div className="pp-job-list-info">
                  <h4>{j.title}</h4>
                  <p className="pp-muted">{j.company?.name || 'Company'} · {j.jobType}</p>
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

export default LocationJobs;
