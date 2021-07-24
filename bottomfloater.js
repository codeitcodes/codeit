
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


// show bottom float when scrolled up
let lastScrollTop = 0;

// element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
cd.addEventListener('scroll', function() {
   var st = window.pageYOffset || document.documentElement.scrollTop;
   if (st > lastScrollTop){
      // downscroll code
   } else {
      // upscroll code
   }
   lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
}, false);
