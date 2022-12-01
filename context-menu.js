
// fix browser object parsing
let contextMenu = {
  el: document.querySelector('.context-menu')
};

contextMenu = {
  
  el: document.querySelector('.context-menu'),
  
  options: {
    push: contextMenu.el.querySelector('.push'),
    rename: contextMenu.el.querySelector('.rename'),
    share: contextMenu.el.querySelector('.share'),
    addToNewFolder: contextMenu.el.querySelector('.add-to-new-folder'),
    discardChanges: contextMenu.el.querySelector('.discard-changes'),
    deleteItem: contextMenu.el.querySelector('.delete')
  },
    
  activeEl: null,
  
  addOptionListeners: () => {
    
    const options = contextMenu.options;
    
    options.push.addEventListener('click', async () => {
      
      const dialogResp = await checkPushDialogs();
    
      if (dialogResp === 'return') return;
      
      pushFileWithCommitMessageHTML(contextMenu.activeEl);
      
    });
    
    options.share.addEventListener('click', async () => {
      
      const activeItemName = contextMenu.activeEl.querySelector('.name').textContent
                              .replaceAll('\n','');
      
      let link;
      
      if (contextMenu.activeEl.classList.contains('file')) {
        
        link = createLink({
          dir: treeLoc,
          file: { name: activeFileName },
          openLive: false
        });
        
      } else if (contextMenu.activeEl.classList.contains('folder')) {
        
        link = createLink({
          dir: [treeLoc[0], treeLoc[1], treeLoc[2] + '/' + activeItemName]
        });
        
      } else {
        
        let fullName = getAttr(contextMenu.activeEl, 'fullName');
        
        if (!fullName) {
          
          fullName = getAttr(contextMenu.activeEl, 'repoObj');
          
          fullName = JSON.parse(decodeURI(fullName)).fullName;
          
        }
        
        [user, repo] = fullName.split('/');
        
        link = createLink({
          dir: [user, repo, '']
        });
        
      }
      
      copy(link).then(() => {
      
        const [user, repo] = treeLoc;
        const repoObj = modifiedRepos[user + '/' + repo.split(':')[0]];
        
        if (!repoObj.private) {
          
          showMessage('Copied link!');
          
        } else {
          
          showMessage({
            icon: lockIcon,
            message: 'Copied private link!'
          });
          
        }
          
      });
      
    });
    
    options.discardChanges.addEventListener('click', () => {
      
      deleteModFileInHTML(contextMenu.activeEl);
      
    });
    
  },
  
  addItemListener: (item) => {
    
    if (!isMobile) {
      
      item.addEventListener('contextmenu', async (e) => {
        
        contextMenu.activeEl = item;
        item.classList.add('active');
        
        onNextFrame(() => {
          moveElToMouse(contextMenu.el, e, 13);
        });
        
        contextMenu.el.classList.add('visible', 'animating');
        
        if (item.classList.contains('file')) {
          
          contextMenu.el.classList.toggle('modified', item.classList.contains('modified'));
        
        } else {
          
          contextMenu.el.classList.remove('modified');
          
        }
        
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
    contextMenu.activeEl.classList.remove('active');

  }

});

document.addEventListener('mousedown', (e) => {
  
  if (contextMenu.el.classList.contains('visible')) {
    
    if (e.target.parentElement !== contextMenu.el &&
        e.target.parentElement.parentElement !== contextMenu.el) {
      
      contextMenu.el.classList.remove('visible');
      contextMenu.activeEl.classList.remove('active');
      
    }
    
  }
  
});

contextMenu.el.addEventListener('click', () => {
  
  contextMenu.el.classList.remove('visible');
  contextMenu.activeEl.classList.remove('active');
  
});



// disable context menu
if (!isMobile) {

  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

