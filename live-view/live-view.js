
// setup live view
async function setupLiveView() {

  // if URL has a file
  if (linkData.file) {

    if (isMobile) {

      toggleSidebar(false);
      saveSidebarStateLS();

    } else {

      toggleSidebar(true);
      saveSidebarStateLS();

    }

    const fileName = linkData.file.name;
    const fileSha = linkData.file.sha;

    // change selected file
    changeSelectedFile(treeLoc.join(), fileSha, fileName, '\n\r', getFileLang(fileName),
                       [0, 0], [0, 0], false);
    
    
    // if URL has a live view flag
    if (linkData.openLive) {

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
    
    
    // if URL has a live view flag
    if (linkData.openLive) {
      
      // open live view
      toggleLiveView(selectedFile);
      
    }

    
    // show file content in codeit
    try {

      const fileContent = decodeUnicode(selectedFile.content);
    
      // compare current code with new code
      if (hashCode(cd.textContent) !== hashCode(fileContent)) {
        
        // if code is different, swap it
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
        // share live view link

        // create a link
        const link = createLink({
          dir: treeLoc,
          file: selectedFile,
          openLive: true
        });

        if (isMobile) {

          try {

            navigator.share({
              title: 'Share live view',
              text: link
            });

          } catch(e) {

            copy(link).then(() => {
              alert('Copied link to clipboard.');
            });

          }

        } else {

          copy(link).then(() => {
            alert('Copied link to clipboard.');
          });

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

  if (selectedFile.lang == 'html' || selectedFile.lang == 'markup'
      || selectedFile.lang == 'python') {

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
      alert('Copied link to clipboard.');
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

      window.setTimeout(() => {

        if (liveViewToggle && !liveView.classList.contains('loaded')) {

          liveView.classList.add('loading');

        }

      }, 1200);

      renderLiveViewHTML(file);

    } else if (file.lang == 'python') {
      
      window.setTimeout(() => {

        if (liveViewToggle && !liveView.classList.contains('loaded')) {

          liveView.classList.add('loading');

        }

      }, 1200);

      renderLiveViewPython(file);
      
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


const liveFetchURL = window.location.origin + '/live-fetch/';

// render live view for HTML files
async function renderLiveViewHTML(file) {

  // clear console
  console.clear();
  logVersion();


  liveView.innerHTML = '<iframe name="' + file.name + '" title="' + file.name + '" class="live-frame" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe>';

  const frame = liveView.querySelector('.live-frame');
  const frameDocument = frame.contentDocument;

  frameDocument.addEventListener('keydown', handleMetaP);
  
  
  frameDocument.documentElement.innerHTML = decodeUnicode(file.content);

  
  // add <base> element
  
  const baseEl = frameDocument.createElement('base');
  baseEl.href = liveFetchURL;
  
  if (frameDocument.head.children.length > 0) {
    
    frameDocument.head.insertBefore(baseEl, frameDocument.head.children[0]);
    
  } else {
    
    frameDocument.head.appendChild(baseEl);
    
  }
  
  
  // fetch styles
  const frameLinks = frameDocument.querySelectorAll('link[rel="stylesheet"]');

  if (frameLinks.length > 0) {

    frameLinks.forEach(async (link) => {

      const linkHref = new URL(link.href);
      const fileName = linkHref.pathname.replace('/live-fetch/','');

      if (linkHref.href.startsWith(liveFetchURL)) {

        const file = Object.values(modifiedFiles).filter(file => (file.dir == selectedFile.dir.split(',') && file.name == fileName));
        let resp;

        if (!file[0]) {

          try {
            resp = await git.getFile(selectedFile.dir.split(','), fileName);
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

  
  // if not navigating in current tree,
  // fetch current tree
  
  let fileTree = {};
  
  if (file.dir !== treeLoc.join(',')) {
    
    fileTree = await git.getItems(file.dir.split(','));
    
  } else {
    
    const files = fileWrapper.querySelectorAll('.item.file');
    
    // parse file elements and save relevant fields
    files.forEach(fileEl => {
      
      const fileName = fileEl.querySelector('.name').textContent.replaceAll('\n','');
      
      fileTree[fileName] = { sha: getAttr(fileEl, 'sha') };
      
    });
    
  }
  
  
  // fetch images
  frameDocument.querySelectorAll('img').forEach(async (image) => {

    const linkHref = new URL(image.src);
    const fileDir = linkHref.pathname.replace('/live-fetch/','');
    const splitDir = fileDir.split('/');
    
    if (linkHref.href.startsWith(liveFetchURL)) {
      
      // if image is in current directory
      if (splitDir.length < 3 && (splitDir.length == 2 ? splitDir[0] == '' : true)) {

        const fileName = splitDir[splitDir.length-1];
        
        // find file by name
        const fileObj = fileTree[fileName];

        // if file exists
        if (fileObj) {

          // fetch image

          // get MIME type (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
          let mimeType = 'image/' + fileName.split('.')[1];

          if (mimeType.endsWith('svg')) mimeType = 'image/svg+xml';

          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), fileObj.sha);

          image.src = 'data:' + mimeType + ';base64,' + resp.content;

        }

      } else if (!fileDir.includes('./')) { // if image is below current directory

        // fetch image

        // get MIME type
        let mimeType = 'image/' + fileName.split('.')[1];

        if (mimeType.endsWith('svg')) mimeType = 'image/svg+xml';

        const fileTree = linkHref.pathname.replaceAll(fileName, '');

        let tree = selectedFile.dir.split(',');
        tree[2] = tree[2] + fileDir.slice(1, -1);

        const resp = await git.getFile(tree, fileName);

        image.src = 'data:' + mimeType + ';base64,' + resp.content;

      }

    }

  })

  // fetch videos
  frameDocument.querySelectorAll('video').forEach(async (video) => {

    const linkHref = new URL(video.src);
    const fileDir = linkHref.pathname.replace('/live-fetch/','');
    const splitDir = fileDir.split('/');
    
    if (linkHref.href.startsWith(liveFetchURL)) {
      
      // if video is in current directory
      if (splitDir.length < 3 && (splitDir.length == 2 ? splitDir[0] == '' : true)) {

        const fileName = splitDir[splitDir.length-1];
        
        // find file by name
        const fileObj = fileTree[fileName];

        // if file exists
        if (fileObj) {

          // fetch video

          // get MIME type
          let mimeType = 'video/' + fileName.split('.')[1];
          
          if (mimeType.endsWith('avi')) mimeType = 'video/x-msvideo';
          if (mimeType.endsWith('ogv')) mimeType = 'video/ogg';
          if (mimeType.endsWith('ts')) mimeType = 'video/mp2t';
          
          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), fileObj.sha);

          video.src = 'data:' + mimeType + ';base64,' + resp.content;

        }

      } else if (!fileDir.includes('./')) { // if image is below current directory

        // fetch video

        // get MIME type
        let mimeType = 'video/' + fileName.split('.')[1];

        if (mimeType.endsWith('avi')) mimeType = 'video/x-msvideo';
        if (mimeType.endsWith('ogv')) mimeType = 'video/ogg';
        if (mimeType.endsWith('ts')) mimeType = 'video/mp2t';
        
        const fileTree = linkHref.pathname.replaceAll(fileName, '');

        let tree = selectedFile.dir.split(',');
        tree[2] = tree[2] + fileDir.slice(1, -1);

        const resp = await git.getFile(tree, fileName);

        video.src = 'data:' + mimeType + ';base64,' + resp.content;

      }

    }

  })

  // fetch audio
  frameDocument.querySelectorAll('audio').forEach(async (audio) => {

    const linkHref = new URL(audio.src);
    const fileDir = linkHref.pathname.replace('/live-fetch/','');
    const splitDir = fileDir.split('/');
    
    if (linkHref.href.startsWith(liveFetchURL)) {
      
      // if audio is in current directory
      if (splitDir.length < 3 && (splitDir.length == 2 ? splitDir[0] == '' : true)) {

        const fileName = splitDir[splitDir.length-1];
        
        // find file by name
        const fileObj = fileTree[fileName];

        // if file exists
        if (fileObj) {

          // fetch audio

          // get file as blob with SHA (up to 100MB)
          const resp = await git.getBlob(selectedFile.dir.split(','), fileObj.sha);

          audio.src = 'data:audio/mpeg;base64,' + resp.content;

        }

      } else if (!fileDir.includes('./')) { // if audio is below current directory

        // fetch audio

        const fileTree = linkHref.pathname.replaceAll(fileName, '');

        let tree = selectedFile.dir.split(',');
        tree[2] = tree[2] + fileDir.slice(1, -1);

        const resp = await git.getFile(tree, fileName);

        audio.src = 'data:audio/mpeg;base64,' + resp.content;

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
      const fileName = linkHref.pathname.replace('/live-fetch/','');

      if (linkHref.href.startsWith(liveFetchURL)) {

        const file = Object.values(modifiedFiles).filter(file => (file.dir == selectedFile.dir.split(',') && file.name == fileName));
        let resp;

        if (!file[0]) {

          resp = await git.getFile(selectedFile.dir.split(','), fileName);

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

      let scriptContent = script.textContent;
      
      // if script is a module
      if (script.type === 'module') {
        
        const filePath = selectedFile.dir.split(',')[2];
        
        // get all imports in module
        scriptContent = await moduleImporter.getImports(scriptContent, filePath);

      }
      
      addScript(frameDocument, scriptContent, false, script.type);

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



// render live view for Python files
async function renderLiveViewPython(file) {

  // clear console
  console.clear();
  logVersion();


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

