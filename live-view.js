
// setup live view
async function setupLiveView() {
  
  const url = new URL(window.location.href);
  const urlQuery = url.searchParams.get('q');
  
  if (urlQuery) {

    window.history.pushState(window.location.origin, 'Codeit', window.location.origin + '/full');
    
    if (isMobile) {
      
      toggleSidebar(false);
      saveSidebarStateLS();
      
    } else {
      
      toggleSidebar(true);
      saveSidebarStateLS();
      
    }
    
    treeLoc = urlQuery.split('+')[0].split(',');
    saveTreeLocLS(treeLoc);
    
    const fileName = urlQuery.split('+')[1].split(',')[0];
    const fileSha = urlQuery.split('+')[1].split(',')[1];
    
    // change selected file
    changeSelectedFile(treeLoc.join(), fileSha, fileName, '\n\r', getFileLang(fileName),
                       [0, 0], [0, 0], false);
    
    // if on mobile device
    if (isMobile) {

      // update bottom float
      updateFloat();
      
      // don't transition bottom float
      bottomWrapper.classList.add('notransition');
      
      // expand bottom float
      bottomWrapper.classList.add('expanded');
      
      // fix bottom float on safari
      if (isSafari) bottomWrapper.classList.add('fromtop');
      
      // restore transition on next frame
      onNextFrame(() => {
        bottomWrapper.classList.remove('notransition');
      });
      
    } else {
      
      // don't transition live view
      liveView.classList.add('notransition');
      
      // show live view
      liveView.classList.add('visible');
      
      // restore transition on next frame
      onNextFrame(() => {
        liveView.classList.remove('notransition');
      });
      
    }
    
    // if file is not modified; fetch from Git
    if (!modifiedFiles[fileSha]) {

      // start loading
      startLoading();

      // get file from git
      const resp = await git.getFile(treeLoc, fileName);

      // change selected file
      changeSelectedFile(treeLoc.join(), fileSha, fileName, resp.content, getFileLang(fileName),
                         [0, 0], [0, 0], false);

      // stop loading
      stopLoading();

    } else { // else, load file from modifiedFiles object

      const modFile = modifiedFiles[fileSha];

      changeSelectedFile(modFile.dir, modFile.sha, modFile.name, modFile.content, modFile.lang,
                         modFile.caretPos, modFile.scrollPos, false);

    }
    
    // open live view
    toggleLiveView(selectedFile);
    
    // show file content in codeit
    cd.textContent = decodeUnicode(selectedFile.content);

    // change codeit lang
    cd.lang = selectedFile.lang;

    // set caret pos in codeit
    cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

    // set scroll pos in codeit
    cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

    // clear codeit history
    cd.history = [];

    // update line numbers
    updateLineNumbersHTML();
    
    // if on desktop
    if (!isMobile) {

      // update scrollbar arrow
      updateScrollbarArrow();

    }
    
  }
  
}

