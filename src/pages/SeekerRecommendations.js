import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Building2,
  Briefcase,
  X,
  Search,
} from 'lucide-react';
import recommendationService from '../services/recommendationService';
import '../styles/seekerRecommendations.css';

const SeekerRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await recommendationService.getJobRecommendations(20);
        if (res.success) {
          setRecommendations(res.data || []);
        }
      } catch (err) {
        console.log('Recommendations not available:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter !== 'all') {
      if (filter === 'high' && rec.matchScore < 70) return false;
      if (filter === 'mid' && (rec.matchScore < 40 || rec.matchScore >= 70)) return false;
      if (filter === 'low' && rec.matchScore >= 40) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const title = rec.job?.title?.toLowerCase() || '';
      const company = rec.job?.company?.name?.toLowerCase() || '';
      const skills = (rec.job?.skills || []).map((s) => s.toLowerCase()).join(' ');
      if (!title.includes(term) && !company.includes(term) && !skills.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'mid';
    return 'low';
  };

  if (loading) {
    return (
      <div className="rec-page">
        <div className="rec-loading">
          <div className="rec-spinner" />
          <p>Finding jobs that match your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rec-page">
      <div className="rec-page-header">
        <div className="rec-page-title">
          <Sparkles size={22} />
          <h1>Recommended for You</h1>
        </div>
        <p className="rec-page-subtitle">
          Jobs matched by AI based on your skills, experience, and preferences
        </p>
      </div>

      <div className="rec-filters">
        <div className="rec-search-group">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="rec-search-clear" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="rec-filter-btns">
          <button
            className={`rec-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`rec-filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            <TrendingUp size={14} />
            Strong Match
          </button>
          <button
            className={`rec-filter-btn ${filter === 'mid' ? 'active' : ''}`}
            onClick={() => setFilter('mid')}
          >
            Moderate Match
          </button>
          <button
            className={`rec-filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low Match
          </button>
        </div>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="rec-empty">
          <Briefcase size={48} />
          <h3>No recommendations found</h3>
          <p>
            {filter !== 'all' || searchTerm
              ? 'Try adjusting your filters'
              : 'Complete your profile to get better recommendations'}
          </p>
        </div>
      ) : (
        <div className="rec-grid">
          {filteredRecommendations.map((rec) => (
            <div className="rec-card" key={rec.job._id}>
              <div className="rec-card-top">
                <div className="rec-card-info">
                  <h3>{rec.job.title}</h3>
                  <p className="rec-card-company">
                    <Building2 size={14} />
                    {rec.job.company?.name || 'N/A'}
                  </p>
                  <p className="rec-card-location">
                    <MapPin size={14} />
                    {rec.job.location}
                  </p>
                </div>
                <div className={`rec-card-score ${getScoreColor(rec.matchScore)}`}>
                  <span className="rec-card-score-value">{rec.matchScore}%</span>
                  <span className="rec-card-score-label">Match</span>
                </div>
              </div>

              <div className="rec-card-skills">
                {(rec.job.skills || []).slice(0, 5).map((skill, i) => (
                  <span className="rec-card-skill" key={i}>{skill}</span>
                ))}
                {(rec.job.skills || []).length > 5 && (
                  <span className="rec-card-skill-more">+{rec.job.skills.length - 5}</span>
                )}
              </div>

              <div className="rec-card-meta">
                <span>{rec.job.jobType}</span>
                <span>{rec.job.experienceLevel}</span>
                {rec.job.salary?.min && (
                  <span>
                    ${rec.job.salary.min.toLocaleString()}
                    {rec.job.salary.max ? ` - $${rec.job.salary.max.toLocaleString()}` : ''}
                  </span>
                )}
              </div>

              <div className="rec-card-reasons">
                {rec.reasons?.slice(0, 3).map((reason, i) => (
                  <span className="rec-card-reason" key={i}>
                    <TrendingUp size={12} />
                    {reason}
                  </span>
                ))}
              </div>

              <Link to={`/apply-job/${rec.job._id}`} className="rec-card-apply">
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeekerRecommendations;
