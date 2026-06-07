import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Plus, ChevronDown, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import atsService from '../services/atsService';
import '../styles/atsPipelineBoard.css';
import CandidateCard from './CandidateCard';
import MoveApplicationModal from './MoveApplicationModal';

const STAGES = [
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

const ATSPipelineBoard = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState({});
  const [stageColors, setStageColors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('');
  const [expandedStages, setExpandedStages] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [draggedCard, setDraggedCard] = useState(null);
  const [stats, setStats] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch pipeline data
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
      console.error('Failed to fetch board:', err);
      setError(err.message || 'Failed to load pipeline board');
    } finally {
      setLoading(false);
    }
  }, [selectedStageFilter, searchTerm]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await atsService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Initialize expanded stages
  useEffect(() => {
    const initialExpanded = {};
    STAGES.forEach((stage) => {
      initialExpanded[stage] = true;
    });
    setExpandedStages(initialExpanded);
  }, []);

  // Handle drag start
  const handleDragStart = (e, application, fromStage) => {
    setDraggedCard({ application, fromStage });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop on stage
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
        // Update local state
        setBoard((prev) => {
          const updated = { ...prev };
          
          // Remove from old stage
          updated[draggedCard.fromStage] = updated[draggedCard.fromStage].filter(
            (app) => app._id !== draggedCard.application._id
          );
          
          // Add to new stage
          updated[toStage] = [
            ...updated[toStage],
            { ...draggedCard.application, stage: toStage },
          ];
          
          return updated;
        });

        // Refresh stats
        fetchStats();
      }
    } catch (err) {
      setError(`Failed to move application: ${err.message || 'Unknown error'}`);
    } finally {
      setDraggedCard(null);
    }
  };

  // Handle click on card to view details
  const handleCardClick = (application) => {
    setSelectedApplication(application);
  };

  // Handle move to stage button
  const handleMoveClick = (application) => {
    setSelectedApplication(application);
    setMoveModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setSelectedApplication(null);
    setMoveModalOpen(false);
  };

  // Toggle stage expansion
  const toggleStageExpansion = (stage) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  // Calculate filtered applications
  const filteredBoard = useMemo(() => {
    if (!searchTerm.trim() && !selectedStageFilter) {
      return board;
    }

    const filtered = {};
    STAGES.forEach((stage) => {
      filtered[stage] = (board[stage] || []).filter((app) => {
        if (selectedStageFilter && app.stage !== selectedStageFilter) {
          return false;
        }

        if (searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          const matchesName = app.seeker?.name?.toLowerCase().includes(search);
          const matchesEmail = app.seeker?.email?.toLowerCase().includes(search);
          const matchesJob = app.job?.title?.toLowerCase().includes(search);
          
          return matchesName || matchesEmail || matchesJob;
        }

        return true;
      });
    });

    return filtered;
  }, [board, searchTerm, selectedStageFilter]);

  // Get active application count
  const totalApplications = useMemo(() => {
    return Object.values(filteredBoard).reduce((sum, apps) => sum + apps.length, 0);
  }, [filteredBoard]);

  if (loading && !Object.keys(board).length) {
    return (
      <div className="ats-board-container">
        <div className="ats-loading">
          <Loader size={40} className="spinner" />
          <p>Loading pipeline board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ats-board-container">
      {/* Header */}
      <div className="ats-board-header">
        <div>
          <h1>Hiring Pipeline</h1>
          <p>Manage candidates through the hiring process</p>
        </div>
        <div className="ats-board-actions">
          <button
            className="ats-btn ats-btn-primary"
            onClick={() => navigate('/admin/applications')}
          >
            <Plus size={16} />
            View Table
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="ats-alert ats-alert-error">
          <AlertCircle size={18} />
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
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ats-search-input"
          />
          {searchTerm && (
            <button
              className="ats-clear-search"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="ats-filter-group">
          <button
            className="ats-filter-btn"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={16} />
            Stage Filter
            <ChevronDown size={14} />
          </button>

          {filterOpen && (
            <div className="ats-filter-dropdown">
              <button
                className={`ats-filter-option ${!selectedStageFilter ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStageFilter('');
                  setFilterOpen(false);
                }}
              >
                All Stages
              </button>
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  className={`ats-filter-option ${selectedStageFilter === stage ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedStageFilter(stage);
                    setFilterOpen(false);
                  }}
                >
                  <span
                    className="ats-filter-color"
                    style={{ backgroundColor: stageColors[stage] }}
                  />
                  {stage}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ats-stats-summary">
          <span className="ats-stat">
            <strong>{totalApplications}</strong> applications
          </span>
          {stats?.data?.totalApplications && (
            <span className="ats-stat">
              Avg time to hire: <strong>{stats.data.avgTimeToHire || 'N/A'} days</strong>
            </span>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="ats-kanban-board">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="ats-stage-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnStage(e, stage)}
          >
            {/* Column Header */}
            <div className="ats-stage-header">
              <div className="ats-stage-title-row">
                <button
                  className="ats-expand-btn"
                  onClick={() => toggleStageExpansion(stage)}
                >
                  <ChevronDown
                    size={16}
                    className={`${expandedStages[stage] ? 'expanded' : 'collapsed'}`}
                  />
                </button>
                <div className="ats-stage-info">
                  <div
                    className="ats-stage-color"
                    style={{ backgroundColor: stageColors[stage] }}
                  />
                  <h3 className="ats-stage-title">{stage}</h3>
                </div>
              </div>
              <span className="ats-stage-count">
                {(filteredBoard[stage] || []).length}
              </span>
            </div>

            {/* Applications in Stage */}
            {expandedStages[stage] && (
              <div className="ats-stage-content">
                {(filteredBoard[stage] || []).length > 0 ? (
                  (filteredBoard[stage] || []).map((application) => (
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
                  <div className="ats-empty-stage">
                    <p>No applications yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Candidate Detail Modal */}
      {selectedApplication && !moveModalOpen && (
        <CandidateDetailModal
          application={selectedApplication}
          stageColor={stageColors[selectedApplication.stage]}
          onClose={closeModals}
          onMoveClick={() => setMoveModalOpen(true)}
          onRefresh={fetchBoard}
        />
      )}

      {/* Move Application Modal */}
      {moveModalOpen && selectedApplication && (
        <MoveApplicationModal
          application={selectedApplication}
          stages={STAGES}
          onClose={closeModals}
          onSuccess={() => {
            fetchBoard();
            fetchStats();
            closeModals();
          }}
        />
      )}
    </div>
  );
};

// ─── Candidate Detail Modal ───────────────────────────────────────
const CandidateDetailModal = ({ application, stageColor, onClose, onMoveClick, onRefresh }) => {
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await atsService.getStageHistory(application._id);
        if (response.success) {
          setStageHistory(response.data || []);
        }
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
        {/* Header */}
        <div className="ats-modal-header">
          <div className="ats-candidate-header">
            <div className="ats-candidate-avatar">
              {application.seeker?.avatar ? (
                <img src={application.seeker.avatar} alt={application.seeker.name} />
              ) : (
                <div className="ats-avatar-placeholder">
                  {application.seeker?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2>{application.seeker?.name || 'Unknown Candidate'}</h2>
              <p>{application.job?.title || 'Unknown Position'}</p>
            </div>
          </div>
          <button className="ats-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="ats-modal-content">
          {/* Candidate Info */}
          <section className="ats-modal-section">
            <h3>Candidate Information</h3>
            <div className="ats-info-grid">
              <div className="ats-info-item">
                <label>Email</label>
                <p>{application.seeker?.email || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Current Stage</label>
                <p>
                  <span
                    className="ats-stage-badge"
                    style={{ backgroundColor: stageColor }}
                  >
                    {application.stage}
                  </span>
                </p>
              </div>
              <div className="ats-info-item">
                <label>Applied Date</label>
                <p>{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="ats-info-item">
                <label>Last Updated</label>
                <p>{new Date(application.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          {/* Job Info */}
          <section className="ats-modal-section">
            <h3>Position Details</h3>
            <div className="ats-info-grid">
              <div className="ats-info-item">
                <label>Position</label>
                <p>{application.job?.title || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Company</label>
                <p>{application.job?.companyName || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Location</label>
                <p>{application.job?.location || 'N/A'}</p>
              </div>
              <div className="ats-info-item">
                <label>Employment Type</label>
                <p>{application.job?.employmentType || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Stage History */}
          <section className="ats-modal-section">
            <h3>Stage Progression</h3>
            {loading ? (
              <p>Loading history...</p>
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
                      {record.movedBy && (
                        <p className="ats-timeline-by">
                          Moved by: {record.movedBy.name} ({record.movedByRole})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No stage history available</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="ats-modal-footer">
          <button className="ats-btn ats-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="ats-btn ats-btn-primary" onClick={onMoveClick}>
            Move to Different Stage
          </button>
        </div>
      </div>
    </div>
  );
};

export default ATSPipelineBoard;
