
// worker-side
// client/service worker communication channel

// find the current client
self.clients.matchAll({
  
  includeUncontrolled: true,
  type: 'window'
  
}).then((clients) => {
  
  if (clients && clients.length) {
    
    // send a response - the clients
    // array is ordered by last focused
    clients[0].postMessage({
      type: 'test',
      value: 'hello!',
    });
    
  }
  
});
    
