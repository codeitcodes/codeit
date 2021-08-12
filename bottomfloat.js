
// function runs in loadFile() in gitsidebar.js
// if isMobile
function updateFloat() {
  
  // close sidebar
  body.classList.remove('expanded');
  
  // show bottom floater
  bottomFloat.classList.remove('hidden');
  
  // if selected file is modified, show flag
  if (modifiedFiles[selectedFile.sha]) bottomFloat.classList.add('modified');
  else bottomFloat.classList.remove('modified');
  
  // show selected file name
  floatLogo.innerText = selectedFile.name;
  
}


// open sidebar when clicked on button
sidebarOpen.addEventListener('click', () => {
  
  body.classList.add('expanded');

  let selectedItem = document.querySelector('.selected');
  
  if (selectedItem) {

    // scroll to selected file
    selectedItem.scrollIntoViewIfNeeded();

  }
  
})


// push when clicked on button
pushWrapper.addEventListener('click', () => {
  
  
  
})


// if on mobile device
if (isMobile) {
  
  // show bottom float when scrolled up
  
  let lastScrollTop = 0;
  
  cd.addEventListener('scroll', function() {
    
    var st = cd.scrollTop;
    
    // if scrolled down
    if (st > lastScrollTop) {
      
      // hide bottom float
      bottomFloat.classList.add('hidden');
      
      // if scrolled to end
      if (st >= cd.scrollHeight) {
        
        // set timeout
        window.setTimeout(() => {
          
          // if still on bottom of codeit
          if (st >= cd.scrollHeight) {
            
            // show bottom float
            bottomFloat.classList.remove('hidden');
            
          }
          
        }, 400);
        
      }
      
    } else { // if scrolled up
      
      // if passed threshold
      if ((lastScrollTop - st) > 20) {
      
        // show bottom float
        bottomFloat.classList.remove('hidden');
        
      }
      
    }
     
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    
  }, false);

}
