import React, { useState, useEffect } from 'react';
import { X, Loader, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/candidateDetailModal.css';

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

const STAGE_ORDER = [
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

const CandidateDetailModal = ({ application, stageColor, onClose, onMoveClick }) => {
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
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

  const seeker = application.seeker;
  const job = application.job;
  const stage = application.stage;
  const stageIndex = STAGE_ORDER.indexOf(stage);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="cd-modal-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-modal-header">
          <div className="cd-header-left">
            <div className="cd-avatar" style={{ background: stageColor || 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              {seeker?.avatar ? (
                <img src={seeker.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
              ) : (
                seeker?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <h2>{seeker?.name || 'Unknown Candidate'}</h2>
              <p>{seeker?.email || ''}</p>
            </div>
          </div>
          <button className="cd-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cd-modal-body">
          {/* Pipeline progress */}
          <div className="cd-pipeline">
            {STAGE_ORDER.slice(0, 8).map((s, i) => {
              const isPast = stageIndex >= 0 && i < stageIndex;
              const isCurrent = s === stage;
              const isRejectedOrWithdrawn = stage === 'Rejected' || stage === 'Withdrawn';
              const isTerminalStage = s === 'Rejected' || s === 'Withdrawn';
              const highlight = isCurrent || (isRejectedOrWithdrawn && isTerminalStage && i === stageIndex);

              return (
                <div
                  key={s}
                  className={`cd-pipe-step ${isPast ? 'past' : ''} ${highlight ? 'current' : ''}`}
                >
                  <div
                    className="cd-pipe-dot"
                    style={{
                      backgroundColor: highlight || isPast ? STAGE_COLORS[s] : '#d1d5db',
                    }}
                  />
                  {i < 7 && (
                    <div
                      className="cd-pipe-line"
                      style={{
                        backgroundColor: isPast ? STAGE_COLORS[s] : '#e5e7eb',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="cd-pipeline-labels">
            {STAGE_ORDER.slice(0, 8).map((s) => (
              <span key={s} className={`cd-pipe-label ${s === stage ? 'active' : ''}`}>
                {s === 'Interview Scheduled' ? 'Interview' : s}
              </span>
            ))}
          </div>

          {/* Info cards */}
          <div className="cd-cards">
            <div className="cd-card">
              <h3>Contact</h3>
              <div className="cd-info-rows">
                <div className="cd-info-row">
                  <Mail size={14} />
                  <span>{seeker?.email || '—'}</span>
                </div>
                {seeker?.phone && (
                  <div className="cd-info-row">
                    <Phone size={14} />
                    <span>{seeker.phone}</span>
                  </div>
                )}
                {seeker?.location && (
                  <div className="cd-info-row">
                    <MapPin size={14} />
                    <span>{seeker.location}</span>
                  </div>
                )}
                {!seeker?.phone && !seeker?.location && !seeker?.email && (
                  <p className="cd-empty">No contact info</p>
                )}
              </div>
            </div>

            <div className="cd-card">
              <h3>Position</h3>
              <div className="cd-info-rows">
                <div className="cd-info-row">
                  <Briefcase size={14} />
                  <span>{job?.title || '—'}</span>
                </div>
                {job?.department && (
                  <div className="cd-info-row">
                    <GraduationCap size={14} />
                    <span>{job.department}</span>
                  </div>
                )}
                {job?.location && (
                  <div className="cd-info-row">
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage badge + dates */}
            <div className="cd-card">
              <h3>Status</h3>
              <div className="cd-info-rows">
                <div className="cd-info-row">
                  <span className="cd-stage-badge" style={{ backgroundColor: stageColor || STAGE_COLORS[stage] }}>
                    {stage}
                  </span>
                </div>
                <div className="cd-info-row">
                  <Calendar size={14} />
                  <span>Applied {formatDate(application.createdAt)}</span>
                </div>
                <div className="cd-info-row">
                  <Calendar size={14} />
                  <span>Updated {formatDate(application.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h3>Stage History</h3>
              {loading ? (
                <div className="cd-history-loading">
                  <Loader size={14} className="cd-spinner" />
                  <span>Loading...</span>
                </div>
              ) : stageHistory.length > 0 ? (
                <div className="cd-timeline">
                  {stageHistory.map((record, idx) => (
                    <div key={idx} className="cd-timeline-item">
                      <div
                        className="cd-timeline-dot"
                        style={{ backgroundColor: STAGE_COLORS[record.stage] || '#d1d5db' }}
                      />
                      <div className="cd-timeline-content">
                        <span className="cd-timeline-stage">{record.stage}</span>
                        <span className="cd-timeline-date">{formatDate(record.createdAt)}</span>
                        {record.notes && <p className="cd-timeline-notes">{record.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="cd-empty">No history</p>
              )}
            </div>
          </div>
        </div>

        <div className="cd-modal-footer">
          <button className="cd-btn cd-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button className="cd-btn cd-btn-primary" onClick={onMoveClick}>
            Move Stage
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
