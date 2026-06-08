import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, ChevronDown, AlertCircle, Loader, ChevronRight } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/atsPipelineBoard.css';
import CandidateCard from './CandidateCard';
import MoveApplicationModal from './MoveApplicationModal';

const CORE_STAGES = [
  'Applied',
  'Screening',
  'Reviewing',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Extended',
];

const OUTCOME_STAGES = ['Accepted', 'Rejected', 'Withdrawn'];

const ALL_STAGES = [...CORE_STAGES, ...OUTCOME_STAGES];

const ATSPipelineBoard = () => {
  const [board, setBoard] = useState({});
  const [stageColors, setStageColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [draggedCard, setDraggedCard] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedOutcomes, setExpandedOutcomes] = useState(false);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (selectedStageFilter) filters.stage = selectedStageFilter;
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      const response = await atsService.getBoard(filters);
      if (response.success) {
        setBoard(response.data.board || {});
        setStageColors(response.data.stageColors || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to load pipeline board');
    } finally {
      setLoading(false);
    }
  }, [selectedStageFilter, searchTerm]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleDragStart = (e, application, fromStage) => {
    setDraggedCard({ application, fromStage });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnStage = async (e, toStage) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.fromStage === toStage) {
      setDraggedCard(null);
      return;
    }
    try {
      const response = await atsService.moveApplication(
        draggedCard.application._id,
        { stage: toStage }
      );
      if (response.success) {
        setBoard((prev) => {
          const updated = { ...prev };
          updated[draggedCard.fromStage] = (updated[draggedCard.fromStage] || []).filter(
            (app) => app._id !== draggedCard.application._id
          );
          updated[toStage] = [
            ...(updated[toStage] || []),
            { ...draggedCard.application, stage: toStage },
          ];
          return updated;
        });
      }
    } catch (err) {
      setError(`Failed to move: ${err.message || 'Unknown error'}`);
    } finally {
      setDraggedCard(null);
    }
  };

  const handleCardClick = (application) => setSelectedApplication(application);
  const handleMoveClick = (application) => {
    setSelectedApplication(application);
    setMoveModalOpen(true);
  };
  const closeModals = () => {
    setSelectedApplication(null);
    setMoveModalOpen(false);
  };

  const filteredBoard = useMemo(() => {
    if (!searchTerm.trim() && !selectedStageFilter) return board;
    const filtered = {};
    ALL_STAGES.forEach((stage) => {
      filtered[stage] = (board[stage] || []).filter((app) => {
        if (selectedStageFilter && app.stage !== selectedStageFilter) return false;
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          return (
            app.seeker?.name?.toLowerCase().includes(s) ||
            app.seeker?.email?.toLowerCase().includes(s) ||
            app.job?.title?.toLowerCase().includes(s)
          );
        }
        return true;
      });
    });
    return filtered;
  }, [board, searchTerm, selectedStageFilter]);

  const totalApplications = useMemo(
    () => Object.values(filteredBoard).reduce((sum, apps) => sum + apps.length, 0),
    [filteredBoard]
  );

  const outcomeCounts = useMemo(() => {
    const counts = {};
    OUTCOME_STAGES.forEach((stage) => {
      counts[stage] = (filteredBoard[stage] || []).length;
    });
    return counts;
  }, [filteredBoard]);

  const totalOutcomes = useMemo(
    () => Object.values(outcomeCounts).reduce((a, b) => a + b, 0),
    [outcomeCounts]
  );

  if (loading && !Object.keys(board).length) {
    return (
      <div className="ats-board-container">
        <div className="ats-loading">
          <Loader size={32} className="spinner" />
          <p>Loading pipeline...</p>
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

      {/* Controls */}
      <div className="ats-board-controls">
        <div className="ats-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search candidates..."
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
                  <span className="ats-filter-color" style={{ backgroundColor: stageColors[stage] }} />
                  {stage}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ats-stats-summary">
          <span className="ats-stat">
            <strong>{totalApplications}</strong> total
          </span>
        </div>
      </div>

      {/* Core Pipeline */}
      <div className="ats-kanban-board">
        {CORE_STAGES.map((stage) => {
          const apps = filteredBoard[stage] || [];
          return (
            <div
              key={stage}
              className="ats-stage-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnStage(e, stage)}
            >
              <div className="ats-stage-header">
                <div className="ats-stage-info">
                  <div className="ats-stage-color" style={{ backgroundColor: stageColors[stage] }} />
                  <h3 className="ats-stage-title">{stage}</h3>
                </div>
                <span className="ats-stage-count">{apps.length}</span>
              </div>
              <div className="ats-stage-content">
                {apps.length > 0 ? (
                  apps.map((application) => (
                    <div
                      key={application._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, application, stage)}
                      className={`ats-card-wrapper ${draggedCard?.application._id === application._id ? 'dragging' : ''}`}
                    >
                      <CandidateCard
                        application={application}
                        stageColor={stageColors[stage]}
                        onClick={() => handleCardClick(application)}
                        onMoveClick={() => handleMoveClick(application)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="ats-empty-stage">Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outcomes Summary Bar */}
      <div className="ats-outcomes-bar">
        <button
          className="ats-outcomes-toggle"
          onClick={() => setExpandedOutcomes(!expandedOutcomes)}
        >
          <div className="ats-outcomes-left">
            <ChevronRight size={16} className={`ats-outcomes-chevron ${expandedOutcomes ? 'open' : ''}`} />
            <span className="ats-outcomes-label">Outcomes</span>
            <div className="ats-outcomes-chips">
              {OUTCOME_STAGES.map((stage) => (
                <span key={stage} className="ats-outcome-chip" style={{ borderColor: stageColors[stage] }}>
                  <span className="ats-outcome-dot" style={{ backgroundColor: stageColors[stage] }} />
                  {stage}
                  <strong>{outcomeCounts[stage]}</strong>
                </span>
              ))}
            </div>
          </div>
          <span className="ats-outcomes-total">{totalOutcomes} candidates</span>
        </button>

        {expandedOutcomes && (
          <div className="ats-outcomes-grid">
            {OUTCOME_STAGES.map((stage) => {
              const apps = filteredBoard[stage] || [];
              return (
                <div
                  key={stage}
                  className="ats-outcome-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnStage(e, stage)}
                >
                  <div className="ats-outcome-col-header">
                    <div className="ats-stage-color" style={{ backgroundColor: stageColors[stage] }} />
                    <h4>{stage}</h4>
                    <span className="ats-stage-count">{apps.length}</span>
                  </div>
                  <div className="ats-outcome-col-body">
                    {apps.length > 0 ? (
                      apps.map((application) => (
                        <div
                          key={application._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, application, stage)}
                          className={`ats-card-wrapper ${draggedCard?.application._id === application._id ? 'dragging' : ''}`}
                        >
                          <CandidateCard
                            application={application}
                            stageColor={stageColors[stage]}
                            onClick={() => handleCardClick(application)}
                            onMoveClick={() => handleMoveClick(application)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="ats-empty-stage">None</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedApplication && !moveModalOpen && (
        <CandidateDetailModal
          application={selectedApplication}
          stageColor={stageColors[selectedApplication.stage]}
          onClose={closeModals}
          onMoveClick={() => setMoveModalOpen(true)}
          onRefresh={fetchBoard}
        />
      )}

      {moveModalOpen && selectedApplication && (
        <MoveApplicationModal
          application={selectedApplication}
          stages={ALL_STAGES}
          onClose={closeModals}
          onSuccess={() => { fetchBoard(); closeModals(); }}
        />
      )}
    </div>
  );
};

const CandidateDetailModal = ({ application, stageColor, onClose, onMoveClick }) => {
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await atsService.getStageHistory(application._id);
        if (response.success) setStageHistory(response.data || []);
      } catch (err) {
        console.error('Failed to fetch stage history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [application._id]);

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-modal ats-candidate-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ats-modal-header">
          <div className="ats-candidate-header">
            <div className="ats-candidate-avatar" style={{ background: stageColor || 'var(--brand-primary)' }}>
              {application.seeker?.avatar ? (
                <img src={application.seeker.avatar} alt="" />
              ) : (
                <div className="ats-avatar-placeholder">
                  {application.seeker?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2>{application.seeker?.name || 'Unknown'}</h2>
              <p>{application.job?.title || 'Position'}</p>
            </div>
          </div>
          <button className="ats-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ats-modal-content">
          <section className="ats-modal-section">
            <h3>Details</h3>
            <div className="ats-info-grid">
              <div className="ats-info-item">
                <label>Email</label>
                <p>{application.seeker?.email || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Stage</label>
                <p>
                  <span className="ats-stage-badge" style={{ backgroundColor: stageColor }}>
                    {application.stage}
                  </span>
                </p>
              </div>
              <div className="ats-info-item">
                <label>Applied</label>
                <p>{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="ats-info-item">
                <label>Updated</label>
                <p>{new Date(application.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          <section className="ats-modal-section">
            <h3>Position</h3>
            <div className="ats-info-grid">
              <div className="ats-info-item">
                <label>Title</label>
                <p>{application.job?.title || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Location</label>
                <p>{application.job?.location || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="ats-modal-section">
            <h3>History</h3>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
            ) : stageHistory.length > 0 ? (
              <div className="ats-timeline">
                {stageHistory.map((record, idx) => (
                  <div key={idx} className="ats-timeline-item">
                    <div className="ats-timeline-marker" />
                    <div className="ats-timeline-content">
                      <p className="ats-timeline-stage">{record.stage}</p>
                      <p className="ats-timeline-date">
                        {new Date(record.createdAt).toLocaleString()}
                      </p>
                      {record.notes && <p className="ats-timeline-notes">{record.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No history</p>
            )}
          </section>
        </div>

        <div className="ats-modal-footer">
          <button className="ats-btn ats-btn-secondary" onClick={onClose}>Close</button>
          <button className="ats-btn ats-btn-primary" onClick={onMoveClick}>Move Stage</button>
        </div>
      </div>
    </div>
  );
};

export default ATSPipelineBoard;
