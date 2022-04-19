'use strict';

self.importScripts('/worker/client-channel.js');

// list of files to cache
const FILES_TO_CACHE = [

  '/lib/codeit.js',
  '/lib/prism.js',

  '/lib/plugins/codeit-line-numbers.js',
  '/lib/plugins/codeit-match-braces.js',
  '/lib/plugins/codeit-autolinker.js',

  '/full',
  '/full.css',

  '/worker/worker-channel.js',

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

  '/live-view/live-view.js',
  
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
  
  self.skipWaiting();
    
});

self.addEventListener('activate', (evt) => {
    
  self.clients.claim().then(() => {
    console.log('hello from service worker');
  });
  
  
  // precache static resources
  caches.open(WORKER_NAME).then((cache) => {
    return cache.addAll(FILES_TO_CACHE);
  })
  
  // remove previous cached data from disk
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key !== WORKER_NAME) {
        return caches.delete(key);
      }
    }));
  })
  
  // send reload request to client
  /*workerChannel.postMessage({
    type: 'reload'
  });*/

});
