
searchInput.openSearch = () => {
  
  // clear search input
  searchInput.innerText = '';
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // update add button
  addButton.classList.remove('clear-button-visible');
  
  header.classList.add('searching');
  
  // focus search input
  searchInput.focus();
  
}

// open search screen on click of button
searchButton.addEventListener('click', searchInput.openSearch);

// open search on focus
searchInput.addEventListener('focus', () => {
  
  // if not already searching
  if (!header.classList.contains('searching')) {
    
    // open search
    searchInput.openSearch();
    
  }
  
})


// close search screen on click of button

searchInput.closeSearch = () => {
  
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  header.classList.remove('searching');
  
  if (document.activeElement === searchInput) {
    
    searchInput.blur();
    
  }
  
}

searchBack.addEventListener('click', searchInput.closeSearch);

searchInput.addEventListener('blur', () => {
  
  // if query is empty
  if (searchInput.textContent === '') {
    
    // close search
    searchInput.closeSearch();
    
  }
  
})


searchInput.search = () => {
  
  if (searchInput.innerHTML === '<br>') {

    searchInput.textContent = '';

  }

  let query = searchInput.textContent.toLowerCase().replaceAll('\n', '');
  
  // exclude 'more' button from search
  let files = fileWrapper.querySelectorAll('.item:not(.more)');
  
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
  if (searchInput.textContent !== '') {
    
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
  
  
  const moreButton = fileWrapper.querySelector('.item.more');
  
  // if more button exists
  // and is not disabled (loading more)
  if (moreButton &&
      !moreButton.classList.contains('disabled')) {
    
    // if more button is in view
    if (elInView(moreButton)) {
      
      // load more items
      clickedOnMoreButtonHTML(moreButton);
      
    }
    
  }
  
}

// search when typed in input
searchInput.addEventListener('input', searchInput.search);


searchInput.addEventListener('keydown', (e) => {

  // disable enter key in search input
  if (e.key === 'Enter') {
    
    e.preventDefault();
    
    // if query exists
    if (searchInput.textContent !== '') {
      
      searchInput.blur();
      
    }
    
  }
  
  if (e.key === 'Escape') {
    
    // close search
    e.preventDefault();
    searchInput.closeSearch();
    
  }

})


searchInput.clearSearch = () => {
  
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
    
}

// clear search input when clicked on button
searchClear.addEventListener('click', searchInput.clearSearch);

