
let contextMenu = {
  
  el: document.querySelector('.context-menu'),
  
  contextEl: null,
  
  addButtonListeners: () => {
    
    const push = contextMenu.el.querySelector('.push'),
          rename = contextMenu.el.querySelector('.rename'),
          addToNewFolder = contextMenu.el.querySelector('.add-to-new-folder'),
          discard = contextMenu.el.querySelector('.discard'),
          deleteItem = contextMenu.el.querySelector('.delete');
          
    push.addEventListener('click', async () => {
      
      const dialogResp = await checkPushDialogs();
    
      if (dialogResp === 'return') return;
      
      pushFileWithCommitMessageHTML(contextMenu.contextEl);
      
    });
    
    discard.addEventListener('click', () => {
      
      deleteModFileInHTML(contextMenu.contextEl);
      
    });
    
  },
  
  addFileListener: (file) => {
    
    if (!isMobile) {
      
      file.addEventListener('contextmenu', async (e) => {
        
        contextMenu.contextEl = file;
        
        contextMenu.el.style.top = e.clientY + 'px';
        contextMenu.el.style.left = e.clientX + 'px';
        
        contextMenu.el.classList.add('visible', 'animating');
        
        window.setTimeout(() => {
          
          contextMenu.el.classList.remove('animating');
          
        }, 180);
        
      });
      
    }
      
  }
  
}


sidebar.addEventListener('scroll', () => {

  if (contextMenu.el.classList.contains('visible')) {

    contextMenu.el.classList.remove('visible');

  }

});

document.addEventListener('mousedown', (e) => {
  
  if (contextMenu.el.classList.contains('visible')) {
    
    if (e.target.parentElement !== contextMenu.el &&
        e.target.parentElement.parentElement !== contextMenu.el) {
      
      contextMenu.el.classList.remove('visible');
      
    }
    
  }
  
});

contextMenu.el.addEventListener('click', () => {
  
  contextMenu.el.classList.remove('visible');
  
});



// disable context menu
if (!isMobile) {

  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

