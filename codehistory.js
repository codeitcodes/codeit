let history = document.querySelector('.history-wrapper');

//codedit.setValue(localStorage.getItem('code'));

history.addEventListener('click', () => {
  
  if (localStorage.getItem('history')) {
    // if code in storage, show it
    codedit.setValue(localStorage.getItem('code'));
  }
  
});

window.onbeforeunload = function() {
  
  // set new localStorage value
  localStorage.setItem('code', codedit.code.value);
  
};
