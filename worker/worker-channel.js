
// client-side
// client/service worker communication channel

// add message event listener
window.addEventListener('message', (event) => {

  console.log(event);
  
  // if message is from service worker
  if (event.source) {
  }
  
});
