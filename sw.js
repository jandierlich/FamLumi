// FamLumi Service Worker
// CACHE_NAME bei jedem größeren Update hochzählen, damit Handys nicht an
// einer alten Version festhängen.
const CACHE_NAME = "famlumi-v32";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Externe Anfragen (Google Fonts, Leaflet-Kacheln) gehen immer übers
  // Netz - nur die eigenen App-Dateien werden aus dem Cache bedient,
  // damit die App auch offline startet.
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)).catch(() => caches.match("./index.html"))
  );
});
