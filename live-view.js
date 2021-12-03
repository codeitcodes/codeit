
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

        // retract bottom float
        bottomWrapper.classList.remove('expanded');

        toggleLiveView(selectedFile);

      } else {

        // if clicked on share button,
        // share live view URL

        const shareData = {
          title: 'Share live view',
          content: window.location.origin
        }

        try {
          navigator.share(shareData);
        } catch(e) {
          console.info('[Share API] Couldn\'t share.');
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

          // expand bottom float
          bottomWrapper.classList.add('expanded');

          toggleLiveView(selectedFile);

        }

      } else if (direction == 'down') {

        // if swiped down and bottom float is expanded
        if (swiped && bottomWrapper.classList.contains('expanded')) {

          // retract bottom float
          bottomWrapper.classList.remove('expanded');

          toggleLiveView(selectedFile);

        } else if (swiped && liveView.innerHTML === '') {

          // if swiped down and bottom float isn't expanded
          // hide bottom float
          bottomWrapper.classList.add('hidden');

        }

      }

      click = false;

    }

  }

}

if (isMobile) {

  addBottomSwipeListener();

}



document.addEventListener('keydown', handleMetaP);

function handleMetaP(e) {

  // detect ctrl/cmd+P
  if ((e.key === 'p' || e.keyCode === 80) && isKeyEventMeta(e)) {

    e.preventDefault();

    liveView.classList.toggle('visible');
    toggleLiveView(selectedFile);

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

    if (file.lang == 'html') {

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

  liveView.innerHTML = '<iframe class="live-frame" allow="camera; gyroscope; microphone; autoplay; clipboard-write; encrypted-media; picture-in-picture; accelerometer" frameborder="0"></iframe>';

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

          resp = await git.getSmallFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));

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
  frameDocument.querySelectorAll('script').forEach(async (script) => {

    // if script is external
    if (script.src) {

      const linkHref = new URL(script.src);
      const fileName = linkHref.pathname.slice(1);

      if (linkHref.origin == window.location.origin) {

        const file = Object.values(modifiedFiles).filter(file => (file.dir == selectedFile.dir.split(',') && file.name == fileName));
        let resp;

        if (!file[0]) {

          resp = await git.getSmallFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));

        } else {

          resp = file[0];

        }

        addScript(frameDocument, decodeUnicode(resp.content), '', script.type);

        // remove original tag
        script.remove();

      } else {

        addScript(frameDocument, '', script.src, script.type);

        // delete original
        script.remove();

      }

    } else {

      let scriptContent = script.textContent;

      // if the script is a module
      if (script.type === 'module') {

        // get all imports in module
        scriptContent = await getImports(script.textContent);

      }

      addScript(frameDocument, scriptContent, '', script.type);

      // delete original
      script.remove();

    }

  })

}


function addScript(documentNode, code, src, type) {

  const script = documentNode.createElement('script');

  if (type && type != '') script.type = type;

  if (code) {

    script.appendChild(documentNode.createTextNode(code));

  } else {

    script.src = src;
    script.defer = true;
    script.async = false;

  }

  documentNode.head.appendChild(script);

}


// function fetches the relevant file content from relative path:
async function getScriptFile(scriptPath) {

  // map tree location
  const [user, repo, contents] = treeLoc;

  let dirPath = contents;
  let fullScriptPath = scriptPath;

  // if script path is relative
  if (scriptPath[0] == '.') {

    // if script is in up folder
    if (scriptPath[0] == '.' && scriptPath[1] == '.') {

      // go up one directory
      dirPath = dirPath.split('/')[0];

      // remove "/.." from script path
      fullScriptPath = fullScriptPath.slice(3);

    } else {

      // remove "/." from script path
      fullScriptPath = fullScriptPath.slice(2);

    }

  }


  let fileSha;

  //   `../../../build/three.module.js`

  // if file is above current directory
  if (contents !== dirPath) {

    if(fullScriptPath.includes('../../')){ //TBD@@
      fullScriptPath = fullScriptPath.split('../../')[1];
    }

    dirPath = fullScriptPath.split('/');
    dirPath.pop();
    dirPath = '/' + dirPath.join('/');

    const upResp = await git.getItems([user, repo, dirPath]);

    const fileObj = upResp.filter(file => file.path == fullScriptPath);

    fileSha = fileObj[0].sha;

  } else if (fullScriptPath.includes('/')) { // file is below

    dirPath = fullScriptPath.split('/');
    dirPath.pop();
    dirPath = contents + '/' + dirPath.join('/');

    const downResp = await git.getItems([user, repo, dirPath]);

    const fileObj = downResp.filter(file => file.path == (contents.slice(1) + '/' + fullScriptPath));

    fileSha = fileObj[0].sha;

  } else { // file is in current directory

    const fileEl = fileWrapper.querySelectorAll('.item.file').filter(file => file.innerText == fullScriptPath);

    fileSha = getAttr(fileEl[0], 'sha');

  }


  const resp = await git.getFile([user, repo], fileSha);

  return resp.content;

}


// find all import statements in script
async function getImports(script) {

  let scriptContent = script;

  const lines = script.split('\n');
  const importReg = /[ /t/n]*import /i;
  const importReg2 = /[ /t/n]*from[ /t]*'/i;

  for (let i = 0; i < lines.length; i++) {

    const words = lines[i].trim().split(' ');

    if (importReg.exec(lines[i]) || importReg2.exec(lines[i]) ) {


      let importedScriptPath = words[words.length-1].slice(1, -2); // remove first char and two last chars

      console.log('path', importedScriptPath);
      if(importReg2.exec(lines[i])){
        console.log('Special case!',lines[i]);
      }


      // if imported script is a javascript file
      if (importedScriptPath.endsWith('.js') ) {

        // fetch script
        let importedScript = await getScriptFile(importedScriptPath);

        // get all imports in script
        importedScript = await getImports(decodeUnicode(importedScript));

        // replace import statment with encoded script
        scriptContent = scriptContent.replace(importedScriptPath,
                                                'data:text/javascript;base64,' +
                                                encodeURIComponent(encodeUnicode(importedScript)));

      } else {

        console.log('err',words,lines[i+1],lines[i+2]);

      }

    }

  }

  return scriptContent;

}
