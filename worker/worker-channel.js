
// client-side
// client/service worker communication channel


// setup worker channel
function setupWorkerChannel() {

  // register service worker
  navigator.serviceWorker.register('/worker/service-worker.js');

  // create broadcast channel
  const broadcast = new BroadcastChannel('worker-channel');

  // add message listener
  broadcast.onmessage = (event) => {
    console.log(event.data.payload);
  };

  // send request
  broadcast.postMessage({
    type: 'hello!'
  });

  console.log('registered listener');
  
}


// setup worker channel
setupWorkerChannel();

