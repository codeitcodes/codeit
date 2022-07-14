
// setup live view
async function setupLiveView() {

  // if URL has a file
  if (linkData.file) {
    
    // get file from URL
    const fileName = linkData.file;
    
    // change selected file
    changeSelectedFile(treeLoc.join(), generateSHA(), fileName, '', getFileLang(fileName),
                       [0, 0], [0, 0], false);
    

    // if URL has a live view flag
    if (linkData.openLive) {

      // if on mobile device
      if (isMobile) {

        // show URL file name
        floatLogo.innerText = fileName;

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
    
  }
  

  // if URL has a directory
  if (linkData.dir) {
    
    // don't transition
    body.classList.add('notransition');
  
    // if on mobile device
    // and URL has a file
    if ((isMobile && linkData.file)
        || isEmbed) {
  
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
    
    
    // update repo obj selected branch
    
    let selBranch = linkData.dir[1].split(':')[1];
    
    // get repo obj from local storage
    const repoObj = modifiedRepos[linkData.dir[0] + '/' + linkData.dir[1].split(':')[0]];
    
    
    // if selected branch does not exist
    if (!selBranch) {
    
      // get default branch
    
      let defaultBranch;
    
      if (repoObj && repoObj.defaultBranch) {
    
        defaultBranch = repoObj.defaultBranch;
    
      } else {
    
        defaultBranch = (await git.getRepo(treeLoc)).default_branch;
    
      }
    
      // add branch to tree
      treeLoc[1] = linkData.dir[1].split(':')[0] + ':' + defaultBranch;
      saveTreeLocLS(treeLoc);
    
      // set selected branch to default branch
      selBranch = defaultBranch;
    
    }
    
    
    // if repo obj exists
    if (repoObj &&
        repoObj.selBranch !== selBranch) {
      
      // update selected branch in local storage
      updateModRepoSelectedBranch((treeLoc[0] + '/' + treeLoc[1].split(':')[0]), selBranch);
      
    }
    
  }
  
  // if URL has a file
  if (linkData.file) {

    // get file from URL
    const fileName = linkData.file;
    

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
    

    // search modified files for file
    const modFile = Object.values(modifiedFiles).filter(file =>
                      (file.dir == treeLoc
                       && file.name == fileName))[0];

    // if file is not modified; fetch from Git
    if (!modFile) {

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
      changeSelectedFile(treeLoc.join(), resp.sha, fileName, resp.content, getFileLang(fileName),
                         [0, 0], [0, 0], false);

      // stop loading
      stopLoading();

    } else { // else, load file from modifiedFiles object

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
      
      let fileContent;
      
      // get repo obj from local storage
      const repoObj = modifiedRepos[treeLoc[0] + '/' + treeLoc[1].split(':')[0]];
      
      
      // if not logged in
      // or repository is public
      // and fetching an HTML file
      if ((gitToken === ''
          || (repoObj && !repoObj.private))
          && getFileType(fileName) === 'html') {
        
        // get public file from git
        fileContent = await git.getPublicFile(treeLoc, fileName);
        
      } else {
      
        fileContent = decodeUnicode(selectedFile.content);
        
      }

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

      } else if (active) {

        // if clicked on share button,
        // share live view link

        // create a link
        const link = createLink({
          dir: treeLoc,
          file: selectedFile,
          openLive: true
        });
        
        navigator.share({
          title: 'Run ' + treeLoc[0] + '/' + treeLoc[1].split(':')[0] + ' with Codeit',
          url: link,
        });

      }

    }

    yOffset = 0;
    active = false;
    swiped = false;

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
      if (Math.abs(yOffset) > yBoundary
          || swiped) {
        swiped = true;
      } else {
        swiped = false;
      }

      if (direction == 'up') {

        // if swiped up and bottom float isn't expanded
        if (swiped && !bottomWrapper.classList.contains('expanded')
            && !bottomFloat.classList.contains('file-open')) {

          // expand bottom float
          bottomWrapper.classList.add('expanded');

          // fix bottom float on safari
          // when finished transitioning
          if (isSafari) {

            window.setTimeout(() => {

              bottomWrapper.classList.add('fromtop');

            }, 400);

          }

          // if live view is closed
          if (!liveViewToggle) toggleLiveView(selectedFile);

        }

      } else if (direction == 'down') {

        // if swiped down and bottom float is expanded
        if (swiped && bottomWrapper.classList.contains('expanded')
            && !bottomFloat.classList.contains('file-open')) {

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

          // if live view is open
          if (liveViewToggle) toggleLiveView(selectedFile);
          
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
      dir: selectedFile.dir.split(','),
      file: selectedFile,
      openLive: true
    });

    copy(link).then(() => {
      showMessage('Copied link!');
    });

  });
  
  liveToggle.querySelector('.popout').addEventListener('click', () => {
    
    // pop out live view to new window
    
    
    // get live view URL
    const liveViewURL = livePath +'?'+ workerClientId +'/';
    
    // open a new window with live view URL
    window.open(liveViewURL, '_blank');
    
    
    // close inline live view
    
    liveViewToggle = !liveViewToggle;

    // clear live view
    liveView.innerHTML = '';
    
    // show loader
    liveView.classList.remove('loaded');
    
    
    // don't transition live view
    liveView.classList.add('notransition');

    // hide live view
    liveView.classList.remove('visible');

    // restore transition on next frame
    onNextFrame(() => {
      liveView.classList.remove('notransition');
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
    showMessage('Downloading...', -1);

    // fetch selected file
    const resp = await git.getBlob(treeLoc, selectedFile.sha);
    
    // hide message
    hideMessage();

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

    } */ else {
      
      // hide loader
      liveView.classList.add('loaded');
      
    }

  } else {

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



const livePathLength = 15; // +1
const livePath = window.location.origin + '/run/' + '_/'.repeat(livePathLength);

let liveFile;


// handle live view request
async function handleLiveViewRequest(requestPath) {
  
  // if requesting base path
  if (requestPath.split('?')[0] === livePath) {

    // return live file
    return {
      fileContent: decodeUnicode(liveFile.content),
      respStatus: 200
    };

  } else {

    // map file dir
    let [fileUser, fileRepo, fileContents] = liveFile.dir.split(',');
    
    // get file name
    const fileName = requestPath.split('/').slice(-1)[0];



    // if requesting path above
    if (!requestPath.includes(livePath)) {

      // slice origin from request
      // to get directory path
      let dirPath = requestPath.slice(window.location.origin.length);
      dirPath = dirPath.replace('/run', '/_');

      dirPath = dirPath.split('/_');


      // if didn't request uppermost directory
      if (dirPath.length !== 1) {

        // don't count file name in directory array
        const traveseDir = (livePathLength + 1) - (dirPath.length - 1);

        // split file contents
        fileContents = fileContents.split('/');

        // traverse dir backwards
        for (let i = 0; i < traveseDir; i++) fileContents.pop();

        // join file contents
        fileContents = fileContents.join('/');

      } else { // if requested uppermost directory

        // clear file contents
        fileContents = '';

      }


      // get path down
      let pathDown = dirPath[dirPath.length-1];

      // slice file name from relative path
      pathDown = pathDown.slice(0, (-fileName.length - 1));

      // add path down to file directory
      fileContents += pathDown;

    } else {

      // if requesting path below

      // slice live path from request
      // to get relative path
      let relPath = requestPath.slice(livePath.length);

      // slice file name from relative path
      relPath = relPath.slice(0, (-fileName.length - 1));

      // if relative path exists
      if (relPath) {

        // add relative path to live file path
        fileContents += '/' + relPath;

      }

    }
    
    
    
    // map file dir
    const liveFileDir = [fileUser, fileRepo, fileContents];
    
    let respContent;
    let respObj;
    
    
    
    // search modified files for file
    let modFile = Object.values(modifiedFiles).filter(file =>
                    (file.dir == liveFileDir.join(',')
                     && file.name == fileName))[0];
    
    // if matching modified file exists
    if (modFile) {
      
      // return modified file content
      respContent = modFile.content;
      
      // decode base64 file with browser
      const dataURL = 'data:application/octet-stream;base64,' + respContent;

      // send (instant) request
      const response = await fetch(dataURL);

      // get data from response
      respObj = (await (response.body.getReader()).read()).value;
      
    } else {

      // get repo obj from local storage
      const repoObj = modifiedRepos[fileUser + '/' + fileRepo.split(':')[0]];


      // if not logged in
      // or repository is public
      if (gitToken === ''
          || (repoObj && !repoObj.private)) {
        
        // get public file from git as ReadableStream
        respObj = await git.getPublicFileAsStream(liveFileDir, fileName);
        
        // if couldn't fetch file
        if (respObj.errorCode) {
          
          // return an error
          
          const respStatus = respObj.errorCode;
          
          return {
            fileContent: '',
            respStatus: respStatus
          };
          
        }
        
      } else {

        // get file from git
        let resp = await git.getFile(liveFileDir,
                                     fileName);
   
    
        // if file is over 1MB
        if (resp.errors && resp.errors.length > 0 && resp.errors[0].code === 'too_large') {
    
          console.log('[Live view] File', fileName, 'over 1MB, fetching from blob API');
    
          // fetch file directory
          const dirResp = await git.getItems(liveFileDir);
    
          // find file in directory
          const fileObj = dirResp.filter(file => file.name === fileName)[0];
    
          // if file exists
          if (fileObj) {
    
            // fetch file from blob API (up to 100MB)
            resp = await git.getBlob(liveFileDir,
                                     fileObj.sha);
    
          }
    
        }
    
    
        // if couldn't fetch file
        if (resp.message) {
    
          // return an error
          
          let respStatus = 400;
          if (resp.message === 'Not Found') respStatus = 404;
          
          return {
            fileContent: '',
            respStatus: respStatus
          };
    
        }
        
        
        // return contents from git response
        respContent = resp.content;
        
        // decode base64 file with browser
        const dataURL = 'data:application/octet-stream;base64,' + respContent;
    
        // send (instant) request
        const response = await fetch(dataURL);
    
        // get data from response
        respObj = (await (response.body.getReader()).read()).value;
        
      }
      
    }
    
    
    // return response data
    return {
      fileContent: respObj,
      respStatus: 200
    };

  }

}



// render live view for HTML files
async function renderLiveViewHTML(file) {

  if (!isDev) {

    // clear console
    console.clear();
    logVersion();

  }
  
  
  // if iOS version is lower than minimum
  
  const isSafariWithMac = (navigator.userAgent.toLowerCase().includes('safari')
                           && !navigator.userAgent.toLowerCase().includes('chrome'));
  
  if (isSafariWithMac) {
    
    const safariVersion = Number(navigator.userAgent.split('Version/')[1].split(' Safari')[0]);
    
    if (safariVersion < 15.4) {
    
      // show message and return
      
      liveView.innerHTML = `
      <div class="prompt">
        <svg style="margin-bottom: 7px;margin-top: -42px;" class="file-svg" viewBox="0 0 752 752" version="1.1" height="146" width="146" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="a"><path d="m139.21 139.21h473.58v473.58h-473.58z"></path></clipPath></defs><g clip-path="url(#a)"><path d="m356.27 572.35v-38.492c0-10.898 8.7578-19.73 19.73-19.73 10.898 0 19.734 8.7578 19.734 19.73v38.492c93.223-9.2539 167.36-83.395 176.62-176.62h-38.492c-10.898 0-19.73-8.7578-19.73-19.734 0-10.898 8.7578-19.73 19.73-19.73h38.492c-9.2539-93.227-83.395-167.36-176.62-176.62v38.496c0 10.895-8.7578 19.73-19.734 19.73-10.898 0-19.73-8.7578-19.73-19.73v-38.496c-93.227 9.2578-167.36 83.395-176.62 176.62h38.496c10.895 0 19.73 8.7578 19.73 19.73 0 10.898-8.7578 19.734-19.73 19.734h-38.496c9.2578 93.223 83.395 167.36 176.62 176.62zm19.73 40.441c-130.77 0-236.79-106.02-236.79-236.79 0-130.77 106.02-236.79 236.79-236.79 130.78 0 236.79 106.02 236.79 236.79 0 130.78-106.02 236.79-236.79 236.79zm88.371-333.09c10.426-3.1719 16.32 2.6562 13.133 13.133l-37.344 122.7c-3.1758 10.426-14.148 21.434-24.625 24.625l-122.7 37.344c-10.426 3.1719-16.32-2.6562-13.133-13.133l37.344-122.7c3.1719-10.426 14.148-21.438 24.625-24.625zm-111.21 75.098c0.69141-0.20703 1.0391-0.23047 1.2148-0.23828 0.19531-0.36328 0.21875-0.71094 0.42578-1.4023l-21.543 70.793 70.789-21.547c-0.69141 0.21094-1.0391 0.23438-1.2148 0.23828-0.19141 0.36328-0.21484 0.71094-0.42578 1.4023l21.547-70.789z" fill="hsl(223deg 75% 38%)"></path></g></svg>
        <div class="title">Upgrade iOS to run this file</div>
        <a class="desc link" href="https://support.apple.com/en-us/HT204416" target="_blank">Here's how</a>
      </div>
      `;
      
      liveView.classList.add('centered-contents');
      liveView.classList.add('loaded');
      
      return;
      
    }
    
  }


  // if service worker isn't installed yet
  if (workerInstallPromise) {
        
    // wait until finished installing
    await workerInstallPromise;
            
  }
  
  if (!workerClientId) await workerInstallPromise;


  liveView.innerHTML = '<iframe src="'+ livePath +'?'+ workerClientId +'/" name="Live view" title="Live view" class="live-frame" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe>';


  liveFile = file;
  

  const liveFrame = liveView.querySelector('.live-frame');

  liveFrame.contentWindow.addEventListener('DOMContentLoaded', () => {

    liveFrame.contentWindow.history.replaceState({}, 'Live view', livePath);
    
  });

  liveFrame.contentWindow.addEventListener('load', () => {
    
    liveView.classList.add('loaded');
    
  });

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
