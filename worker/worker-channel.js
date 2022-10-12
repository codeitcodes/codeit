
// client communication (service worker-side)


let worker = {
  
  // update worker name when updating worker
  name: 'codeit-worker-v592',
  
  // internal paths
  INTERNAL_PATHS: {
  
    internal: 'https://codeit.codes/',
    internal_: 'https://dev.codeit.codes/',
  
    run: 'https://codeit.codes/run',
    run_: 'https://dev.codeit.codes/run',
    
    relLivePath: ('/run/' + '_/'.repeat(15)),
    
    clientId: 'https://codeit.codes/worker/getClientId',
    clientId_: 'https://dev.codeit.codes/worker/getClientId',
  
  },
  
  DEV_LOGS: false,
  
  // get path type  
  getPathType: (path) => {
  
    let pathType = 'external';
  
    Object.entries(worker.INTERNAL_PATHS).forEach(type => {
  
      if (path.startsWith(type[1])) {
  
        pathType = type[0].replaceAll('_', '');
  
      }
  
    });
  
    return pathType;
  
  },
  
  // create Response from data
  createResponse: (data, type, status, noCache = false) => {
    
    let headers = {
      'Content-Type': type
    };
    
    if (noCache) headers['Cache-Control'] = 'public, max-age=0, must-revalidate';

    const response = new Response(data, {
      headers: headers,
      status: status
    });
  
    return response;
    
  },
  
  // handle fetch request
  handleFetchRequest: (request, event) => {

    return new Promise(async (resolve, reject) => {
  
      let url = request.url,
          clientId = event.clientId;
          
      
      // get request type
      
      const pathType = worker.getPathType(url);
      
      const referrerType = worker.getPathType(request.referrer);
  
  
      // if request originated in a codeit client
      if (pathType === 'internal' &&
          referrerType !== 'run') {
    
        const resp = await caches.match(url);
  
        // return response from cache
        resolve(resp ?? fetch(request));
      
      } else if (pathType === 'run' ||
                 referrerType === 'run') {
        
        // if request originated in a live view client
        
        if (worker.DEV_LOGS) {
          console.debug('[ServiceWorker] Intercepted live fetch', event);
        }
        
        // send request to the live view's parent client
        const resp = await worker.handleLiveViewRequest(request, event);
        
        // resolve with response from parent client
        resolve(resp);
  
      } else if (pathType === 'clientId') { // if fetching client ID
        
        // return the ID of the client
        // who sent the request
        
        resolve(worker.createResponse(
          JSON.stringify({ clientId }), 'application/json', 200
        ));
        
      } else { // if fetch is external
        
        // return response from network
        resolve(fetch(request));
  
      }

    });

  },
  
  // handle live view request
  handleLiveViewRequest: async (request, event) => {    
    
    // check if creating a new live view
    
    let requestUrl = request.url.split('?')[0];
    let liveViewId = event.resultingClientId ?? event.targetClientId;
    
    const liveViewPath = worker.INTERNAL_PATHS.relLivePath;
    
    const creatingNewLiveView = (requestUrl.endsWith(liveViewPath) && liveViewId);
    
    
    // find live view parent client ID
    const parentId = client.liveView.getParentId(event, creatingNewLiveView);
    
    
    // if creating a new live view
    if (creatingNewLiveView) {
  
      // if on safari,
      // parse live view id
      if (client.isSafari) {
        
        liveViewId = client.liveView.parseSafariId(liveViewId, event);
        
      }
      
      // pair live view client
      // with it's parent client
      client.liveView.parent[liveViewId] = parentId;
  
    }
    
    
    // send request to the live view's parent client
    const resp = await client.sendRequest(request, parentId);

    // return response from parent client
    return resp;
    
  },
  
  // worker debug log
  debugLog: async (log) => {
    
    const targetClient = (await clients.matchAll())[0];
    
    client.send({
      message: log,
      toClient: targetClient,
      type: 'message'
    });

  }
  
};


