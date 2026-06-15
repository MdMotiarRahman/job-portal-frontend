import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Search, Loader2 } from 'lucide-react';
import '../styles/publicPages.css';

const CompanyListing = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/employers?limit=20');
        const data = await res.json();
        setCompanies(data.data?.employers || data.employers || []);
      } catch { setCompanies([]); }
      finally { setLoading(false); }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c =>
    c.profile?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pp-page">
      <div className="pp-container">
        <div className="pp-page-header">
          <h1>Companies</h1>
          <p>Discover top employers and explore open positions across leading organizations.</p>
        </div>

        <div className="pp-search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="pp-loading"><Loader2 size={28} className="pp-spin" /><p>Loading companies...</p></div>
        ) : filtered.length === 0 ? (
          <div className="pp-empty"><Building2 size={48} /><p>No companies found</p></div>
        ) : (
          <div className="pp-company-grid">
            {filtered.map(c => (
              <Link to={`/companies/${c._id}`} key={c._id} className="pp-company-card">
                <div className="pp-company-card-logo"><Building2 size={28} /></div>
                <div className="pp-company-card-body">
                  <h3>{c.profile?.companyName || c.name}</h3>
                  <p className="pp-muted">{c.profile?.industry || 'Industry not specified'}</p>
                  {c.profile?.location && <p className="pp-meta-item"><MapPin size={13} /> {c.profile.location}</p>}
                  {c.profile?.companySize && <p className="pp-meta-item"><Briefcase size={13} /> {c.profile.companySize} employees</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyListing;
