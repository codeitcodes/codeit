'use strict';

// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v192';

// list of files to cache
const FILES_TO_CACHE = [
  
  '/lib/codeit.js',
  '/lib/prism.js',
  
  '/lib/codeit-line-numbers.js',
  '/lib/codeit-match-braces.js',

  '/full.html',
  '/full.css',

  '/utils.js',
  '/manifest.js',
  '/file.js',
  '/git/gitapi.js',
  '/git/gitauth.js',
  '/codedrop.js',
  '/filebrowser.js',
  '/live-view.js',
  '/spotlightsearch.js',
  '/localstorage.js',
  '/bottomfloat.js',

  '/dark.css',

  '/fonts/fonts.css',
  '/fonts/googlesansmono.woff2',

  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',

  'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW-AJi8SJQt.woff',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SuW-AJi8SJQtQ4Y.woff',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_S-W-AJi8SJQtQ4Y.woff',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_R-W-AJi8SJQtQ4Y.woff',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_QOW-AJi8SJQtQ4Y.woff',
  'https://fonts.gstatic.com/s/robotomono/v13/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SeW-AJi8SJQtQ4Y.woff',
  
  'https://plausible.io/js/plausible.js',
  
  '/icons/android-app-512.png',
  '/icons/iphone-app-180.png',
  '/icons/app-favicon.png',
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

    // try the cache
    caches.match(evt.request).then(function(response) {

      // fall back to network
      return response || fetch(evt.request);

    }).catch(function() {

      // if both fail, show the fallback:
      return caches.match('full.html');

    })
  );

});
