const cacheName = "comic-site-v1";
const assets = [
  "/",
  "/index.html",
  "/comic.html",
  "/assets/comics/comic1.pdf",
  "/assets/audio/comic1.mp3",
  "/assets/images/comic1.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
