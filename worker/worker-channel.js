
// client-side
// service worker/client communication channel


let workerChannel;
let workerInstallPromise;

let workerClientId;


// setup worker channel
async function setupWorkerChannel() {

  // register service worker
  
  workerInstallPromise = navigator.serviceWorker.register('/service-worker.js');
  
  await workerInstallPromise;
  
  
  let numOfRequests = 0;
  
  async function pingWorkerForClientId() {
    
    // get client ID from worker
    let resp = await axios.get('/worker/getClientId', '', true);
    
    try {
      resp = JSON.parse(resp);
    } catch(e) {
      resp = '';
      console.log('%c[Client] Pinged ServiceWorker for installation', 'color: #80868b');
    }
    
    if (numOfRequests < 500) {
      
      if (!resp || !resp.clientId) {
        
        numOfRequests++;
        return await pingWorkerForClientId();
        
      } else {
        
        return resp.clientId;
        
      }
      
    } else {
      
      return null;
      
    }
    
  }
  
  // ping worker for client ID
  
  workerInstallPromise = pingWorkerForClientId();
  
  workerClientId = await workerInstallPromise;
    
  workerInstallPromise = null;
    
  
  // create worker channel
  workerChannel = new BroadcastChannel('worker-channel');
  
  
  // add worker channel listener
  workerChannel.addEventListener('message', async (event) => {
        
    // if message is for current client
    if (event.data.toClient === workerClientId) {

      // if recived request
      if (event.data.type === 'request') {
  
        // send request to /live-view/live-view.js
        // for handling
        const {fileContent, respStatus} =
              await handleLiveViewRequest(event.data.url);
  
        // send response back to worker
        workerChannel.postMessage({
          url: event.data.url,
          resp: fileContent,
          respStatus: (respStatus ?? 200),
          fromClient: workerClientId,
          type: 'response'
        });
  
      } else if (event.data.type === 'reload') { // if recived reload request
  
        // reload page
        window.location.reload();
  
      } else if (event.data.type === 'message') { // if recived message
  
        // log message
        console.debug(event.data.message);
  
      }
      
    }

  });
  
  
  window.addEventListener('load', () => {
    
    if (getStorage('workerDevLogs')) {
            
      workerChannel.postMessage({
        type: 'enableDevLogs'
      });
      
    }
    
  });

}


// enable service worker logs
function enableWorkerLogs() {
  
  setStorage('workerDevLogs', 'true');
  window.location.reload();
  
}


try {
  axios = axios;
} catch(e) {
  window.axios = null;
}

axios = {
  'get': (url, token, noParse) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {}
          }
        };
        xmlhttp.onerror = function () {
          if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {}
          }
        };

        xmlhttp.open('GET', url, true);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};


// setup worker channel
setupWorkerChannel();

