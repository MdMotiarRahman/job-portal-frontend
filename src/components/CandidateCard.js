import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import '../styles/candidateCard.css';

const CandidateCard = ({ application, stageColor, onClick, onMoveClick }) => {
  const initials = (application.seeker?.name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const appliedDate = application.createdAt
    ? new Date(application.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="cc-card" onClick={onClick}>
      <div className="cc-top">
        <div className="cc-avatar" style={{ background: stageColor || 'var(--brand-primary)' }}>
          {application.seeker?.avatar ? (
            <img src={application.seeker.avatar} alt="" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="cc-info">
          <p className="cc-name">{application.seeker?.name || 'Unknown'}</p>
          <p className="cc-role">{application.job?.title || 'Position'}</p>
        </div>
        <button
          className="cc-move"
          onClick={(e) => {
            e.stopPropagation();
            onMoveClick();
          }}
          title="Move stage"
        >
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="cc-bottom">
        {appliedDate && (
          <span className="cc-date">
            <Calendar size={11} />
            {appliedDate}
          </span>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
