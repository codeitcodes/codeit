'use strict';

// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v1.7';

// list of files to cache
const FILES_TO_CACHE = [
  
  '/src/codeit.js',
  
  '/full.html',
  '/full.css',
  
  '/utils.js',
  '/gitauth.js',
  '/codedrop.js',
  '/gitsidebar.js',
  '/codesearch.js',
  '/codestorage.js',
  '/bottomfloat.js',
  '/codelearn.js',
  
  '/dark.css',
  
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js',
  
  '/fonts/fonts.css',
  '/fonts/googlesansmono.woff2',
  
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
  
  '/offline.html'
  
];

self.addEventListener('install', (evt) => {
  
  // precache static resources
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  
  self.skipWaiting();
  
});

self.addEventListener('activate', (evt) => {
  
  // remove previous cached data from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        return caches.delete(key);
      }));
    })
  );
  
  self.clients.claim();
  
});

self.addEventListener('fetch', (evt) => {

  evt.respondWith(

    // Try the cache
    caches.match(evt.request).then(function(response) {

      // Fall back to network
      return response || fetch(evt.request);

    }).catch(function() {

      // If both fail, show a generic fallback:
      return caches.match('offline.html');

    })
  );
  
});
