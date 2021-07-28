'use strict';

// Update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v1';

// List of files to cache
const FILES_TO_CACHE = [
  '/offline.html',
  '/index.html',
  '/full.css',
  '/icons/manifest-icon-512.png',
  '/icons/apple-icon-180.png',
  '/src/behave.js',
  '/src/codeit.js',
  '/utils.js',
  '/gitauth.js',
  '/codedrop.js',
  '/gitsidebar.js',
  '/codesearch.js',
  '/codestorage.js',
  '/bottomfloater.js',
  '/codelearn.js',
  'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/highlight.min.js',
  '/dark.css',
  '/Monaco.woff',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (evt) => {
  
  // Precache static resources
  evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  
  self.skipWaiting();
  
});

self.addEventListener('activate', (evt) => {
  
  // Remove previous cached data from disk.
  evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          
          console.log('deleting cache');
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
