
// open search screen on click of button
searchButton.addEventListener('click', () => {
    
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
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
  
  let query = searchInput.textContent.toLowerCase();
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
  if (searchInput.innerText != '') {
    
    // show clear button
    searchClear.classList.add('visible');
    
  } else {
    
    // hide clear button
    searchClear.classList.remove('visible');
    
  }
  
})

// disable enter key in search input
searchInput.addEventListener('keydown', (e) => {

  if (e.key === 'Enter') {
    e.preventDefault();
  }

});

// clear search input when clicked on button
searchClear.addEventListener('click', () => {
  
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // focus search input
  searchInput.focus();
    
})
