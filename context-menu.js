
let contextMenu = {
  
  el: document.querySelector('.context-menu'),
  
  addFileListener: (file) => {
    
    if (!isMobile) {
      
      file.addEventListener('contextmenu', (e) => {
        
        contextMenu.el.style.top = e.clientY + 'px';
        contextMenu.el.style.left = e.clientX + 'px';
        
        contextMenu.el.classList.add('visible');
        
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

