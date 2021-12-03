'use strict';

// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v202';

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
  
  'https://rsms.me/inter/inter.css',
  'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19',
  'https://rsms.me/inter/font-files/Inter-roman.var.woff2?v=3.19',
  
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
