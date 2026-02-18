
const CACHE_NAME = 'ab3ad-ramadan-v2026-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/constants.tsx',
  '/types.ts'
];

// قائمة بالروابط الخارجية التي يجب تخزينها (الخطوط، المكتبات، الصور)
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Amiri:wght@400;700&display=swap',
  'https://esm.sh/react@^19.2.4',
  'https://esm.sh/react-dom@^19.2.4/',
  'https://esm.sh/lucide-react@^0.564.0',
  'https://drive.google.com/uc?id=1oE13o9JSXGFiuTr2QqNr_CclDKr_sAn_',
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching all assets for offline use');
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

// استراتيجية Stale-While-Revalidate: عرض المخزن فوراً ثم التحديث من الشبكة في الخلفية
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // إذا كان المستخدم أوفلاين والملف غير موجود في الكاش
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
      return cachedResponse || fetchPromise;
    })
  );
});
