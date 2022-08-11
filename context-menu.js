
let contextMenu = {
  
  addFileListener: (file) => {
    
    if (!isMobile) {
      
      file.addEventListener('contextmenu', (e) => {
        
        contextMenuEl.classList.add('visible');
        
      });
      
    }
      
  }
  
}


// disable context menu
if (!isMobile) {

  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

