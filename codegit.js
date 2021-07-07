const body = document.body,
    
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
      searchClear = searchScreen.querySelector('.clear'),
    
      fileWrapper = sidebar.querySelector('.files');


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
    
  // show all files
  let files = fileWrapper.querySelectorAll('.file[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  header.classList.remove('searching');
  
  // clear search input
  window.setTimeout(() => {
    
    searchInput.innerText = '';
    
  }, 180);
  
})

// search when typed in input
searchInput.addEventListener('input', () => {
  
  let query = searchInput.innerText.toLowerCase();
  let files = fileWrapper.querySelectorAll('.file');
  
  // search files
  files.forEach(file => {
    
    let name = file.querySelector('.name').innerText;
    
    if (!name.toLowerCase().includes(query)) {

      file.style.display = 'none';

    }

    else {

      file.style.display = '';

    }

  })
  
  // if search query exists
  if (searchInput.innerText != '') {
    
    // show clear button
    searchClear.classList.add('visible');
    
  } else {
    
    // hide clear button
    searchClear.classList.remove('visible');
    
  }
  
})

// clear search input when clicked on button
searchClear.addEventListener('click', () => {
  
  // clear search input
  searchInput.innerText = '';
  
  // show all files
  let files = fileWrapper.querySelectorAll('.file[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // focus search input
  searchInput.focus();
  
})



window.onload = () => {
  
  if (getStorage('code')) {
    
    cd.setValue(getStorage('code'));
    cd.textarea.setSelectionRange(getStorage('caret'), getStorage('caret'));
    
  }
  
}

window.onbeforeunload = () => {
  
  // set new localStorage value
  setStorage('code', cd.textarea.value);
  setStorage('caret', cd.textarea.selectionStart);
  
};



// localStorage

let getStorage = (item) => {
  
  return localStorage.getItem(item);
  
}

let setStorage = (item, value) => {
  
  return localStorage.setItem(item, value);
  
}
