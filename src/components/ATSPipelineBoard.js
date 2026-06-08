import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, ChevronDown, AlertCircle, Loader, RefreshCw, Eye, ArrowRightLeft, Clock } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/atsPipelineBoard.css';
import MoveApplicationModal from './MoveApplicationModal';
import CandidateDetailModal from './CandidateDetailModal';

const ALL_STAGES = [
  'Applied',
  'Screening',
  'Reviewing',
  'Shortlisted',
  'Interview Scheduled',
  'Assessment',
  'Offer Extended',
  'Accepted',
  'Rejected',
  'Withdrawn',
];

const STAGE_COLORS = {
  Applied: '#6B7280',
  Screening: '#3B82F6',
  Reviewing: '#8B5CF6',
  Shortlisted: '#F59E0B',
  'Interview Scheduled': '#EC4899',
  Assessment: '#14B8A6',
  'Offer Extended': '#10B981',
  Accepted: '#22C55E',
  Rejected: '#EF4444',
  Withdrawn: '#9CA3AF',
};

const ATSPipelineBoard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (selectedStageFilter) filters.stage = selectedStageFilter;
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      const response = await atsService.getBoard(filters);
      if (response.success) {
        const board = response.data.board || {};
        const allApps = [];
        Object.entries(board).forEach(([stage, apps]) => {
          if (Array.isArray(apps)) {
            apps.forEach((app) => {
              allApps.push({ ...app, stage });
            });
          }
        });
        allApps.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setApplications(allApps);
      }
    } catch (err) {
      console.error('ATS Board Error:', err);
      setError(err.message || err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [selectedStageFilter, searchTerm]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, [fetchApplications]);

  const handleMoveStage = (application) => {
    setSelectedApplication(application);
    setMoveModalOpen(true);
  };

  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  const closeModals = () => {
    setSelectedApplication(null);
    setMoveModalOpen(false);
    setDetailModalOpen(false);
  };

  const stageCounts = useMemo(() => {
    const counts = {};
    ALL_STAGES.forEach((s) => (counts[s] = 0));
    applications.forEach((app) => {
      if (counts[app.stage] !== undefined) counts[app.stage]++;
    });
    return counts;
  }, [applications]);

  if (loading && applications.length === 0) {
    return (
      <div className="ats-board-container">
        <div className="ats-loading">
          <Loader size={32} className="spinner" />
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ats-board-container">
      {error && (
        <div className="ats-alert ats-alert-error">
          <AlertCircle size={16} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ats-alert-close">×</button>
        </div>
      )}

      <div className="ats-board-controls">
        <div className="ats-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ats-search-input"
          />
          {searchTerm && (
            <button className="ats-clear-search" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>

        <div className="ats-filter-group">
          <button className="ats-filter-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter size={14} />
            Stage
            <ChevronDown size={12} />
          </button>
          {filterOpen && (
            <div className="ats-filter-dropdown">
              <button
                className={`ats-filter-option ${!selectedStageFilter ? 'active' : ''}`}
                onClick={() => { setSelectedStageFilter(''); setFilterOpen(false); }}
              >
                All Stages
              </button>
              {ALL_STAGES.map((stage) => (
                <button
                  key={stage}
                  className={`ats-filter-option ${selectedStageFilter === stage ? 'active' : ''}`}
                  onClick={() => { setSelectedStageFilter(stage); setFilterOpen(false); }}
                >
                  <span className="ats-filter-color" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                  {stage} ({stageCounts[stage]})
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="ats-refresh-btn" onClick={fetchApplications} type="button">
          <RefreshCw size={14} />
          Refresh
        </button>

        <div className="ats-stats-summary">
          <span className="ats-stat">
            <strong>{applications.length}</strong> applications
          </span>
        </div>
      </div>

      <div className="ats-table-wrap">
        <table className="ats-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Stage</th>
              <th>Applied</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="ats-empty-state">
                  {searchTerm || selectedStageFilter
                    ? 'No applications match your filters.'
                    : 'No applications in the pipeline yet.'}
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="ats-candidate-cell">
                      <div
                        className="ats-candidate-avatar"
                        style={{ backgroundColor: STAGE_COLORS[app.stage] || '#6B7280' }}
                      >
                        {app.seeker?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <strong>{app.seeker?.name || 'Unknown'}</strong>
                        <div className="ats-muted-text">{app.seeker?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{app.job?.title || 'N/A'}</strong>
                    <div className="ats-muted-text">{app.job?.location || ''}</div>
                  </td>
                  <td>
                    <span
                      className="ats-stage-badge"
                      style={{ backgroundColor: STAGE_COLORS[app.stage] || '#6B7280' }}
                    >
                      {app.stage}
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(app.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="ats-actions-cell">
                      <button
                        className="ats-action-btn"
                        onClick={() => handleViewDetail(app)}
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        className="ats-action-btn ats-action-primary"
                        onClick={() => handleMoveStage(app)}
                      >
                        <ArrowRightLeft size={13} />
                        Move
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detailModalOpen && selectedApplication && (
        <CandidateDetailModal
          application={selectedApplication}
          stageColor={STAGE_COLORS[selectedApplication.stage]}
          onClose={closeModals}
          onMoveClick={() => { setDetailModalOpen(false); setMoveModalOpen(true); }}
        />
      )}

      {moveModalOpen && selectedApplication && (
        <MoveApplicationModal
          application={selectedApplication}
          stages={ALL_STAGES}
          onClose={closeModals}
          onSuccess={() => { fetchApplications(); closeModals(); }}
        />
      )}
    </div>
  );
};

export default ATSPipelineBoard;