let client = {

  send: async (message) => {

    let targetClient = message.toClient;

    if (typeof targetClient === 'string') {
      
      targetClient = await this.clients.get(targetClient);
      
    }
    
    delete message.toClient;

    targetClient.postMessage(message);

  },
  
  listeners: [],
  
  // listen for client messages
  // options:
  // forMsg - object with message conditions to listen for
  // fromClient - client ID to listen for
  // [or] callback - defining this makes the function synchronous
  //
  listen: (options) => {

    function createListener(options, cbk) {
      
      // if callback dosen't exist, retrive callback from options
      if (!cbk && options.callback) cbk = options.callback;
      
      if (options.callback) delete options.callback;

      client.listeners.push({
        options: options,
        callback: cbk
      });
      
      return (client.listeners.length - 1);
      
    }
    
    function removeListener(index) {
      
      if (worker.DEV_LOGS) {
        console.debug('[ServiceWorker] Removing client listener', client.listeners[index].options.forMsg);
      }
      
      let removedListener = client.listeners.splice(index, 1);
      
      if (worker.DEV_LOGS) {
        console.debug('[ServiceWorker] Removed client listener', removedListener);
      }
      
    }
    
    
    if (!options.callback) {
      
      return new Promise(resolve => {

        const listener = createListener(options, (data) => {
          
          // if conditions exist
          if (options.forMsg) {
            
            const conditions = Object.entries(options.forMsg);
            
            // check all conditions
            conditions.forEach(([name, value]) => {
              
              // if condition dosen't match, return
              if (data[name] !== value) return;
              
            });
            
          }
          
          // remove client listener
          removeListener(listener);
          
          resolve(data);
          
        });

      });
      
    } else {

      return createListener(options);

    }
    
  },
  
  initListeners: () => {
        
    self.addEventListener('message', (e) => {
      
      console.log(e);
      
      client.listeners.forEach(listener => {
        
        if (listener.options.fromClient === e.clientId) {
          
          listener.callback(e.data);
          
        }
                
      });
      
    });
    
    client.checkSafari();
    
  },
  
  // send fetch request to client
  sendRequest: (request, clientId) => {
    
    return new Promise(async (resolve, reject) => {
      
      let url = request.url;
  
      // append .html to url if navigating
      if (request.mode === 'navigate'
          && !url.endsWith('.html')
          && !url.endsWith('/')) url += '.html';
      
      if (worker.DEV_LOGS) {
        console.warn('[ServiceWorker] Recived request', request.mode, request.url);
      }
      
      
      // send request to client
      client.send({
        url: url,
        type: 'request'
      });
      
      // await client response
      const data = await client.listen({
        forMsg: { type: 'response', url: url },
        fromClient: clientId
      });
      
      if (worker.DEV_LOGS) {
        console.debug('[ServiceWorker] Recived response data from client', data);
      }
      

      // set MIME type depending on request mode
      let mimeType = 'application/octet-stream';
  
      if (request.mode === 'navigate'
          || url.endsWith('.html')) mimeType = 'text/html';
  
      if (request.mode === 'script'
          || url.endsWith('.js')) mimeType = 'text/javascript';
  
      if (request.mode === 'style'
          || url.endsWith('.css')) mimeType = 'text/css';
  
      if (url.endsWith('.wasm')) mimeType = 'application/wasm';


      // create Response from data
      const response = worker.createResponse(data.resp, mimeType, data.respStatus);

      if (worker.DEV_LOGS) {
        console.debug('[ServiceWorker] Resolved live view request with client response', response, data.resp, data.respStatus);
      }

      // resolve promise with Response
      resolve(response);

    });

  },
  
  liveView: {
    
    // format:
    // { [live view client ID]: [parent client ID] }
    parent: {},
    
    getParentId: (event, creatingNewLiveView) => {
      
      const url = event.request.url;      
      const liveViewId = event.clientId;
      
      let parentId;
      
      if (creatingNewLiveView) {
      
        parentId = url.split('?')[1].slice(0,-1);
      
      } else {
        
        parentId = client.liveView.parent[liveViewId];
      
      }
      
      return parentId;
      
    },
    
    // parse live view ID for Safari
    parseSafariId: (id, event) => {
      
      // double-check we're on Safari
      if (event.targetClientId) {
  
        // add 1 to live view ID
        
        let splitId = id.split('-');
  
        splitId[1] = Number(splitId[1]) + 1;
  
        id = splitId.join('-');
  
      }
      
      return id;
      
    }
    
  },
  
  isSafari: false,
  
  checkSafari: () => {
    
    let isMobile = false;
    
    if (navigator.userAgentData
        && navigator.userAgentData.mobile) isMobile = true;
    
    if (navigator.userAgent
        && navigator.userAgent.includes('Mobile')) isMobile = true;
    
    let isSafari = false;
    
    if (navigator.userAgentData
        && navigator.userAgentData.platform === 'iOS') isSafari = true;
    
    if (navigator.userAgent
        && isMobile
        && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) isSafari = true;
    
    client.isSafari = isSafari; 
    
  }
  
};

client.initListeners();


client.listen({callback: (message) => {

  if (message.type === 'updateWorker') self.registration.update();
  if (message.type === 'enableDebugLogs') worker.DEV_LOGS = true;
  if (message.type === 'disableDebugLogs') worker.DEV_LOGS = false;
  if (message.type === 'hello') worker.log('hello!');

}});


// add fetch listener
self.addEventListener('fetch', (event) => {

  const resp = worker.handleFetchRequest(event.request, event);

  event.respondWith(resp);

});

