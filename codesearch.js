
// open search screen on click of button
searchButton.addEventListener('click', () => {
  
  // focus search input
  searchInput.focus();
  
})

// open search on focus
searchInput.addEventListener('focus', () => {
  
  header.classList.add('searching');
  
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
})

// hide search on blur
searchInput.addEventListener('blur', (e) => {
  
  console.log(e.target);
  
  // if not clicked on item
  if (!e.target.classList.contains('item')) {

    // show all files
    let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
    files.forEach(file => { file.style.display = '' });
    
  }
  
  header.classList.remove('searching');
  
})

// close search screen on click of button
searchBack.addEventListener('click', () => {
    
  searchInput.blur();
  
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
  
  // focus search input
  searchInput.focus();
  
  header.classList.add('searching');
  
})