// open live view when swiped up on bottom float
function addBottomSwipeListener() {
  
  let yBoundary = 30;
  
  let currentY;
  let initialY;
  let yOffset = 0;

  let active = false;
  let click = false;
  let swiped = false;

  let direction = 0;

  bottomWrapper.addEventListener('touchstart', dragStart, false);
  bottomWrapper.addEventListener('touchend', dragEnd, false);
  bottomWrapper.addEventListener('touchmove', drag, false);

  bottomWrapper.addEventListener('mousedown', dragStart, false);
  bottomWrapper.addEventListener('mouseup', dragEnd, false);
  bottomWrapper.addEventListener('mousemove', drag, false);

  function dragStart(e) {
    
    if (e.type === 'touchstart') {
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialY = e.clientY - yOffset;
    }

    active = true;
    click = true;
    swiped = false;
    
  }

  function dragEnd(e) {
    
    initialY = currentY;
    
    const clickedOnShare = (e.target ===
                            bottomWrapper.querySelector('.live-button.share'));
    
    // if clicked and bottom float is expanded
    if (click && bottomWrapper.classList.contains('expanded')) {
      
      // if did not click on share button
      if (!clickedOnShare) {
        
        e.preventDefault();
        e.stopPropagation();
        
        // fix bottom float on safari
        if (isSafari) {
          
          bottomWrapper.classList.remove('fromtop');
          bottomWrapper.classList.add('notransition');
          
          onNextFrame(() => {
            
            bottomWrapper.classList.remove('notransition');
            
            onNextFrame(() => {
              
              // retract bottom float
              bottomWrapper.classList.remove('expanded');
              
            });
            
          });
          
        } else {
          
          // retract bottom float
          bottomWrapper.classList.remove('expanded');
          
        }

        toggleLiveView(selectedFile);
        
      } else {
        
        // if clicked on share button,
        // share live view URL
        
        const shareData = {
          title: 'Share live view',
          text: 'Run ' + treeLoc[0] + '/' + treeLoc[1] + ' with Codeit: ' +
                window.location.origin + '/full?q=' + encodeURIComponent(treeLoc.join(',') + '+' + selectedFile.name + ',' + selectedFile.sha) + '&l=true'
        }
        
        if (isMobile) {
          
          try {

            navigator.share(shareData);

          } catch(e) {

            copy(shareData.text);
            alert('Copied link to clipboard.');

          }
          
        } else {
          
          copy(shareData.text);
          alert('Copied link to clipboard.');

        }
        
      }
      
    }

    yOffset = 0;
    active = false;
    
  }

  function drag(e) {
    
    if (active) {
      
      e.preventDefault();

      if (e.type === 'touchmove') {
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentY = e.clientY - initialY;
      }

      yOffset = currentY;
      
      // check swipe direction
      if (yOffset < 0) {
        direction = 'up';
      } else {
        direction = 'down';
      }
      
      // check if passed swipe boundary
      if (Math.abs(yOffset) > yBoundary) {
        swiped = true;
      } else {
        swiped = false;
      }
      
      if (direction == 'up') {
        
        // if swiped up and bottom float isn't expanded
        if (swiped && !bottomWrapper.classList.contains('expanded')) {
          
          swiped = false;
          
          // expand bottom float
          bottomWrapper.classList.add('expanded');
          
          // fix bottom float on safari
          // when finished transitioning
          if (isSafari) {
            
            window.setTimeout(() => {
              
              bottomWrapper.classList.add('fromtop');
              
            }, 400);
            
          }
          
          toggleLiveView(selectedFile);
          
        }
        
      } else if (direction == 'down') {
        
        // if swiped down and bottom float is expanded
        if (swiped && bottomWrapper.classList.contains('expanded')) {
          
          swiped = false;
          
          // fix bottom float on safari
          if (isSafari) {

            bottomWrapper.classList.remove('fromtop');
            bottomWrapper.classList.add('notransition');

            onNextFrame(() => {

              bottomWrapper.classList.remove('notransition');

              onNextFrame(() => {

                // retract bottom float
                bottomWrapper.classList.remove('expanded');

              });

            });
            
          } else {

            // retract bottom float
            bottomWrapper.classList.remove('expanded');

          }
          
          toggleLiveView(selectedFile);
          
        }
        
      }

      click = false;
      
    }
    
  }
  
}

function updateLiveViewArrow() {
  
  if (selectedFile.lang == 'html' || selectedFile.lang == 'svg') {
    
    liveToggle.classList.add('visible');
    
  } else {
    
    liveToggle.classList.remove('visible');
    
  }
  
}


if (isMobile) {
  
  addBottomSwipeListener();

} else {
  
  liveToggle.querySelector('.arrow').addEventListener('click', () => {
    
    // toggle live view
    liveView.classList.toggle('visible');
    toggleLiveView(selectedFile);
    
  });
  
  liveToggle.querySelector('.share').addEventListener('click', () => {
    
    // if clicked on share button,
    // share live view URL

    const shareData = 'Run ' + treeLoc[0] + '/' + treeLoc[1] + ' with Codeit: ' +
                      window.location.origin + '/full?q=' + encodeURIComponent(treeLoc.join(',') + '+' + selectedFile.name + ',' + selectedFile.sha) + '&l=true';

    copy(shareData);
    alert('Copied link to clipboard.');
    
  });
  
  document.addEventListener('keydown', handleMetaP);

  function handleMetaP(e) {

    // detect ctrl/cmd+P
    if ((e.key === 'p' || e.keyCode === 80) && isKeyEventMeta(e)) {

      e.preventDefault();

      liveView.classList.toggle('visible');
      toggleLiveView(selectedFile);

    }

  }
  
}


