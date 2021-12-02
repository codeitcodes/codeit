
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

  function dragEnd() {
    
    initialY = currentY;
    
    // if clicked and bottom float is expanded
    if (click && bottomWrapper.classList.contains('expanded')) {
            
      // retract bottom float
      bottomWrapper.classList.remove('expanded');
      
      toggleLiveView(selectedFile);
      
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
          
        } else if (swiped && !bottomWrapper.classList.contains('expanded')) {
          
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

          resp = await git.getFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));

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

          resp = await git.getFile(selectedFile.dir.split(','), linkHref.pathname.slice(1));

        } else {

          resp = file[0];

        }

        addScript(frameDocument, decodeUnicode(resp.content));

        // remove original tag
        script.remove();

      } else {

        addScript(frameDocument, '', script.src, script.type);

        // delete original
        script.remove();

      }

    } else {

      addScript(frameDocument, script.textContent, '', script.type);

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
