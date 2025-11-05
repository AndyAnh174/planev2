// Empty service worker - prevents 404 errors
// This file is intentionally minimal to avoid PWA registration issues

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

// No fetch handler - let all requests go through normally

