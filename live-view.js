
document.addEventListener('keydown', handleMetaP);

function handleMetaP(e) {
  
  // detect ctrl/cmd+P
  if ((e.key === 'p' || e.keyCode === 80) && isKeyEventMeta(e)) {

    e.preventDefault();
    
    toggleLiveView(selectedFile);
    
  }
  
}


let liveViewTimeout;

// toggle live view for file
function toggleLiveView(file) {
  
  liveView.classList.toggle('visible');
  
  window.clearTimeout(liveViewTimeout);
  
  // if live view is visible
  if (liveView.classList.contains('visible')) {
    
    if (file.lang == 'html') {
    
      renderLiveViewHTML(file);
    
    }
    
  } else {
    
    liveViewTimeout = window.setTimeout(() => {
      
      // clear live view
      liveView.innerHTML = '';
      
      // show loader
      liveView.classList.remove('loaded');
      
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
