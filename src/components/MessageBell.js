import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useMessageNotifications from '../hooks/useMessageNotifications';
import messageService from '../services/messageService';
import authService from '../services/auth.service';
import '../styles/messageBell.css';

const MessageBell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = authService.getCurrentUserRole?.() ||
    authService.getCurrentUser()?.user?.role;

  const { unreadCount, lastNotifiedCount } = useMessageNotifications(location.pathname);
  const [showTooltip, setShowTooltip] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const tooltipTimer = useRef(null);

  const messagesPath = userRole === 'employer' ? '/employer/messages' : '/seeker/messages';

  useEffect(() => {
    if (unreadCount > 0) {
      messageService.getConversations().then((data) => {
        const withUnread = data.filter((c) => c.unreadCount > 0);
        setConversations(withUnread.slice(0, 5));
      }).catch(() => {});
    }
  }, [unreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    navigate(messagesPath);
    setShowDropdown(false);
  };

  const handleConversationClick = (convId) => {
    navigate(`${messagesPath}?conversation=${convId}`);
    setShowDropdown(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return d.toLocaleDateString();
  };

  return (
    <div className="message-bell-container" ref={dropdownRef}>
      <button
        className={`message-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
        title="Messages"
      >
        <MessageSquare size={22} />
        {unreadCount > 0 && (
          <span className="message-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="message-bell-dropdown">
          <div className="message-bell-dropdown-header">
            <h4>Messages</h4>
            <button className="message-bell-view-all" onClick={handleClick}>
              View All
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="message-bell-empty">
              <p>No unread messages</p>
            </div>
          ) : (
            <div className="message-bell-list">
              {conversations.map((conv) => (
                <div
                  key={conv._id}
                  className="message-bell-item"
                  onClick={() => handleConversationClick(conv._id)}
                >
                  <div className="message-bell-avatar">
                    {(conv.otherUser?.name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="message-bell-item-info">
                    <div className="message-bell-item-top">
                      <span className="message-bell-item-name">{conv.otherUser?.name}</span>
                      <span className="message-bell-item-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                    </div>
                    <div className="message-bell-item-preview">{conv.lastMessage?.content}</div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="message-bell-item-unread">{conv.unreadCount}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBell;
