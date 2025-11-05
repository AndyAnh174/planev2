import { NextResponse } from "next/server";

// Route handler to serve service worker at /sw.js
// This ensures the service worker is accessible even if not in public folder
export async function GET() {
  const serviceWorkerContent = `// Empty service worker - prevents 404 errors
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
`;

  return new NextResponse(serviceWorkerContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

