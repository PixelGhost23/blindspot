// Blindspot service worker: opens instantly and survives bad signal.
// - The page itself: network first, so updates you push show up right away; cached copy when offline.
// - App icons and libraries: cached once.
// - Map tiles: served from cache when present and refreshed in the background (capped).
// - Routing, search, camera and note requests are never cached.
const VERSION = "blindspot-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const LIB_HOSTS = ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com"];
const TILE_HOST = "tiles.openfreemap.org";
const TILE_CACHE = "blindspot-tiles";
const TILE_MAX = 1500;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== TILE_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (await cache.match(req)) || (await cache.match("./index.html")) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

let puts = 0;
async function trimTiles(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - TILE_MAX; i++) await cache.delete(keys[i]);
}
async function staleWhileRevalidate(req) {
  const cache = await caches.open(TILE_CACHE);
  const hit = await cache.match(req);
  const fresh = fetch(req).then(res => {
    if (res.ok) { cache.put(req, res.clone()); if (++puts % 100 === 0) trimTiles(cache); }
    return res;
  }).catch(() => hit || Response.error());
  return hit || fresh;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html")) e.respondWith(networkFirst(req));
    else e.respondWith(cacheFirst(req));
    return;
  }
  if (LIB_HOSTS.includes(url.hostname)) { e.respondWith(cacheFirst(req)); return; }
  if (url.hostname === TILE_HOST) { e.respondWith(staleWhileRevalidate(req)); return; }
  // everything else (routing, search, cameras, OSM notes) goes straight to the network
});