let liveViewToggle;
let liveViewTimeout;

// toggle live view for file
function toggleLiveView(file) {
  
  liveViewToggle = !liveViewToggle;
  
  window.clearTimeout(liveViewTimeout);
  
  // if live view is visible
  if (liveViewToggle) {
    
    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
    }
    
    if (file.lang == 'html' || file.lang == 'svg') {
      
      window.setTimeout(() => {
        
        if (liveViewToggle && !liveView.classList.contains('loaded')) {
          
          liveView.classList.add('loading');
          
        }
        
      }, 1200);
      
      renderLiveViewHTML(file);
    
    }
    
  } else {
    
    liveView.classList.remove('loading');
    
    if (isMobile) {
      
      // show loader
      liveView.classList.remove('loaded');
      
      document.querySelector('meta[name="theme-color"]').content = '#313744';
      
    }
    
    liveViewTimeout = window.setTimeout(() => {
      
      // clear live view
      liveView.innerHTML = '';
      
      if (!isMobile) {
        
        // show loader
        liveView.classList.remove('loaded');
        
      }
      
    }, 400);
    
  }
  
}


// render live view for HTML files
function renderLiveViewHTML(file) {
  
  liveView.innerHTML = '<iframe name="' + file.name + '" title="' + file.name + '" class="live-frame" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe>';

  const frame = liveView.querySelector('.live-frame');        
  const frameDocument = frame.contentDocument;
  
  frameDocument.addEventListener('keydown', handleMetaP);
  frameDocument.documentElement.innerHTML = decodeUnicode(file.content);
  
  // fetch styles
  const frameLinks = frameDocument.querySelectorAll('link[rel="stylesheet"]');
  
  if (frameLinks.length > 0) {
    
    frameLinks.forEach(async (link) => {

      const linkHref = new URL(link.href);
      const fileName = linkHref.pathname.slice(1);

      if (linkHref.origin == window.location.origin) {

        const file = Object.values(modifiedFiles).filter(file => (file.dir == selectedFile.dir.split(',') && file.name == fileName));
        let resp;

        if (!file[0]) {
          
          try {
            resp = await git.getFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));
          } catch(e) { resp = ''; }

        } else {

          resp = file[0];

        }

        link.outerHTML = '<style>' + decodeUnicode(resp.content) + '</style>';
        
        // hide loader
        liveView.classList.add('loaded');
        
        // remove original tag
        link.remove();

      } else {
        
        // hide loader
        liveView.classList.add('loaded');
        
      }
      
    });
    
  } else {
    
    // hide loader
    liveView.classList.add('loaded');
    
  }

  // fetch scripts
  fetchLiveViewScripts(frameDocument);
  
  // fetch images
  frameDocument.querySelectorAll('img').forEach(async (image) => {

    const linkHref = new URL(image.src);
    const fileName = linkHref.pathname.slice(1);

    if (linkHref.origin == window.location.origin) {

      // if image is in current directory
      if (!(linkHref.pathname.slice(1).includes('/'))) {

        // fetch file element for its SHA
        let fileEl = Array.from(fileWrapper.querySelectorAll('.item.file'))
                     .filter(file => file.querySelector('.name').textContent == linkHref.pathname.slice(1));

        fileEl = (fileEl.length > 0) ? fileEl[0] : null;

        // if image file exists
        if (fileEl !== null) {
          
          // fetch image
          
          let fileName = linkHref.pathname.split('/');
          fileName = fileName[fileName.length-1];
          
          // get MIME type (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
          let mimeType = 'image/' + fileName.split('.')[1];

          if (mimeType.endsWith('svg')) mimeType = 'image/svg+xml';
          
          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), getAttr(fileEl, 'sha'));

          image.src = 'data:' + mimeType + ';base64,' + resp.content;
          
        }
        
      } else if (!(linkHref.pathname.slice(1).includes('./'))) { // if image is below current directory
        
        // fetch image
        
        let fileName = linkHref.pathname.split('/');
        fileName = fileName[fileName.length-1];
        
        // get MIME type
        let mimeType = 'image/' + fileName.split('.')[1];
        
        if (mimeType.endsWith('svg')) mimeType = 'image/svg+xml';
        
        const resp = await git.getFile(selectedFile.dir.split(','), fileName);
        
        image.src = 'data:' + mimeType + ';base64,' + resp.content;

      }

    }

  })
  
  // fetch videos
  frameDocument.querySelectorAll('video').forEach(async (video) => {

    const linkHref = new URL(video.src);
    const fileName = linkHref.pathname.slice(1);

    if (linkHref.origin == window.location.origin) {

      // if video is in current directory
      if (!(linkHref.pathname.slice(1).includes('/'))) {

        // fetch file element for its SHA
        let fileEl = Array.from(fileWrapper.querySelectorAll('.item.file'))
                     .filter(file => file.querySelector('.name').textContent == linkHref.pathname.slice(1));

        fileEl = (fileEl.length > 0) ? fileEl[0] : null;

        // if video file exists
        if (fileEl !== null) {
          
          // fetch video
          
          let fileName = linkHref.pathname.split('/');
          fileName = fileName[fileName.length-1];
          
          // get MIME type
          let mimeType = 'video/' + fileName.split('.')[1];
          
          if (mimeType.endsWith('avi')) mimeType = 'video/x-msvideo';
          if (mimeType.endsWith('ogv')) mimeType = 'video/ogg';
          if (mimeType.endsWith('ts')) mimeType = 'video/mp2t';
          
          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), getAttr(fileEl, 'sha'));

          video.src = 'data:' + mimeType + ';base64,' + resp.content;

        }

      }

    }

  })
  
  // fetch audio
  frameDocument.querySelectorAll('audio').forEach(async (audio) => {

    const linkHref = new URL(audio.src);
    const fileName = linkHref.pathname.slice(1);

    if (linkHref.origin == window.location.origin) {

      // if audio file is in current directory
      if (!(linkHref.pathname.slice(1).includes('/'))) {

        // fetch file element for its SHA
        let fileEl = Array.from(fileWrapper.querySelectorAll('.item.file'))
                     .filter(file => file.querySelector('.name').textContent == linkHref.pathname.slice(1));

        fileEl = (fileEl.length > 0) ? fileEl[0] : null;

        // if audio file exists
        if (fileEl !== null) {
          
          // fetch audio
          
          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), getAttr(fileEl, 'sha'));

          audio.src = 'data:audio/mpeg;base64,' + resp.content;

        }

      }

    }

  })

}


