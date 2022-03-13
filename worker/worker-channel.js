
// client-side
// service worker/client communication channel


let workerChannel;


// setup worker channel
async function setupWorkerChannel() {
  
  // register service worker
  await navigator.serviceWorker.register('/service-worker.js');
  
  
  // create worker channel
  workerChannel = new BroadcastChannel('worker-channel');


  // add worker channel listener
  workerChannel.addEventListener('message', async (event) => {
    
    // if recived request
    if (event.data.type === 'request') {
      
      // send request to /live-view/live-view.js
      // for handling
      const [resp, respType, respCode] = await handleLiveViewRequest(event.data.url);
      
      // send response back to worker
      workerChannel.postMessage({
        url: event.data.url,
        resp: resp,
        respType: respType,
        respCode: (respCode ?? 200),
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
  
}


// setup worker channel
setupWorkerChannel();

