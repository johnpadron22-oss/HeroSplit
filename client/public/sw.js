// HeroSplit Service Worker — handles web push notifications

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// ── Push handler ─────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "HeroSplit", body: event.data?.text() ?? "Time to train." };
  }

  const title = data.title ?? "HeroSplit";
  const options = {
    body: data.body ?? "Your next PR is waiting.",
    icon: "/favicon.png",
    badge: "/favicon.png",
    tag: data.tag ?? "herosplit-reminder",   // replaces previous notification of same tag
    renotify: false,
    data: { url: data.url ?? "/" },
    actions: [
      { action: "open", title: "Train Now" },
      { action: "dismiss", title: "Later" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Click handler ─────────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(targetUrl);
      })
  );
});
