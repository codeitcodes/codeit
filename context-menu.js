
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


sidebar.addEventListener('scroll', () => {

  if (contextMenu.el.classList.contains('visible')) {

    contextMenu.el.classList.remove('visible');

  }

});

document.addEventListener('mousedown', () => {
  
  contextMenu.el.classList.remove('visible');
  
});



// disable context menu
if (!isMobile) {

  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

