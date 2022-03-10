
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
  workerChannel.addEventListener((evt) => {
    
    // if recived request
    if (event.data.type === 'request') {
      
    } else if (event.data.type === 'message') { // if recived message
      
      // log message
      console.log(event.data.message);
      
    }
    
  });

  // send request
  broadcast.postMessage({
    type: 'hello!'
  });
  
}


// setup worker channel
setupWorkerChannel();

