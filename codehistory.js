let history = document.querySelector('.history-wrapper');

let code;

if (localStorage.getItem('history')) {
  code = localStorage.getItem('history');
}

history.addEventListener('click', () => {
  
  codedit.setValue(code);
  
});

window.onbeforeunload = function() {
  
  // set new localStorage value
  localStorage.setItem('code', codedit.input.value);
  
};
