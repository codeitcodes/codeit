
// function runs in loadFile() in gitsidebar.js
// if isMobile
function updateFloat() {
  
  // close sidebar
  body.classList.remove('expanded');
  saveSidebarStateLS();
  
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
  saveSidebarStateLS();

  let selectedItem = document.querySelector('.selected');
  
  if (selectedItem) {

    // scroll to selected file
    selectedItem.scrollIntoViewIfNeeded();

  }
  
})


function playPushAnimation(element) {
  
  let endAnimDuration = 0.18; // s
  let checkDelay = 2 - endAnimDuration;
  
  window.setTimeout(() => {

    element.classList.remove('checked');

  }, (checkDelay * 1000));
  
}

// show push icon in button
pushWrapper.innerHTML = pushIcon;

// push when clicked on button
pushWrapper.addEventListener('click', () => {
     
  // play push animation
  playPushAnimation(pushWrapper);
  
  // file cannot be modified
  // if its SHA was updated
  bottomFloat.classList.remove('modified');
  
  // create commit
  let commit = {};
  let file = {};
  
  // get selected file
  let selectedItem = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');
  
  if (selectedItem) {
  
    // set commit message
    commit.message = 'Update ' + selectedItem.innerText;
    
    // set commit file
    file.sha = getAttr(selectedItem, 'sha');
    file.selected = true;

    // push file asynchronously
    git.push(treeLoc, file, commit);
    
  }
  
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
