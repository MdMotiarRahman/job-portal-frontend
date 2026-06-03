/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/',
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'JobPortal Reminder', options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action !== 'close') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          const urlToOpen = event.notification.data.url || '/';
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});