const VERSION = 'v4';
const CACHE   = 'yuyu-craft-' + VERSION;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./', './index.html']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// 新バージョン検知→クライアントに通知
self.addEventListener('message', e => {
  if (e.data === 'CHECK_UPDATE') {
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({type: 'VERSION', version: VERSION}));
    });
  }
});
