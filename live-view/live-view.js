
// setup live view
async function setupLiveView() {

  // if URL has a file
  if (linkData.file) {

    // get file from URL
    const fileName = linkData.file.name;
    const fileSha = linkData.file.sha;
    
    
    // don't transition
    body.classList.add('notransition');

    // if on mobile device
    if (isMobile) {
      
      // close sidebar
      toggleSidebar(false);
      saveSidebarStateLS();

    } else {
      
      // open sidebar
      toggleSidebar(true);
      saveSidebarStateLS();

    }

    // restore transition on next frame
    onNextFrame(() => {
      body.classList.remove('notransition');
    });
    
    
    // if URL has a live view flag
    if (linkData.openLive) {

      // if on mobile device
      if (isMobile) {
        
        // clear selected file name
        floatLogo.innerText = '';

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
      
    }
    
    function closeLiveView() {

      // if URL has a live view flag
      if (linkData.openLive) {

        // if on mobile device
        if (isMobile) {
          
          // don't transition
          body.classList.add('notransition');
          
          // open sidebar
          toggleSidebar(true);
          saveSidebarStateLS();
          
          // restore transition on next frame
          onNextFrame(() => {
            body.classList.remove('notransition');
          });
          

          // don't transition bottom float
          bottomWrapper.classList.add('notransition');

          // close bottom float
          bottomWrapper.classList.remove('expanded');

          // fix bottom float on safari
          if (isSafari) bottomWrapper.classList.remove('fromtop');

          // restore transition on next frame
          onNextFrame(() => {
            bottomWrapper.classList.remove('notransition');
          });

        } else {

          // don't transition live view
          liveView.classList.add('notransition');

          // hide live view
          liveView.classList.remove('visible');

          // restore transition on next frame
          onNextFrame(() => {
            liveView.classList.remove('notransition');
          });

        }

      }
      
    }
    

    // if file is not modified; fetch from Git
    if (!modifiedFiles[fileSha]) {

      // start loading
      startLoading();

      
      // get file from git
      const resp = await git.getFile(treeLoc, fileName);
      
      // if file dosen't exist
      if (resp.message && resp.message === 'Not Found') {

        // stop loading
        stopLoading();
        
        // close live view
        closeLiveView();
        
        showMessage('Hmm... that file dosen\'t exist.', 5000);
        
        return;
        
      }
      
      // if branch dosen't exist
      if (resp.message && resp.message.startsWith('No commit found for the ref')) {
        
        // stop loading
        stopLoading();
        
        // close live view
        closeLiveView();

        return;
        
      }

      
      // change selected file
      changeSelectedFile(treeLoc.join(), fileSha, fileName, resp.content, getFileLang(fileName),
                         [0, 0], [0, 0], false);

      // stop loading
      stopLoading();

    } else { // else, load file from modifiedFiles object
      
      const modFile = (selectedFile.sha === fileSha) ? selectedFile : modifiedFiles[fileSha];

      changeSelectedFile(modFile.dir, modFile.sha, modFile.name, modFile.content, modFile.lang,
                         modFile.caretPos, modFile.scrollPos, false);

    }
    
    
    // if URL has a live view flag
    if (linkData.openLive) {
      
      // if on mobile device
      if (isMobile) {

        // update bottom float
        updateFloat();
        
      }
      
      // open live view
      toggleLiveView(selectedFile);
      
    }

    
    // show file content in codeit
    try {
      
      const fileContent = decodeUnicode(selectedFile.content);
      
      // compare current code with new code
      if (hashCode(cd.textContent) !== hashCode(fileContent)) {

        // if the code is different, swap it
        cd.textContent = fileContent;
        
      }

      // change codeit lang
      cd.lang = selectedFile.lang;

    } catch(e) { // if file is binary

      cd.textContent = '';

      // load binary file
      loadBinaryFileHTML(selectedFile, true);

      return;

    }
    
    // change tab character
    if (cd.textContent.includes('\t')) {

      cd.options.tab = '\t';

    } else {

      cd.options.tab = '  ';

    }
    
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
        // share live view link

        // create a link
        const link = createLink({
          dir: treeLoc,
          file: selectedFile,
          openLive: true
        });

        copy(link).then(() => {
          showMessage('Copied link!');
        });

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
        if (swiped && !bottomWrapper.classList.contains('expanded')
            && !bottomFloat.classList.contains('file-open')) {

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
        if (swiped && bottomWrapper.classList.contains('expanded')
            && !bottomFloat.classList.contains('file-open')) {

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

  if (selectedFile.lang == 'html' || selectedFile.lang == 'markup') {

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
  
  liveToggle.querySelector('.download').addEventListener('click', downloadSelFile);

  liveToggle.querySelector('.share').addEventListener('click', () => {

    // if clicked on share button,
    // share live view link

    const link = createLink({
      dir: treeLoc,
      file: selectedFile,
      openLive: true
    });

    copy(link).then(() => {
      showMessage('Copied link!');
    });

  });


  document.addEventListener('keydown', handleMetaP);

  function handleMetaP(e) {

    // detect ctrl/cmd+R
    if ((e.key === 'r' || e.keyCode === 82) && isKeyEventMeta(e)) {

      e.preventDefault();

      liveView.classList.toggle('visible');
      toggleLiveView(selectedFile);

    }

  }

}


// download selected file
async function downloadSelFile() {
  
  // if selected file is already fetched
  if (selectedFile.content &&
      hashCode(selectedFile.content) !== hashCode(fileSizeText)) {

    // download selected file
    downloadFile(selectedFile.content, selectedFile.name);

  } else {

    // show download message
    showMessage('Downloading...');
    
    // fetch selected file
    const resp = await git.getBlob(treeLoc, selectedFile.sha);

    // download selected file
    downloadFile(resp.content, selectedFile.name);

  }
  
}

function downloadFile(file, name) {
  
  const a = document.createElement('a');
  
  a.href = 'data:application/octet-stream;base64,' + file;
  a.target = '_blank';
  a.download = name;
  
  a.click();
  a.remove();
  
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

    if (file.lang == 'html' || file.lang == 'markup') {

      renderLiveViewHTML(file);

    } /* else if (file.lang == 'python') {

      renderLiveViewPython(file);
      
    } */

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



const livePathLength = 15;
const livePath = window.location.origin + '/run/' + '_/'.repeat(livePathLength);

let openLiveViewFile;


// handle live view request
function handleLiveViewRequest(request) {
  
  // if requesting topmost path
  if (request === livePath) {
    
    // return open live view file
    return [openLiveViewFile, 'text/html';
    
  } else {
    
    return ['', 'text/plain'];
    
  }
  
}



// render live view for HTML files
async function renderLiveViewHTML(file) {
  
  if (!isDev) {
    
    // clear console
    console.clear();
    logVersion();
    
  }

  liveView.innerHTML = '<iframe src="'+ livePath +'" name="' + file.name + '" title="' + file.name + '" class="live-frame" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe>';
  
  openLiveViewFile = decodeUnicode(file.content);

}



// render live view for Python files
async function renderLiveViewPython(file) {

  if (!isDev) {
    
    // clear console
    console.clear();
    logVersion();
    
  }


  liveView.innerHTML = '<iframe name="Python Context" class="python-frame" style="display: none"></iframe>'
                       + '<div class="console"></div>';
  
  liveView.classList.add('loaded');
  
  const consoleEl = liveView.querySelector('.console');
  const pythonFrame = liveView.querySelector('.python-frame').contentWindow;
  
  
  await addScript(pythonFrame.document, false, 'live-view/extensions/pyodide.min.js');
  
  
  function logMessage(msg, options) {
    
    if (msg) {
      
      if (options && options.color) {
        
        if (options.color === 'gray') {
          
          consoleEl.innerHTML += '<div class="message" style="color:gray;font-style:italic">'+msg+'<br></div>';
        
        } else if (options.color === 'purplepink') {
          
          consoleEl.innerHTML += '<div class="message" style="color:hsl(302,100%,72.5%)">'+msg+'<br></div>';
          
        }
          
      } else {
        
        consoleEl.innerHTML += '<div class="message"><span style="color:#8be9fd">&gt;</span> '+msg+'<br></div>';
      
      }
       
    }
    
  }
  
  function clearOutput() {
    
    consoleEl.innerHTML = '';
    logMessage('Console was cleared', { color: 'gray' });
    
  }
  
  
  logMessage('Loading Python...', { color: 'gray' });
  
  // load pyodide in python frame
  pythonFrame.pyodide = await pythonFrame.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.19.0/full/'
  });
  
  logMessage('Loaded!', { color: 'gray' });
  
  
  // override logs in python context
  pythonFrame.console.stdlog = pythonFrame.console.log.bind(pythonFrame.console);
  pythonFrame.console.logs = [];
  pythonFrame.console.log = function() {
    pythonFrame.console.logs = [];
    pythonFrame.console.logs.push(Array.from(arguments));
    pythonFrame.console.logs.forEach(msg => addToOutput(msg));
    pythonFrame.console.stdlog.apply(pythonFrame.console, arguments);
  }
  
  
  // run file
  
  try {
    
    let output = pythonFrame.pyodide.runPython(decodeUnicode(file.content));
    
    //addToOutput(output);
    
  } catch (err) {
    
    logMessage(err, { color: 'purplepink' });
    
  }
  
}



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