async function fetchLiveViewScripts(frameDocument) {
  
  // fetch scripts
  await asyncForEach(frameDocument.querySelectorAll('script'), async (script) => {
    
    // if script is external
    if (script.src) {

      const linkHref = new URL(script.src);
      const fileName = linkHref.pathname.slice(1);

      if (linkHref.origin == window.location.origin) {

        const file = Object.values(modifiedFiles).filter(file => (file.dir == selectedFile.dir.split(',') && file.name == fileName));
        let resp;

        if (!file[0]) {

          resp = await git.getFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));

        } else {

          resp = file[0];

        }

        addScript(frameDocument, decodeUnicode(resp.content), false, script.type);

        // remove original tag
        script.remove();

      } else {

        await addScript(frameDocument, false, script.src, script.type);
        
        // delete original
        script.remove();

      }

    } else {

      addScript(frameDocument, script.textContent, false, script.type);

      // delete original
      script.remove();

    }

  });
  
}


function addScript(documentNode, code, src, type) {
  
  return new Promise((resolve) => {
    
    const script = documentNode.createElement('script');

    if (type && type != '') script.type = type;

    if (code) {

      script.appendChild(documentNode.createTextNode(code));

    } else {

      script.src = src;
      script.defer = true;
      script.async = false;
      
      script.onload = resolve;
      script.onerror = resolve;

    }

    documentNode.head.appendChild(script);
    
  });
  
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
