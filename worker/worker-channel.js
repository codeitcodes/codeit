
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
    
  //workerInstallPromise = null;
  
  
  console.log(workerInstallPromise);
  // get client ID from worker
  workerClientId = await axios.get('/worker/getLatestClientId', '', true);
  console.log(workerClientId);
  
  
  // create worker channel
  workerChannel = new BroadcastChannel('worker-channel');
  
  
  // add worker channel listener
  workerChannel.addEventListener('message', async (event) => {

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
        type: 'response'
      });

    } else if (event.data.type === 'reload') { // if recived reload request

      // reload page
      window.location.reload();

    } else if (event.data.type === 'message') { // if recived message

      // log message
      console.log(event.data.message);

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


// setup worker channel
setupWorkerChannel();

