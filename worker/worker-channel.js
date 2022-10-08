
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
  
  // worker log
  log: async (log) => {
    
    const targetClient = (await clients.matchAll())[0];
    
    client.send({
      message: log,
      toClient: targetClient,
      type: 'message'
    });

  }
  
};


let client = {

  isSafari: self.navigator.userAgent.toLowerCase().includes('safari'),

  send: async (message) => {

    let targetClient = message.toClient;

    if (typeof targetClient === 'string') {
      
      targetClient = await this.clients.get(targetClient);
      
    } else {
      
      message.toClient = targetClient.id;
      
    }

    targetClient.postMessage(message);

  },
  
  // listen for client messages
  // options:
  // forMsg - object with message conditions to listen for
  // callback - defining this makes the function synchronous
  //
  listen: (options) => {

    function createListener(cbk) {
      
      return self.addEventListener('message', (e) => { cbk(e.data) });
      
    }
    
    
    if (!options.callback) {
      
      return new Promise(resolve => {

        const listener = createListener((data) => {
          
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
          self.removeEventListener(listener);
          
          resolve(data);
          
        });

      });
      
    } else {

      return createListener(options.callback);

    }
    
  },
  
  // send fetch request to client
  sendRequest: (request, clientId) => {
    
    return new Promise(async (resolve, reject) => {
      
      let url = request.url;
  
      // append .html to url if navigating
      if (request.mode === 'navigate'
          && !url.endsWith('.html')
          && !url.endsWith('/')) url += '.html';
  
      // set MIME type depending on request mode
      let mimeType = 'application/octet-stream';
  
      if (request.mode === 'navigate'
          || url.endsWith('.html')) mimeType = 'text/html';
  
      if (request.mode === 'script'
          || url.endsWith('.js')) mimeType = 'text/javascript';
  
      if (request.mode === 'style'
          || url.endsWith('.css')) mimeType = 'text/css';
  
      if (url.endsWith('.wasm')) mimeType = 'application/wasm';
      
  
      // send request to client
      client.send({
        url: url,
        toClient: clientId,
        type: 'request'
      });
      
      // await client response
      const data = await client.listen({
        forMsg: { type: 'response', url: url }
      });
      

      // create Response from data
      const response = worker.createResponse(data.resp, mimeType, data.respStatus);

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
    
  }
  
};


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

