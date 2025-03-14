self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('OXGamePro-v1').then(cache => {
      return cache.addAll([
        '/index.html',
        '/about.html',
        '/terms.html',
        '/contact.html',
        '/tips.html',
        '/style.css',
        '/script.js',
        '/ads.js',
        '/manifest.json',
        '/assets/icon.png',
        '/assets/logo.png',
        '/assets/background.jpg'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});