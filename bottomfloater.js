
// function runs on updateFile() in gitsidebar.js
// if isMobile
function updateFloat() {
  
  // close sidebar
  body.classList.remove('expanded');
  
  // show bottom floater
  bottomFloat.classList.remove('hidden');
  
  // show selected file name
  floatLogo.innerText = selectedFile.name;
  
  // when sidebar animation finished
  window.setTimeout(() => {
    
    // focus codeit
    cd.textarea.focus();
    
  }, 400);
  
}


// open sidebar when clicked on button
sidebarOpen.addEventListener('click', () => {
  
  body.classList.add('expanded');
  
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
      
    } else { // if scrolled up
      
      // show bottom float
      bottomFloat.classList.remove('hidden');
      
    }
     
    lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    
  }, false);

}
