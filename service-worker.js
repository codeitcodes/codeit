'use strict';

// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v57';

// list of files to cache
const FILES_TO_CACHE = [
  
  '/src/codeit.js',
  '/src/prism.js',
  '/src/codeit-line-numbers.js',
  '/src/codeit-match-braces.js',
  
  '/full.html',
  '/full.css',
  
  '/utils.js',
  '/manifest.js',
  '/git/gitapi.js',
  '/git/gitauth.js',
  '/codedrop.js',
  '/htmlrenderer.js',
  '/spotlightsearch.js',
  '/localstorage.js',
  '/bottomfloat.js',
  '/pwainstall.js',
  
  '/dark.css',
    
  '/fonts/fonts.css',
  '/fonts/googlesansmono.woff2',
  
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
  
  '/icons/android-app-512.png',
  '/icons/iphone-app-180.png',
  '/icons/mac-favicon.png',
  '/icons/mac-icon-512.png',
  '/icons/mac-icon-512-padding.png'
  
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
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
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
      return caches.match('full.html');

    })
  );
  
});
