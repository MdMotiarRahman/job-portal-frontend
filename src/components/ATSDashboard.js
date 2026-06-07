import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Target, AlertCircle, Loader } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/atsDashboard.css';

const ATSDashboard = () => {
  const [stats, setStats] = useState(null);
  const [employerStats, setEmployerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch pipeline stats
        const statsResponse = await atsService.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        // Fetch employer-specific stats
        try {
          const employerResponse = await atsService.getEmployerStats();
          if (employerResponse.success) {
            setEmployerStats(employerResponse.data);
          }
        } catch (err) {
          console.error('Failed to fetch employer stats:', err);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="ats-dashboard-container">
        <div className="ats-dashboard-loading">
          <Loader size={40} className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ats-dashboard-container">
        <div className="ats-dashboard-error">
          <AlertCircle size={40} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stageBreakdown = stats?.stageBreakdown || {};
  const totalApplications = stats?.totalApplications || 0;
  const avgTimeToHire = stats?.avgTimeToHire || null;

  return (
    <div className="ats-dashboard-container">
      {/* Header */}
      <div className="ats-dashboard-header">
        <h1>Hiring Dashboard</h1>
        <p>Overview of your recruitment pipeline and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="ats-metrics-grid">
        <MetricCard
          icon={<Users size={24} />}
          label="Total Applications"
          value={totalApplications}
          color="#667eea"
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Avg Time to Hire"
          value={avgTimeToHire ? `${avgTimeToHire} days` : 'N/A'}
          color="#f59e0b"
        />
        <MetricCard
          icon={<Target size={24} />}
          label="Shortlisted"
          value={stageBreakdown.Shortlisted?.count || 0}
          color="#10b981"
        />
        <MetricCard
          icon={<TrendingUp size={24} />}
          label="Offers Sent"
          value={stageBreakdown['Offer Extended']?.count || 0}
          color="#ec4899"
        />
      </div>

      {/* Charts Section */}
      <div className="ats-charts-section">
        {/* Pipeline Funnel Chart */}
        <div className="ats-chart-card">
          <h2>Pipeline Funnel</h2>
          <PipelineFunnelChart stageBreakdown={stageBreakdown} />
        </div>

        {/* Stage Breakdown Chart */}
        <div className="ats-chart-card">
          <h2>Applications by Stage</h2>
          <StageBreakdownChart stageBreakdown={stageBreakdown} />
        </div>
      </div>

      {/* Detailed Stage Breakdown */}
      <div className="ats-detailed-breakdown">
        <h2>Detailed Stage Breakdown</h2>
        <div className="ats-stage-table">
          <div className="ats-table-header">
            <div className="ats-table-cell stage-cell">Stage</div>
            <div className="ats-table-cell count-cell">Count</div>
            <div className="ats-table-cell percentage-cell">Percentage</div>
            <div className="ats-table-cell bar-cell">Visual</div>
          </div>
          <div className="ats-table-body">
            {Object.entries(stageBreakdown).map(([stage, data]) => (
              <div key={stage} className="ats-table-row">
                <div className="ats-table-cell stage-cell">
                  <span className="stage-color" style={{ backgroundColor: data.color }} />
                  {stage}
                </div>
                <div className="ats-table-cell count-cell">{data.count}</div>
                <div className="ats-table-cell percentage-cell">{data.percentage}%</div>
                <div className="ats-table-cell bar-cell">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${data.percentage}%`,
                        backgroundColor: data.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="ats-conversion-rates">
        <h2>Stage Conversion Rates</h2>
        <ConversionRatesChart stageBreakdown={stageBreakdown} />
      </div>

      {/* Tips & Recommendations */}
      <div className="ats-recommendations">
        <h2>Recommendations</h2>
        <RecommendationsList stageBreakdown={stageBreakdown} totalApplications={totalApplications} />
      </div>
    </div>
  );
};

// ─── Metric Card Component ────────────────────────────────────────
const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div className="ats-metric-card">
      <div className="ats-metric-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="ats-metric-content">
        <p className="ats-metric-label">{label}</p>
        <p className="ats-metric-value">{value}</p>
      </div>
    </div>
  );
};

// ─── Pipeline Funnel Chart ────────────────────────────────────────
const PipelineFunnelChart = ({ stageBreakdown }) => {
  const stages = [
    'Applied',
    'Screening',
    'Reviewing',
    'Shortlisted',
    'Interview Scheduled',
    'Assessment',
    'Offer Extended',
    'Accepted',
  ];

  const maxCount = Math.max(
    ...stages.map((stage) => stageBreakdown[stage]?.count || 0)
  );

  return (
    <div className="ats-funnel-chart">
      {stages.map((stage, idx) => {
        const count = stageBreakdown[stage]?.count || 0;
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={stage} className="ats-funnel-item">
            <div className="ats-funnel-bar" style={{ width: `${percentage}%` }}>
              <div className="ats-funnel-bar-inner" style={{ backgroundColor: stageBreakdown[stage]?.color }}>
                <span className="ats-funnel-label">
                  {stage} ({count})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Stage Breakdown Chart ────────────────────────────────────────
const StageBreakdownChart = ({ stageBreakdown }) => {
  const stages = Object.entries(stageBreakdown)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="ats-bar-chart">
      {stages.map(([stage, data]) => (
        <div key={stage} className="ats-bar-item">
          <div className="ats-bar-label">{stage}</div>
          <div className="ats-bar-container">
            <div
              className="ats-bar"
              style={{ width: '100%', backgroundColor: data.color }}
            >
              <span className="ats-bar-value">{data.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Conversion Rates Chart ───────────────────────────────────────
const ConversionRatesChart = ({ stageBreakdown }) => {
  const transitions = [
    { from: 'Applied', to: 'Screening', label: 'Applied → Screening' },
    { from: 'Screening', to: 'Reviewing', label: 'Screening → Reviewing' },
    { from: 'Reviewing', to: 'Shortlisted', label: 'Reviewing → Shortlisted' },
    { from: 'Shortlisted', to: 'Interview Scheduled', label: 'Shortlisted → Interview' },
    { from: 'Interview Scheduled', to: 'Assessment', label: 'Interview → Assessment' },
    { from: 'Assessment', to: 'Offer Extended', label: 'Assessment → Offer' },
    { from: 'Offer Extended', to: 'Accepted', label: 'Offer → Accepted' },
  ];

  return (
    <div className="ats-conversion-table">
      <div className="ats-conversion-header">
        <div className="ats-conversion-cell">Transition</div>
        <div className="ats-conversion-cell">From Stage</div>
        <div className="ats-conversion-cell">To Stage</div>
        <div className="ats-conversion-cell">Conversion Rate</div>
      </div>
      {transitions.map((transition) => {
        const fromCount = stageBreakdown[transition.from]?.count || 0;
        const toCount = stageBreakdown[transition.to]?.count || 0;
        const rate = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;

        return (
          <div key={transition.label} className="ats-conversion-row">
            <div className="ats-conversion-cell">{transition.label}</div>
            <div className="ats-conversion-cell">{fromCount}</div>
            <div className="ats-conversion-cell">{toCount}</div>
            <div className="ats-conversion-cell">
              <div className="ats-conversion-rate" style={{ color: rate > 50 ? '#10b981' : '#f59e0b' }}>
                {rate}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Recommendations Component ────────────────────────────────────
const RecommendationsList = ({ stageBreakdown, totalApplications }) => {
  const recommendations = [];

  const appliedCount = stageBreakdown.Applied?.count || 0;
  const screeningCount = stageBreakdown.Screening?.count || 0;
  const acceptedCount = stageBreakdown.Accepted?.count || 0;
  const rejectedCount = stageBreakdown.Rejected?.count || 0;

  if (appliedCount > screeningCount * 5) {
    recommendations.push({
      type: 'warning',
      message: 'High volume of applications in screening. Consider screening more applications.',
    });
  }

  if (acceptedCount === 0 && totalApplications > 20) {
    recommendations.push({
      type: 'info',
      message: 'No offers accepted yet. Review your offer strategy or compensation package.',
    });
  }

  if (rejectedCount > totalApplications * 0.5) {
    recommendations.push({
      type: 'info',
      message: 'High rejection rate. Consider refining your job requirements or screening criteria.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: '✓ Your hiring pipeline looks healthy! Keep up the good work.',
    });
  }

  return (
    <div className="ats-recommendations-list">
      {recommendations.map((rec, idx) => (
        <div key={idx} className={`ats-recommendation ats-recommendation-${rec.type}`}>
          {rec.message}
        </div>
      ))}
    </div>
  );
};

export default ATSDashboard;
