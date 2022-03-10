
// worker-side
// client/service worker communication channel


// update cache names any time any of the cached files change
const CACHE_NAME = 'static-cache-v322';


// create broadcast channel
const broadcast = new BroadcastChannel('worker-channel');

broadcast.onmessage = (evt) => {
  if (event.data && event.data.type === 'hello!') {
    broadcast.postMessage({
      payload: 'hi, what\'s up?'
    });
  }
};


function sendRequestToClient(request) {
  
  return new Promise((resolve, reject) => {
    
    broadcast.postMessage({
      url: request.url,
      method: request.method,
      origin: request.referrer,
      type: 'request'
    });
    
    broadcast.addEventListener('message', (evt) => {
      
      if (event.data.type === 'response'
          && event.data.url === request.url) {
        
        resolve(event.data.response);
        
      }
      
    });
    
  });
  
}


self.addEventListener('fetch', (evt) => {
  
  const resp = sendRequestToClient(evt.request);
  
  broadcast.postMessage({
    payload: ('[ServiceWorker] Intercepted ' + evt.request.method
              + ' ' + evt.request.url
              + '\nfrom origin ' + evt.request.referrer)
  });
  
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

