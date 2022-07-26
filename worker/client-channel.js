
// worker-side
// service worker/client communication channel


// update worker name when updating worker
const WORKER_NAME = 'codeit-worker-v557';


// internal paths
const INTERNAL_PATHS = {

  internal: 'https://codeit.codes/',
  internal_: 'https://dev.codeit.codes/',

  run: 'https://codeit.codes/run',
  run_: 'https://dev.codeit.codes/run',
  
  relLivePath: ('/run/' + '_/'.repeat(15)),
  
  clientId: 'https://codeit.codes/worker/getClientId',
  clientId_: 'https://dev.codeit.codes/worker/getClientId',

}


const isSafari = self.navigator.userAgent.toLowerCase().includes('safari');


// key                : value
// live view client ID: codeit client ID
let liveViewClients = {};


// get path type
function getPathType(path) {

  let pathType = 'external';

  Object.entries(INTERNAL_PATHS).forEach(type => {

    if (path.startsWith(type[1])) {

      pathType = type[0].replaceAll('_', '');

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


// create Response from data
function createResponse(data, type, status, cache) {

  let headers = {
    'Content-Type': type
  };
  
  //if (!cache) headers['Cache-Control'] = 'public, max-age=0, must-revalidate';

  // create Response from data
  const response = new Response(data, {
    headers: headers,
    status: status
  });

  return response;

}


// send fetch request to client
function sendRequestToClient(request, clientId) {

  return new Promise((resolve, reject) => {

    // get client ID
    clientId = liveViewClients[clientId] ?? clientId;
    
    let url = request.url;

    // append .html to url if navigating
    if (request.mode === 'navigate'
        && !url.endsWith('.html')
        && !url.endsWith('/')) url += '.html';
          
    // send request to client
    workerChannel.postMessage({
      url: url,
      toClient: clientId,
      type: 'request'
    });
    

    // set MIME type depending on request mode
    let mimeType = 'application/octet-stream';

    if (request.mode === 'navigate'
        || url.endsWith('.html')) mimeType = 'text/html';

    if (request.mode === 'script'
        || url.endsWith('.js')) mimeType = 'text/javascript';

    if (request.mode === 'style'
        || url.endsWith('.css')) mimeType = 'text/css';

    if (url.endsWith('.wasm')) mimeType = 'application/wasm';


    if (enableDevLogs) {
      console.warn(mimeType, request.mode, request.url);
    }


    // add worker/client channel listener

    function workerListener(event) {

      // if response url matches
      if (event.data.type === 'response' &&
          event.data.url === url &&
          event.data.fromClient === clientId) {

        if (enableDevLogs) {
          console.debug('[ServiceWorker] Recived response data from client', event.data);
        }

        // remove channel listener
        workerChannel.removeEventListener('message', workerListener);


        // create Response from data
        const response = createResponse(event.data.resp, mimeType, event.data.respStatus);

        if (enableDevLogs) {
          console.debug('[ServiceWorker] Resolved live view request with client response', response, event.data.resp, event.data.respStatus);
        }

        // resolve promise with Response
        resolve(response);

      }

    }

    workerChannel.addEventListener('message', workerListener);

  });

}


let enableDevLogs = false;

workerChannel.addEventListener('message', (event) => {
  
  if (event.data.type === 'updateWorker') self.registration.update();
  if (event.data.type === 'enableDevLogs') enableDevLogs = true;
  if (event.data.type === 'hello') workerChannel.postMessage('hello!');
  
});


// handle fetch request
function handleFetchRequest(request, event) {

  return new Promise(async (resolve, reject) => {

    // get request path type
    const pathType = getPathType(request.url);

    // if fetch originated in codeit itself
    if (pathType === 'internal'
        && (getPathType(request.referrer) !== 'run')) {

      let url = request.url;

      // append .html to url if navigating
      /*if (request.mode === 'navigate'
          && url.includes('/full')) url = url.replace('/full', '/full.html');*/

      const resp = await caches.match(url);

      // return response from cache
      resolve(resp ?? fetch(request));

    } else if (pathType === 'run'
               || (getPathType(request.referrer) === 'run')) { // if fetch originated in live view
      
      if (enableDevLogs) {
        console.debug('[ServiceWorker] Intercepted live fetch', event);
      }
      
      
      let clientId = event.clientId;
      
      let [url, parentClientId] = request.url.split('?');
            
      const liveFramePath = INTERNAL_PATHS.relLivePath;
      
      let liveViewClientId = event.resultingClientId ?? event.targetClientId;
      
      // if codeit client is creating a new live view
      if (url.endsWith(liveFramePath)
          && liveViewClientId) {
        
        // add live view to client array
        
        parentClientId = parentClientId.slice(0, -1);
        clientId = parentClientId;

        // if on safari
        if (isSafari && event.targetClientId) {
          
          // add 1 to live view client id
          let splitId = liveViewClientId.split('-');
          
          splitId[1] = Number(splitId[1]) + 1;
          
          liveViewClientId = splitId.join('-');
          
        }

        // pair live view client ID
        // with codeit client ID
        // in client array
        liveViewClients[liveViewClientId] = parentClientId;
        
      }

      // return response from client
      resolve(sendRequestToClient(request, clientId));

    } else if (pathType === 'clientId') { // if fetching client ID
      
      // return the ID of the client
      // who sent the request
      
      const clientId = event.clientId;
      
      resolve(createResponse(
        JSON.stringify({ clientId }), 'application/json', 200
      ));
      
    } else { // if fetch is external
      
      /*
      let resp = await fetch(request);
      
      // if fetch is an internal Git fetch
      // with an error code
      if (request.url.startsWith('https://api.github.com')
          && resp.status === 403) {
        
        console.debug('[ServiceWorker] Intercepted Github API request', request);
        
        // return an identical response without the error code
        resp = new Response(resp.body, {
          headers: resp.headers,
          status: 200
        });
        
      }*/
      
      // return response from network
      //resolve(resp);
      resolve(fetch(request));

    }

  });

}


// add fetch listener
self.addEventListener('fetch', (evt) => {

  evt.respondWith(handleFetchRequest(evt.request, evt));

});

