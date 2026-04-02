"use client";

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = JSON.parse(event.data.text());
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.data?.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
