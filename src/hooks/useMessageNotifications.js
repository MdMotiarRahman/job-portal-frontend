import { useState, useEffect, useRef, useCallback } from 'react';
import messageService from '../services/messageService';

const POLL_INTERVAL = 10000;
const NOTIFICATION_COOLDOWN = 60000;

const useMessageNotifications = (currentPath) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotifiedCount, setLastNotifiedCount] = useState(0);
  const lastNotifiedTime = useRef(Date.now());
  const prevCountRef = useRef(0);
  const hasRequestedPermission = useRef(false);

  const requestNotificationPermission = useCallback(async () => {
    if (hasRequestedPermission.current) return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    hasRequestedPermission.current = true;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f3+AgICAgH9/f39/gICAgIB/f39/f4CAgICAf39/f3+AgICAgH9/f39/gICAgIB/f39/f4CAgICA'
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  const showBrowserNotification = useCallback((count) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const now = Date.now();
    if (now - lastNotifiedTime.current < NOTIFICATION_COOLDOWN) return;

    try {
      new Notification('New Message', {
        body: `You have ${count} unread message${count > 1 ? 's' : ''}`,
        icon: '/favicon.ico',
        tag: 'job-portal-messages',
        renotify: true,
      });
      lastNotifiedTime.current = now;
    } catch (e) {}
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messageService.getUnreadCount();
      const newCount = data.unreadCount || 0;
      const prevCount = prevCountRef.current;

      setUnreadCount(newCount);

      if (newCount > prevCount && prevCount > 0) {
        const diff = newCount - prevCount;
        setLastNotifiedCount(diff);
        playNotificationSound();
        showBrowserNotification(diff);
      }

      prevCountRef.current = newCount;
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, [playNotificationSound, showBrowserNotification]);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (lastNotifiedCount > 0) {
      const timer = setTimeout(() => setLastNotifiedCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastNotifiedCount]);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await messageService.markAsRead(conversationId);
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    lastNotifiedCount,
    markAsRead,
    refresh: fetchUnreadCount,
  };
};

export default useMessageNotifications;
