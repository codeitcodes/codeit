'use strict';

// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v297';

// list of files to cache
const FILES_TO_CACHE = [

  '/lib/codeit.js',
  '/lib/prism.js',

  '/lib/plugins/codeit-line-numbers.js',
  '/lib/plugins/codeit-match-braces.js',
  '/lib/plugins/codeit-autolinker.js',

  '/full.html',
  '/full.css',

  '/utils.js',
  '/manifest.js',
  '/files.js',
  '/links.js',
  '/git/gitapi.js',
  '/git/gitauth.js',
  '/codedrop.js',
  '/filebrowser.js',
  '/spotlightsearch.js',
  '/localstorage.js',
  '/bottomfloat.js',

  '/live-view/live-view.js',
  '/live-view/fetch-resp',
  
  '/live-view/extensions/beautifier.min.js',
  '/live-view/extensions/module-importer.js',
  
  '/dark-theme.css',

  '/fonts/fonts.css',

  '/fonts/Mono-Sans/MonoSans-Regular.woff2',
  '/fonts/Mono-Sans/MonoSans-Bold.woff2',

  '/fonts/Inter/Inter.var.woff2',

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

  console.log(evt);
  
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
