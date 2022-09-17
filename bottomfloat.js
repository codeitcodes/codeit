
// function runs in loadFile() in gitsidebar.js
// if isMobile
function updateFloat() {

  // close sidebar
  toggleSidebar(false);
  saveSidebarStateLS();
  
  // show bottom floater
  bottomWrapper.classList.remove('hidden');

  // if selected file is modified, show flag
  if (modifiedFiles[selectedFile.sha] &&
      !modifiedFiles[selectedFile.sha].eclipsed) {
    
    bottomFloat.classList.add('modified');
    
  } else {
    
    bottomFloat.classList.remove('modified');
    
    if (pushWrapper.classList.contains('checked')) {
      
      pushWrapper.classList.remove('checked');
      
    }
    
  }

  // show selected file name
  floatLogo.innerText = selectedFile.name;

}


// open sidebar when clicked on button
sidebarOpen.addEventListener('click', () => {
  
  // if bottom float isn't expanded
  if (!liveView.querySelector('.live-frame')) {
    
    toggleSidebar(true);
    saveSidebarStateLS();

    let selectedEl = fileWrapper.querySelector('.item.selected');

    if (selectedEl) {

      // scroll to selected file
      selectedEl.scrollIntoViewIfNeeded();

    }
    
  }

})


const pushAnimDuration = 0.85; // s
const endAnimDuration = 0.18; // s
const checkDelay = (2 - endAnimDuration) * 1000; // ms

function playPushAnimation(element) {

  element.classList.add('checked');

  window.setTimeout(() => {

    element.classList.remove('checked');

  }, checkDelay);

}

// show push icon in button
pushWrapper.innerHTML = pushIcon;

// push when clicked on button
pushWrapper.addEventListener('click', async () => {
  
  // get selected file element
  let selectedEl = fileWrapper.querySelector('.file.modified[sha="'+ selectedFile.sha +'"]');
  
  // if selected file element is modified
  if (selectedEl) {
    
    const dialogResp = await checkPushDialogs();
    
    if (dialogResp === 'return') return;
    
    
    // play push animation
    playPushAnimation(pushWrapper);
    
    // push file
    pushFileFromHTML(selectedEl, ('Update ' + selectedEl.innerText));
    
  }

})


// download selected file on click of button
floatDownload.addEventListener('click', downloadSelFile);


// if on mobile
if (isMobile) {

  cd.on('scroll', checkBottomFloat, false);
  
  cd.on('blur', () => {
    
    bottomWrapper.classList.remove('hidden');
    
  });

}


// show bottom float when scrolled up

let lastScrollTop = 0;

function checkBottomFloat() {

  let st = cd.scrollTop;

  // if scrolled down
  if (st > lastScrollTop) {

    // hide bottom float
    bottomWrapper.classList.add('hidden');

    // if scrolled to bottom of codeit
    if ((st + cd.offsetHeight) >= cd.scrollHeight) {

      // set timeout
      window.setTimeout(() => {

        // if still on bottom of codeit
        if ((cd.scrollTop + cd.offsetHeight) >= cd.scrollHeight) {

          // show bottom float
          bottomWrapper.classList.remove('hidden');

        }

      }, 400);

    }

  } else { // if scrolled up

    // if passed threshold
    if ((lastScrollTop - st) > 20) {

      // show bottom float
      bottomWrapper.classList.remove('hidden');

    }

  }

  lastScrollTop = st <= 0 ? 0 : st; // for mobile or negative scrolling

}
