
// worker-side
// service worker/client communication channel


// update worker name when worker changes
const WORKER_NAME = 'codeit-worker-v331';


// internal paths
const INTERNAL_PATHS = {
  
  internal: 'https://codeit.codes/full',
  internal_: 'https://dev.codeit.codes/full',
  
  run: 'https://codeit.codes/run',
  run_: 'https://dev.codeit.codes/run'
  
}


// get path type
function getPathType(path) {
  
  Object.entries(INTERNAL_PATHS).forEach(pathType => {
    
    if (path.startsWith(pathType[1])) {
      
      return pathType[0].replace('_', '');
      
    }
    
  });
  
  return 'external';
  
}


// worker log
function workerLog(log) {
  
  workerChannel.postMessage({
    message: log,
    type: 'message'
  });
  
}


// create worker channel
const workerChannel = new BroadcastChannel('worker-channel');


// send fetch request to client
function sendRequestToClient(request) {
  
  return new Promise((resolve, reject) => {
    
    // send request to client
    workerChannel.postMessage({
      url: request.url,
      type: 'request'
    });
    
    
    // add worker/client channel listener
    workerChannel.addEventListener('message', (evt) => {
      
      workerLog('[ServiceWorker] Called client channel listener');
      
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
  
  evt.respondWith(return function() {
  
    // get request type
    const type = getPathType(evt.request.referrer);

    // if fetch originates in codeit itself
    if (type === 'internal') {
      
      workerLog('[ServiceWorker] Intercepted internal fetch\n', evt.request.url);
      
      console.log('internal');
      
      // return response from cache
      return caches.match(evt.request) ?? fetch(evt.request);
      
    } else if (type === 'run'
               && evt.request.type === 'GET') { // if fetch originates in live view
      
      workerLog('[ServiceWorker] Intercepted live fetch\n', evt.request.url);
      
      // return response from client
      return sendRequestToClient(evt.request);
      
    } else { // if fetch is external
      
      workerLog('[ServiceWorker] Intercepted external fetch\n', evt.request.url);
      
      // return response from network
      return fetch(evt.request);
      
    }
    
  });

});

