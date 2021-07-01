let body = document.body,
    github = document.querySelector('.github');

github.addEventListener('click', () => {
  body.classList.toggle('expanded');
})

if (localStorage.getItem('history')) {
  codeit.innerText = localStorage.getItem('history');
}

window.onbeforeunload = function() {
  
  // set new localStorage value
  localStorage.setItem('code', codeit.innerText);
  
};
