
const CACHE_NAME = 'ab3ad-ramadan-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './constants.tsx',
  './types.ts'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Amiri:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/cairo/v28/slLpW36C6rXSBbE.woff2',
  'https://fonts.gstatic.com/s/amiri/v26/J7afp9dbcD7u96KEDXo.woff2',
  'https://drive.google.com/uc?id=1oE13o9JSXGFiuTr2QqNr_CclDKr_sAn_',
  'https://actions.google.com/sounds/v1/animals/bird_chirp_short.ogg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll([...ASSETS_TO_CACHE, ...EXTERNAL_ASSETS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('esm.sh') && !event.request.url.includes('gstatic') && !event.request.url.includes('tailwindcss') && !event.request.url.includes('google.com') && !event.request.url.includes('actions.google.com')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
