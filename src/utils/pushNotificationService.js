const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY'; // This would be fetched from backend in production

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      // 1. Ask for permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Push notification permission not granted');
      }

      // 2. Register Service Worker
      const register = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker Registered...');

      // 3. Wait for service worker to be ready
      const readyRegistration = await navigator.serviceWorker.ready;

      // 4. Subscribe to Push
      const subscription = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      
      console.log('Push Notification Subscribed...');

      // 5. Send Subscription to Backend
      // This is simulated here. In a real app, send `subscription` to your API.
      /*
      await fetch('/api/reminders/push-subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'content-type': 'application/json'
        }
      });
      */
      
      return subscription;
    } catch (err) {
      console.error('Error setting up push notifications:', err);
      return null;
    }
  } else {
    console.warn('Push messaging is not supported in this browser');
    return null;
  }
};