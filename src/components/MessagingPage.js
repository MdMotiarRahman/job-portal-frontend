import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  Briefcase,
} from 'lucide-react';
import messageService from '../services/messageService';
import authService from '../services/auth.service';
import '../styles/messaging.css';

const POLL_INTERVAL = 8000;

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString();
};

const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateDivider = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - msgDate) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const MessagingPage = () => {
  const [searchParams] = useSearchParams();
  const currentUserId = authService.getCurrentUser()?.user?.id;
  const currentUserRole =
    authService.getCurrentUserRole?.() ||
    authService.getCurrentUser()?.user?.role;

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(
    searchParams.get('conversation') || null
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pollRef = useRef(null);

  const activeConv = conversations.find(
    (c) => c._id === activeConvId
  );

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(
    async (convId) => {
      if (!convId) return;
      try {
        const data = await messageService.getMessages(convId);
        setMessages(data.messages);
        // Mark as read
        await messageService.markAsRead(convId);
        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c._id === convId ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    init();
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId, fetchMessages]);

  // Poll for new messages
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConversations();
      if (activeConvId) {
        fetchMessages(activeConvId);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [activeConvId, fetchConversations, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select conversation
  const handleSelectConversation = (convId) => {
    setActiveConvId(convId);
    setShowMobileChat(true);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConvId || sendingMessage)
      return;

    setSendingMessage(true);
    try {
      const sent = await messageService.sendMessage(
        activeConvId,
        newMessage.trim()
      );
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');

      // Update conversation list locally
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConvId
            ? {
                ...c,
                lastMessage: {
                  content: newMessage.trim(),
                  sender: currentUserId,
                  createdAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      conv.otherUser?.name?.toLowerCase().includes(q) ||
      conv.job?.title?.toLowerCase().includes(q)
    );
  });

  // Group messages by date
  const groupedMessages = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'date', date: msg.createdAt });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  if (loading) {
    return (
      <div className="messaging-page">
        <div className="messaging-loading">
          <div className="messaging-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      {/* LEFT: Conversation List */}
      <div
        className={`messaging-sidebar ${
          showMobileChat ? 'hidden-mobile' : ''
        }`}
      >
        <div className="messaging-sidebar-header">
          <h2>
            Messages
            {conversations.some((c) => c.unreadCount > 0) && (
              <span className="message-badge">
                {conversations.reduce(
                  (sum, c) => sum + c.unreadCount,
                  0
                )}
              </span>
            )}
          </h2>
        </div>

        <div className="conversation-search">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversation-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <MessageSquare size={48} />
              <p>
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p style={{ fontSize: 12, marginTop: 4 }}>
                  Start a conversation from your applications
                </p>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${
                  activeConvId === conv._id ? 'active' : ''
                }`}
                onClick={() =>
                  handleSelectConversation(conv._id)
                }
              >
                <div className="conversation-avatar">
                  {getInitials(conv.otherUser?.name)}
                </div>
                <div className="conversation-info">
                  <div className="conversation-info-top">
                    <span className="conversation-name">
                      {conv.otherUser?.name}
                    </span>
                    <span className="conversation-time">
                      {formatTime(
                        conv.lastMessage?.createdAt ||
                          conv.updatedAt
                      )}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    {conv.lastMessage?.content ||
                      'No messages yet'}
                  </div>
                  {conv.job?.title && (
                    <div className="conversation-job-tag">
                      <Briefcase
                        size={10}
                        style={{ marginRight: 4 }}
                      />
                      {conv.job.title}
                    </div>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <div className="conversation-unread">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div
        className={`chat-window ${
          showMobileChat ? 'visible-mobile' : ''
        }`}
      >
        {activeConv ? (
          <>
            <div className="chat-header">
              <button
                className="chat-back-btn"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-avatar">
                {getInitials(activeConv.otherUser?.name)}
              </div>
              <div className="chat-header-info">
                <h3>{activeConv.otherUser?.name}</h3>
                <p>
                  {activeConv.job?.title
                    ? `Regarding: ${activeConv.job.title}`
                    : activeConv.otherUser?.role === 'employer'
                    ? 'Employer'
                    : 'Job Seeker'}
                </p>
              </div>
            </div>

            <div className="chat-messages">
              {groupedMessages.map((item, idx) => {
                if (item.type === 'date') {
                  return (
                    <div
                      key={`date-${idx}`}
                      className="message-date-divider"
                    >
                      <span>
                        {formatDateDivider(item.date)}
                      </span>
                    </div>
                  );
                }

                const msg = item.data;
                const isSent =
                  msg.sender?._id === currentUserId ||
                  msg.sender === currentUserId;

                return (
                  <div
                    key={msg._id}
                    className={`message-bubble ${
                      isSent ? 'sent' : 'received'
                    }`}
                  >
                    {!isSent && (
                      <div className="message-sender">
                        {msg.sender?.name || 'User'}
                      </div>
                    )}
                    <div className="message-text">
                      {msg.content}
                    </div>
                    <div className="message-time">
                      {formatMessageTime(msg.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={
                  !newMessage.trim() || sendingMessage
                }
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageSquare size={64} />
            <h3>Select a conversation</h3>
            <p>
              Choose a conversation from the list to start
              messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
