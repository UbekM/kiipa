const CACHE_NAME = "keepr-v2";
const RUNTIME_CACHE = "keepr-runtime-v2";
const API_CACHE = "keepr-api-v2";

// Static assets to cache immediately
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/create",
  "/profile",
  "/manifest.json",
  "/keepr-192.png",
  "/keepr-512.png",
  "/keepr-icon.svg",
];

// API endpoints to cache
const API_ENDPOINTS = ["/api/keeps", "/api/wallet", "/api/profile"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Caching static assets");
        // Don't fail if some resources can't be cached
        return Promise.allSettled(
          STATIC_CACHE_URLS.map((url) =>
            cache.add(url).catch((error) => {
              console.log(`Failed to cache ${url}:`, error);
            }),
          ),
        );
      }),
      caches.open(RUNTIME_CACHE),
      caches.open(API_CACHE),
    ]),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              !cacheName.includes("keepr-v2") &&
              cacheName.includes("keepr")
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Claim all clients immediately
      self.clients.claim(),
    ]),
  );
});

// Fetch event - advanced caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - Network first, then cache
    event.respondWith(handleAPIRequest(request));
  } else if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    // Static assets - Cache first, then network
    event.respondWith(handleStaticAssets(request));
  } else if (request.destination === "document") {
    // Navigation requests - Stale while revalidate
    event.respondWith(handleNavigation(request));
  } else {
    // Other requests - Network first with cache fallback
    event.respondWith(handleOtherRequests(request));
  }
});

// Utility: Only cache http(s) requests
function isHttpRequest(request) {
  try {
    const url =
      typeof request === "string"
        ? new URL(request, self.location)
        : new URL(request.url);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// API request handler - Network first strategy
async function handleAPIRequest(request) {
  if (!isHttpRequest(request)) return fetch(request);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      if (isHttpRequest(request)) {
        // Clone the response before caching
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
    }
    return response;
  } catch (error) {
    console.log("API network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline response for API calls
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Static assets handler - Cache first strategy
async function handleStaticAssets(request) {
  if (!isHttpRequest(request)) {
    // Don't cache chrome-extension or other unsupported schemes
    return fetch(request);
  }
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    updateCache(request);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      if (isHttpRequest(request)) {
        // Clone the response before caching
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
    }
    return response;
  } catch (error) {
    console.log("Static asset fetch failed:", error);
    return new Response("", { status: 404 });
  }
}

// Navigation handler - Stale while revalidate
async function handleNavigation(request) {
  if (!isHttpRequest(request)) return fetch(request);
  const cachedResponse = await caches.match(request);

  // Always try to fetch from network
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => {
          if (isHttpRequest(request)) {
            // Clone the response before caching
            const responseClone = response.clone();
            c.put(request, responseClone);
          }
        });
      }
      return response;
    })
    .catch(() => {
      // Network failed, return cached version or fallback
      return cachedResponse || caches.match("/");
    });

  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Other requests handler
async function handleOtherRequests(request) {
  if (!isHttpRequest(request)) return fetch(request);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      if (isHttpRequest(request)) {
        // Clone the response before caching
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response("", { status: 404 });
  }
}

// Background cache update
async function updateCache(request) {
  if (!isHttpRequest(request)) return;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      if (isHttpRequest(request)) {
        // Clone the response before caching
        const responseClone = response.clone();
        cache.put(request, responseClone);
      }
    }
  } catch (error) {
    console.log("Background cache update failed:", error);
  }
}

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);
  if (event.tag === "keepr-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("Performing background sync...");
  try {
    // Sync any pending data when back online
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        message: "Syncing data...",
      });
    });
  } catch (error) {
    console.log("Background sync failed:", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: event.data ? event.data.text() : "New Keep activity",
    icon: "/keepr-192.png",
    badge: "/keepr-96.png",
    tag: "keepr-notification",
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/keepr-96.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
    data: {
      url: "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification("Keepr", options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "view" || !event.action) {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes("/dashboard") && "focus" in client) {
              return client.focus();
            }
          }
          // Open new window if app not open
          if (clients.openWindow) {
            return clients.openWindow("/dashboard");
          }
        }),
    );
  }
});

// Message handler for communication with app
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_KEEP") {
    // Cache specific Keep data
    event.waitUntil(
      caches.open(API_CACHE).then((cache) => {
        return cache.put(
          `/api/keeps/${event.data.keepId}`,
          new Response(JSON.stringify(event.data.keepData)),
        );
      }),
    );
  }
});

// Error handling
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});

console.log("Keepr Service Worker v2 loaded successfully");
