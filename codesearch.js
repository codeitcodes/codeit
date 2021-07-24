
// open search screen on click of button
searchButton.addEventListener('click', () => {
  
  // focus search input
  searchInput.focus();
  
})

// open search on focus
searchInput.addEventListener('focus', () => {
  
  header.classList.add('searching');
  
})

// hide search on blur
searchInput.addEventListener('blur', () => {
  
  header.classList.remove('searching');
  
})

// close search screen on click of button
searchBack.addEventListener('click', () => {
    
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
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
  let files = fileWrapper.querySelectorAll('.item');
  
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
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // focus search input
  searchInput.focus();
  
})
