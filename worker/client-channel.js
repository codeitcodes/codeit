
// worker-side
// service worker/client communication channel


// update worker name when worker changes
const WORKER_NAME = 'codeit-worker-v356';


// internal paths
const INTERNAL_PATHS = {
    
  internal: 'https://codeit.codes/',
  internal_: 'https://dev.codeit.codes/',
  
  run: 'https://codeit.codes/run',
  run_: 'https://dev.codeit.codes/run'
  
}


// get path type
function getPathType(path) {
  
  let pathType = 'external';
  
  Object.entries(INTERNAL_PATHS).forEach(type => {
    
    if (path.startsWith(type[1])) {
      
      pathType = type[0].replace('_', '');
      
      return;
      
    }
    
  });
  
  return pathType;
  
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
    
    function workerListener(event) {

      workerLog('[ServiceWorker] Called client channel listener', event.data);
      
      // if response url matches
      if (event.data.type === 'response' &&
        event.data.url === request.url) {

        // remove channel listener
        workerChannel.removeEventListener('message', workerListener);

        // resolve promise
        resolve(event.data.response);

      }

    }
    
    workerChannel.addEventListener('message', workerListener);
    
  });

}


// handle fetch request
function handleFetchRequest(request) {
    
  return new Promise(async (resolve, reject) => {

    console.log('[ServiceWorker] Intercepted fetch', request);

    // get request path type
    const pathType = getPathType(request.url);
  
    // if fetch originated in codeit itself
    if (pathType === 'internal'
        && (getPathType(request.referrer) !== 'run')) {
  
      console.log('[ServiceWorker] Intercepted internal fetch\n' + request.url);
    
      // return response from cache
      //resolve(caches.match(request));
      resolve(fetch(request));
  
    } else if (pathType === 'run') { // if fetch originated in live view
  
      console.log('[ServiceWorker] Intercepted live fetch\n' + request.url);
    
      // return response from client
      resolve(sendRequestToClient(request));
  
    } else { // if fetch is external
  
      console.log('[ServiceWorker] Intercepted external fetch\n' + request.url);
  
      // return response from network
      resolve(fetch(request));
  
    }
    
  });

}


// add fetch listener
self.addEventListener('fetch', (evt) => {
  
  evt.respondWith(handleFetchRequest(evt.request));

});

