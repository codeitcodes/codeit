let history = document.querySelector('.history-wrapper');

history.addEventListener('click', () => {
  
  if (localStorage.getItem('history')) {
    codeit.innerText = localStorage.getItem('history');
  }
  
});

window.onbeforeunload = function() {
  
  // set new localStorage value
  localStorage.setItem('code', codeit.innerText);
  
};
