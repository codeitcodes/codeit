
// worker-side
// client/service worker communication channel


// create broadcast channel
const broadcast = new BroadcastChannel('worker-channel');

broadcast.onmessage = (event) => {
  if (event.data && event.data.type === 'hello!') {
    broadcast.postMessage({
      payload: 'hi, what\'s up?',
      type: 'text'
    });
  }
};

