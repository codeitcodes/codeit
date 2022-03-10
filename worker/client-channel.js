
// worker-side
// service worker/client communication channel


// update worker name when worker changes
const WORKER_NAME = 'codeit-worker-v325';


// internal paths
const INTERNAL_PATHS = {
  
  internal: 'https://codeit.codes/full',
  _internal_: 'https://dev.codeit.codes/full',
  __internal__: 'https://plausible.io/js/plausible.js',
  
  run: 'https://codeit.codes/run',
  _run_: 'https://dev.codeit.codes/run'
  
}


// get path type
function getPathType(path) {
  
  Object.entries(INTERNAL_PATHS).forEach(pathType => {
    
    if (path.startsWith(pathType[1])) {
      
      return pathType[0].replaceAll('_', '');
      
    }
    
  });
  
  return 'external';
  
}


// create worker channel
const workerChannel = new BroadcastChannel('worker-channel');


// send fetch request to client
function sendRequestToClient(request) {
  
  return new Promise((resolve, reject) => {
    
    // send request to client
    workerChannel.postMessage({
      url: request.url,
      method: request.method,
      origin: request.referrer,
      type: 'request'
    });
    
    
    // add worker/client channel listener
    workerChannel.addEventListener('message', (evt) => {
      
      console.log('[ServiceWorker] Called client channel listener');
      
      const handler = (evt) => {
        
        // if response url matches
        if (event.data.type === 'response'
            && event.data.url === request.url) {
          
          // remove channel listener
          workerChannel.removeEventListener('message', handler);
          
          // resolve promise
          resolve(event.data.response);
          
        }
        
      }
      
      return handler;
      
    });
    
  });
  
}


self.addEventListener('fetch', (evt) => {
  
  console.log('[ServiceWorker] Intercepted ' + evt.request.method
              + ' ' + evt.request.url
              + '\nfrom origin ' + evt.request.referrer);
  
  evt.respondWith(() => {
  
    // get request type
    const type = getPathType(evt.request.referrer);

    // if fetch originates in codeit itself
    if (type === 'internal') {
      
      // return response from cache
      return caches.match(evt.request);
      
    } else if (type === 'run') { // if fetch originates in live view
      
      // return response from client
      return sendRequestToClient(evt.request);
      
    } else { // if fetch is external
      
      // return response from network
      return fetch(evt.request);
      
    }
    
  });

});

