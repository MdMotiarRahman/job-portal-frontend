import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Target, AlertCircle, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/atsDashboard.css';

const ATSDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsResponse = await atsService.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="ats-simple-container">
        <div className="ats-state-center">
          <Loader2 size={32} className="animate-spin text-brand" />
          <p>Loading your ATS workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ats-simple-container">
        <div className="ats-state-center text-error">
          <AlertCircle size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stageBreakdown = stats?.stageBreakdown || {};
  const totalApplications = stats?.totalApplications || 0;
  const avgTimeToHire = stats?.avgTimeToHire || 0;

  const getCount = (stage) => stageBreakdown[stage]?.count || 0;

  return (
    <div className="ats-simple-container">
      <div className="ats-kpi-grid">
        <div className="ats-kpi-card">
          <div className="ats-kpi-icon bg-blue"><Users size={20} /></div>
          <div>
            <p className="ats-kpi-label">Total Applications</p>
            <h3 className="ats-kpi-value">{totalApplications}</h3>
          </div>
        </div>
        <div className="ats-kpi-card">
          <div className="ats-kpi-icon bg-green"><Target size={20} /></div>
          <div>
            <p className="ats-kpi-label">Shortlisted</p>
            <h3 className="ats-kpi-value">{getCount('Shortlisted')}</h3>
          </div>
        </div>
        <div className="ats-kpi-card">
          <div className="ats-kpi-icon bg-purple"><TrendingUp size={20} /></div>
          <div>
            <p className="ats-kpi-label">Offers Extended</p>
            <h3 className="ats-kpi-value">{getCount('Offer Extended')}</h3>
          </div>
        </div>
        <div className="ats-kpi-card">
          <div className="ats-kpi-icon bg-orange"><Clock size={20} /></div>
          <div>
            <p className="ats-kpi-label">Avg Time to Hire</p>
            <h3 className="ats-kpi-value">{avgTimeToHire ? `${avgTimeToHire} days` : 'N/A'}</h3>
          </div>
        </div>
      </div>

      <div className="ats-content-grid">
        <div className="ats-card">
          <h2 className="ats-card-title">Pipeline Overview</h2>
          <div className="ats-pipeline-list">
            {Object.entries(stageBreakdown).filter(([_, data]) => data.count > 0).sort((a, b) => b[1].count - a[1].count).map(([stage, data]) => (
              <div className="ats-pipeline-row" key={stage}>
                <div className="ats-pipeline-info">
                  <span className="ats-status-dot" style={{ backgroundColor: data.color }}></span>
                  <span className="ats-stage-name">{stage}</span>
                </div>
                <div className="ats-pipeline-track">
                  <div className="ats-pipeline-fill" style={{ width: `${Math.max(data.percentage, 2)}%`, backgroundColor: data.color }}></div>
                </div>
                <div className="ats-pipeline-stats">
                  <strong>{data.count}</strong>
                  <span>({data.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ats-card">
          <h2 className="ats-card-title">Hiring Insights</h2>
          <div className="ats-insights-list">
            {totalApplications === 0 ? (
              <div className="ats-insight-item neutral">
                <AlertCircle size={18} />
                <p>You haven't received any applications yet. Consider promoting your active job posts.</p>
              </div>
            ) : (
              <>
                <div className="ats-insight-item success">
                  <CheckCircle size={18} />
                  <p>Your pipeline is active with <strong>{totalApplications} total applications</strong> across all stages.</p>
                </div>
                
                {getCount('Applied') > (getCount('Screening') + getCount('Interview Scheduled')) * 2 && (
                  <div className="ats-insight-item warning">
                    <AlertCircle size={18} />
                    <p>High volume in "Applied" stage. Consider allocating time to screen new candidates.</p>
                  </div>
                )}
                
                {getCount('Offer Extended') > 0 && getCount('Accepted') === 0 && (
                  <div className="ats-insight-item highlight">
                    <ArrowRight size={18} />
                    <p>You have pending offers. Follow up with candidates to improve acceptance rates.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSDashboard;