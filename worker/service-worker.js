
self.importScripts('/worker/worker-channel.js');

// list of files to cache
const FILES_TO_CACHE = [

  '/lib/codeit.js',
  '/lib/prism.js',

  '/lib/plugins/codeit-line-numbers.js',
  '/lib/plugins/codeit-match-braces.js',
  '/lib/plugins/codeit-autolinker.js',
  '/lib/plugins/codeit-autocomplete.js',

  '/full',
  '/full.css',
  
  '/worker/client-channel.js',

  '/utils.js',
  '/manifest.js',
  '/files.js',
  '/links.js',
  '/repos.js',
  '/git/gitapi.js',
  '/git/gitauth.js',
  '/codedrop.js',
  '/filebrowser.js',
  '/spotlightsearch.js',
  '/localstorage.js',
  '/bottomfloat.js',
  '/context-menu.js',

  '/live-view/live-view.js',
  
  '/live-view/extensions/beautifier.min.js',
  
  '/dark-theme.css',

  '/fonts/fonts.css',

  '/fonts/Mono-Sans/MonoSans-Regular.woff2',
  '/fonts/Mono-Sans/MonoSans-Bold.woff2',

  '/fonts/Inter/Inter-Regular.woff2',
  '/fonts/Inter/Inter-Medium.woff2',
  '/fonts/Inter/Inter-SemiBold.woff2',
  '/fonts/Inter/Inter-Bold.woff2',
  
  '/fonts/Roboto-Mono/RobotoMono-Regular.woff2',

  'https://plausible.io/js/plausible.js',

  '/icons/android-app-512.png',
  '/icons/iphone-app-180.png',
  '/icons/app-favicon.png',
  '/icons/mac-icon-512-padding.png'

];


/*
  // remove previous cached data from disk
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== worker.NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  
  // precache static resources
  evt.waitUntil(
    caches.open(worker.NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
*/


self.addEventListener('install', (evt) => {
  
  self.skipWaiting();
  
});

self.addEventListener('activate', (evt) => {
  
  self.clients.claim();

});

