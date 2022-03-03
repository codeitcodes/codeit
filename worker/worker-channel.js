
// client-side
// client/service worker communication channel


// setup worker channel
async function setupWorkerChannel() {

  // register service worker
  await navigator.serviceWorker.register('/worker/service-worker.js');

  // create broadcast channel
  const broadcast = new BroadcastChannel('worker-channel');

  // add message listener
  broadcast.onmessage = (event) => {
    
    if (event.data.type === 'json') {
      
      console.log(JSON.parse(event.data.payload));
      
    } else {
      
      console.log(event.data.payload);
      
    }
    
  };

  // send request
  broadcast.postMessage({
    type: 'hello!'
  });
  
}


// setup worker channel
setupWorkerChannel();

