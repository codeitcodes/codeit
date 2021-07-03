let body = document.body,
    
    github = document.querySelector('.github'),
    
    sidebar = document.querySelector('.sidebar'),
    header = sidebar.querySelector('.header'),
    
    titleScreen = header.querySelector('.titlescreen'),
    searchScreen = header.querySelector('.searchscreen'),
    
    sidebarTitle = titleScreen.querySelector('.title'),
    sidebarLogo = sidebarTitle.querySelector('.logo'),
    
    searchButton = titleScreen.querySelector('.search'),
    searchBack = searchScreen.querySelector('.back'),
    searchInput = searchScreen.querySelector('.searchinput'),
    searchClear = searchScreen.querySelector('.clear');


// toggle sidebar on click of bookmark
github.addEventListener('click', () => {
  
  body.classList.toggle('expanded');
  
})



// open search screen on click of button
searchButton.addEventListener('click', () => {
  
  header.classList.add('searching');
  
  // focus search input
  searchInput.focus();
  
})

// close search screen on click of button
searchBack.addEventListener('click', () => {
  
  header.classList.remove('searching');
  
})

// search when typed in input
searchInput.addEventListener('input', () => {
  
  // if search query exists
  if (searchInput.innerText != '') {
    
    // show clear button
    searchClear.classList.add('visible');
    
  } else {
    
    // hide clear button
    searchClear.classList.remove('visible');
    
  }
  
})

// clear search query when clicked button
searchClear.addEventListener('click', () => {
  
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // focus search input
  searchInput.focus();
  
})



















if (localStorage.getItem('history')) {
  codeit.innerText = localStorage.getItem('history');
}

window.onbeforeunload = function() {
  
  // set new localStorage value
  localStorage.setItem('code', codeit.innerText);
  
};
