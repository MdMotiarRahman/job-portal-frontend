import React from 'react';
import { getFileUrl } from '../utils/fileUrl';

const COLORS = [
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #3b82f6, #60a5fa)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #10b981, #34d399)',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (name) => {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const UserAvatar = ({ user, profile, name, src, size = 40, className = '' }) => {
  const displayName = name || profile?.fullName || profile?.userName || user?.name || '';

  const resolveImage = () => {
    if (src) return src;
    if (profile?.profileImage) return getFileUrl(profile.profileImage);
    if (profile?.logo?.url) return getFileUrl(profile.logo.url);
    return null;
  };

  const imageSrc = resolveImage();

  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.38,
    fontWeight: 700,
    color: 'white',
    background: imageSrc ? 'var(--bg-tertiary)' : getColor(displayName),
    letterSpacing: '0.02em',
  };

  if (imageSrc) {
    return (
      <div className={className} style={style}>
        <img
          src={imageSrc}
          alt={displayName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          style={{
            ...style,
            position: 'absolute',
            display: 'none',
          }}
        >
          {getInitials(displayName)}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {getInitials(displayName)}
    </div>
  );
};

export default UserAvatar;
