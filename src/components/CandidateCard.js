import React from 'react';
import { ArrowRight, Mail, MapPin, Briefcase } from 'lucide-react';
import '../styles/candidateCard.css';

const CandidateCard = ({ application, stageColor, onClick, onMoveClick }) => {
  return (
    <div className="candidate-card" onClick={onClick} style={{ borderLeftColor: stageColor }}>
      {/* Candidate Header */}
      <div className="candidate-card-header">
        <div className="candidate-avatar-mini">
          {application.seeker?.avatar ? (
            <img src={application.seeker.avatar} alt={application.seeker?.name} />
          ) : (
            <div className="avatar-placeholder">
              {application.seeker?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="candidate-info-mini">
          <p className="candidate-name">{application.seeker?.name || 'Unknown'}</p>
          <p className="candidate-email">
            <Mail size={12} /> {application.seeker?.email || 'N/A'}
          </p>
        </div>
      </div>

      {/* Job Info */}
      <div className="candidate-card-job">
        <p className="candidate-position">
          <Briefcase size={12} /> {application.job?.title || 'Position Unknown'}
        </p>
        {application.job?.location && (
          <p className="candidate-location">
            <MapPin size={12} /> {application.job.location}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="candidate-card-footer">
        <span className="candidate-stage-badge" style={{ backgroundColor: stageColor }}>
          {application.stage}
        </span>
        <button
          className="candidate-card-move-btn"
          onClick={(e) => {
            e.stopPropagation();
            onMoveClick();
          }}
          title="Move to different stage"
        >
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Hover Details */}
      <div className="candidate-card-hover-overlay">
        <div className="candidate-card-hover-content">
          <p><strong>Applied:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
          {application.notes && <p><strong>Notes:</strong> {application.notes}</p>}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
