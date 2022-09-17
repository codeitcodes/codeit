
// open search screen on click of button
searchButton.addEventListener('click', () => {
    
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // update add button
  addButton.classList.remove('clear-button-visible');
  
  // focus search input
  searchInput.focus();
  
})

// open search on focus
searchInput.addEventListener('focus', () => {
  
  header.classList.add('searching');
  
})

// close search screen on click of button
searchBack.addEventListener('click', () => {
  
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  header.classList.remove('searching');
  
})

// search when typed in input
searchInput.addEventListener('input', () => {
    
  let query = searchInput.textContent.toLowerCase().replaceAll('\n', '');
  let files = fileWrapper.querySelectorAll('.item');
  
  // search files
  files.forEach(file => {
    
    let name = file.querySelector('.name').textContent;
    
    if (!name.toLowerCase().includes(query)) {

      file.style.display = 'none';

    }

    else {

      file.style.display = '';

    }

  })
  
  
  // if search query exists
  if (searchInput.textContent != '') {
    
    // show clear button
    searchClear.classList.add('visible');
    
    // rotate add button
    addButton.classList.add('clear-button-visible');
    
  } else {
    
    // hide clear button
    searchClear.classList.remove('visible');
    
    // update add button
    addButton.classList.remove('clear-button-visible');
    
  }
  
})

// disable enter key in search input
searchInput.addEventListener('keydown', (e) => {

  if (e.key === 'Enter') {
    
    e.preventDefault();
    searchInput.blur();
    
  }

})

// clear search input when clicked on button
searchClear.addEventListener('click', () => {
  
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // update add button
  addButton.classList.remove('clear-button-visible');
  
  // focus search input
  searchInput.focus();
    
})

