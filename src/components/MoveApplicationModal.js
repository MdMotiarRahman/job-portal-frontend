import React, { useState } from 'react';
import { AlertCircle, Loader, Calendar, Clock, MapPin, X } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/moveApplicationModal.css';

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

const VALID_TRANSITIONS = {
  Applied: ['Screening', 'Reviewing', 'Rejected', 'Withdrawn'],
  Screening: ['Reviewing', 'Shortlisted', 'Rejected', 'Withdrawn'],
  Reviewing: ['Shortlisted', 'Interview Scheduled', 'Rejected', 'Withdrawn'],
  Shortlisted: ['Interview Scheduled', 'Assessment', 'Rejected', 'Withdrawn'],
  'Interview Scheduled': ['Shortlisted', 'Assessment', 'Offer Extended', 'Rejected'],
  Assessment: ['Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Rejected'],
  'Offer Extended': ['Accepted', 'Rejected', 'Withdrawn'],
  Accepted: [],
  Rejected: [],
  Withdrawn: [],
};

const MoveApplicationModal = ({ application, onClose, onSuccess }) => {
  const [selectedStage, setSelectedStage] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState('Video');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentStage = application.stage;
  const validTransitions = VALID_TRANSITIONS[currentStage] || [];

  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedStage) {
      setError('Please select a target stage');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const moveData = {
        stage: selectedStage,
        notes: notes.trim(),
      };

      if (selectedStage === 'Interview Scheduled') {
        if (!interviewDate || !interviewTime) {
          setError('Interview date and time are required');
          setLoading(false);
          return;
        }
        moveData.interviewDate = interviewDate;
        moveData.interviewTime = interviewTime;
        moveData.interviewMode = interviewMode;
        moveData.interviewLocation = interviewLocation;
      }

      if (selectedStage === 'Rejected') {
        if (!rejectionReason.trim()) {
          setError('Rejection reason is required');
          setLoading(false);
          return;
        }
        moveData.rejectionReason = rejectionReason;
      }

      const response = await atsService.moveApplication(application._id, moveData);

      if (response.success) {
        setSuccess(`Moved to ${selectedStage}`);
        setTimeout(onSuccess, 1200);
      } else {
        setError(response.message || 'Failed to move application');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mv-modal-overlay" onClick={onClose}>
      <div className="mv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mv-modal-header">
          <div>
            <h2>Move Application</h2>
            <p className="mv-modal-subtitle">{application.seeker?.name}</p>
          </div>
          <button className="mv-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="mv-modal-body">
          <div className="mv-current-info">
            <div className="mv-current-row">
              <span className="mv-label">Current</span>
              <span className="mv-stage-chip" style={{ backgroundColor: STAGE_COLORS[currentStage] }}>
                {currentStage}
              </span>
            </div>
            <div className="mv-current-row">
              <span className="mv-label">Position</span>
              <span className="mv-value">{application.job?.title || 'N/A'}</span>
            </div>
          </div>

          {error && (
            <div className="mv-alert mv-alert-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mv-alert mv-alert-success">
              <span>{success}</span>
            </div>
          )}

          <div className="mv-section">
            <label className="mv-section-label">Move to Stage</label>
            {validTransitions.length > 0 ? (
              <div className="mv-stage-options">
                {validTransitions.map((stage) => (
                  <button
                    key={stage}
                    className={`mv-stage-option ${selectedStage === stage ? 'selected' : ''}`}
                    onClick={() => handleStageSelect(stage)}
                    disabled={loading}
                    style={{
                      '--stage-color': STAGE_COLORS[stage],
                    }}
                  >
                    <span className="mv-stage-dot" style={{ backgroundColor: STAGE_COLORS[stage] }} />
                    {stage}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mv-no-transitions">Terminal stage — no further transitions available</p>
            )}
          </div>

          {selectedStage === 'Interview Scheduled' && (
            <div className="mv-section mv-section-bordered">
              <label className="mv-section-label">
                <Calendar size={14} />
                Interview Details
              </label>
              <div className="mv-form-grid">
                <div className="mv-form-field">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="mv-form-field">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="mv-form-field">
                  <label>Mode</label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value)}
                    disabled={loading}
                  >
                    <option>Video</option>
                    <option>In-Person</option>
                    <option>Phone</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                {interviewMode !== 'Video' && (
                  <div className="mv-form-field mv-form-field-full">
                    <label>Location</label>
                    <div className="mv-input-with-icon">
                      <MapPin size={14} />
                      <input
                        type="text"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        placeholder="Conference Room or address"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedStage === 'Rejected' && (
            <div className="mv-section mv-section-bordered">
              <label className="mv-section-label">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          {selectedStage && selectedStage !== 'Rejected' && (
            <div className="mv-section">
              <label className="mv-section-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this move..."
                rows={2}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="mv-modal-footer">
          <button className="mv-btn mv-btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="mv-btn mv-btn-primary"
            onClick={handleSubmit}
            disabled={loading || !selectedStage || !!success}
          >
            {loading ? (
              <>
                <Loader size={15} className="mv-spinner" />
                Moving...
              </>
            ) : success ? (
              'Done'
            ) : (
              'Move Application'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveApplicationModal;
