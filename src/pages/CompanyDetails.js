import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Globe, Phone, Mail, Users, ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import api from '../services/api';
import '../styles/publicPages.css';

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const compRes = await api.get(`/employers/${id}`);
        const employer = compRes.data?.data?.employer || compRes.data?.data;
        setCompany(employer);

        try {
          const jobsRes = await api.get('/jobs', { params: { company: id, limit: 10 } });
          setJobs(jobsRes.data?.jobs || jobsRes.data?.data?.jobs || []);
        } catch {
          setJobs([]);
        }
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="pp-loading"><Loader2 size={32} className="pp-spin" /><p>Loading company...</p></div>;
  if (!company) return <div className="pp-error-state"><Building2 size={48} /><h2>Company Not Found</h2><Link to="/companies" className="pp-btn-primary">Browse Companies</Link></div>;

  const profile = company.profile || {};

  return (
    <div className="pp-page">
      <div className="pp-container">
        <Link to="/companies" className="pp-back-link"><ArrowLeft size={15} /> All Companies</Link>

        <div className="pp-company-hero">
          <div className="pp-company-hero-logo"><Building2 size={36} /></div>
          <div>
            <h1>{profile.companyName || company.name}</h1>
            <p className="pp-muted">{profile.industry || 'Industry not specified'}</p>
          </div>
        </div>

        <div className="pp-company-detail-grid">
          <div className="pp-card">
            <h3>About</h3>
            <p className="pp-prose">{profile.companyDescription || 'No description available.'}</p>

            {profile.companyWebsite && (
              <p className="pp-meta-item"><Globe size={14} /> <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer">{profile.companyWebsite}</a></p>
            )}
          </div>

          <div className="pp-card">
            <h3>Company Info</h3>
            <div className="pp-info-rows">
              <div className="pp-info-row"><MapPin size={14} /><span>{profile.location || 'Not specified'}</span></div>
              <div className="pp-info-row"><Users size={14} /><span>{profile.companySize || '—'} employees</span></div>
              <div className="pp-info-row"><Mail size={14} /><span>{company.email}</span></div>
              {profile.phone && <div className="pp-info-row"><Phone size={14} /><span>{profile.phone}</span></div>}
            </div>
          </div>
        </div>

        {jobs.length > 0 && (
          <>
            <div className="pp-section-header">
              <Briefcase size={18} />
              <h2>Open Positions ({jobs.length})</h2>
            </div>
            <div className="pp-job-list">
              {jobs.map(j => (
                <Link to={`/jobs/${j._id}`} key={j._id} className="pp-job-list-item">
                  <div>
                    <h4>{j.title}</h4>
                    <p className="pp-muted"><MapPin size={13} /> {j.location || 'Remote'} · {j.jobType}</p>
                  </div>
                  <span className="pp-tag">{j.jobType}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
