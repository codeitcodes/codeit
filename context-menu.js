
let contextMenu = {
  
  el: document.querySelector('.context-menu'),
  
  contextEl: null,
  
  options: {
    push: contextMenu.el.querySelector('.push'),
    rename: contextMenu.el.querySelector('.rename'),
    addToNewFolder: contextMenu.el.querySelector('.add-to-new-folder'),
    discardChanges: contextMenu.el.querySelector('.discard-changes'),
    deleteItem: contextMenu.el.querySelector('.delete')
  },
  
  addOptionListeners: () => {
    
    const options = contextMenu.options;
    
    options.push.addEventListener('click', async () => {
      
      const dialogResp = await checkPushDialogs();
    
      if (dialogResp === 'return') return;
      
      pushFileWithCommitMessageHTML(contextMenu.contextEl);
      
    });
    
    options.discardChanges.addEventListener('click', () => {
      
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
        
        contextMenu.classList.toggle('modified', file.classList.contains('modified'));
        
        window.setTimeout(() => {
          
          contextMenu.el.classList.remove('animating');
          
        }, 180);
        
      });
      
    }
      
  }
  
}

contextMenu.addOptionListeners();


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

