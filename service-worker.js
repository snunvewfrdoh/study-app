const CACHE_NAME = "study-app-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data/chapters.json",
  "./data/questions.json",
  "./texts/chapter1.md",
  "./texts/chapter2.md"
];

// インストール（キャッシュ登録）
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// オフライン対応
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});