import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import atsService from '../services/atsService';
import '../styles/moveApplicationModal.css';

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

const MoveApplicationModal = ({ application, stages, onClose, onSuccess }) => {
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

      // Add stage-specific data
      if (selectedStage === 'Interview Scheduled') {
        if (!interviewDate || !interviewTime) {
          setError('Please provide interview date and time');
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
          setError('Please provide a rejection reason');
          setLoading(false);
          return;
        }
        moveData.rejectionReason = rejectionReason;
      }

      const response = await atsService.moveApplication(application._id, moveData);

      if (response.success) {
        setSuccess(`Application moved to ${selectedStage}`);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.message || 'Failed to move application');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="move-modal-overlay" onClick={onClose}>
      <div className="move-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="move-modal-header">
          <h2>Move Application</h2>
          <button className="move-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Current Info */}
        <div className="move-modal-current-info">
          <p>
            <strong>{application.seeker?.name}</strong>
          </p>
          <p>Current stage: <span className="current-stage">{currentStage}</span></p>
          <p>Position: {application.job?.title}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="move-modal-alert move-modal-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="move-modal-alert move-modal-alert-success">
            <span>✓ {success}</span>
          </div>
        )}

        {/* Content */}
        <div className="move-modal-content">
          {/* Stage Selection */}
          <section className="move-modal-section">
            <label className="move-modal-label">Select Target Stage *</label>
            <div className="move-stage-grid">
              {validTransitions.length > 0 ? (
                validTransitions.map((stage) => (
                  <button
                    key={stage}
                    className={`move-stage-option ${selectedStage === stage ? 'selected' : ''}`}
                    onClick={() => handleStageSelect(stage)}
                    disabled={loading}
                  >
                    {stage}
                  </button>
                ))
              ) : (
                <p className="move-modal-no-transitions">
                  No valid transitions from {currentStage}
                </p>
              )}
            </div>
          </section>

          {/* Conditional Fields */}
          {selectedStage === 'Interview Scheduled' && (
            <section className="move-modal-section">
              <h3>Schedule Interview</h3>
              
              <div className="move-modal-form-group">
                <label className="move-modal-label">Interview Date *</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="move-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="move-modal-form-group">
                <label className="move-modal-label">Interview Time *</label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="move-modal-input"
                  disabled={loading}
                />
              </div>

              <div className="move-modal-form-group">
                <label className="move-modal-label">Interview Mode</label>
                <select
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="move-modal-input"
                  disabled={loading}
                >
                  <option>Video</option>
                  <option>In-Person</option>
                  <option>Phone</option>
                  <option>Hybrid</option>
                </select>
              </div>

              {interviewMode !== 'Video' && (
                <div className="move-modal-form-group">
                  <label className="move-modal-label">Location</label>
                  <input
                    type="text"
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder="e.g., Conference Room A, 123 Main St"
                    className="move-modal-input"
                    disabled={loading}
                  />
                </div>
              )}
            </section>
          )}

          {selectedStage === 'Rejected' && (
            <section className="move-modal-section">
              <label className="move-modal-label">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the candidate was rejected..."
                className="move-modal-textarea"
                rows={4}
                disabled={loading}
              />
            </section>
          )}

          {/* Notes */}
          <section className="move-modal-section">
            <label className="move-modal-label">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this move..."
              className="move-modal-textarea"
              rows={3}
              disabled={loading}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="move-modal-footer">
          <button
            className="move-modal-btn move-modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="move-modal-btn move-modal-btn-primary"
            onClick={handleSubmit}
            disabled={loading || !selectedStage}
          >
            {loading ? (
              <>
                <Loader size={16} className="spinner" />
                Moving...
              </>
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
