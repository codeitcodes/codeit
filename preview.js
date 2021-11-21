
document.addEventListener('keydown', handlePreviewKeydown);


function handlePreviewKeydown(e) {
  
  if (e.key === 'p' && isKeyEventMeta(e)) {

    e.preventDefault();
    
    if (selectedFile.lang == 'html') {
    
      previewWrapper.classList.toggle('visible');

      if (previewWrapper.classList.contains('visible')) {
        
        previewWrapper.querySelector('.preview').outerHTML = '<iframe class="preview" allow="camera; gyroscope; microphone; autoplay; clipboard-write; encrypted-media; picture-in-picture; accelerometer" frameborder="0"></iframe>';
        
        const preview = previewWrapper.querySelector('.preview');        
        const frameDocument = preview.contentDocument;

        frameDocument.addEventListener('keydown', handlePreviewKeydown);
        frameDocument.documentElement.innerHTML = cd.textContent;

        // fetch styles
        frameDocument.querySelectorAll('link[rel="stylesheet"]').forEach(async (link) => {

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

            // remove original tag
            link.remove();

          }

        });

        // fetch scripts
        frameDocument.querySelectorAll('script[src]').forEach(async (script) => {
          
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

          }else{
            console.log('Script is not window origin:',fileName,script);
            addScript(frameDocument, '',script.src, script.type);     
            // delete original
            script.remove();
            
          }

        })

      }

    }
    
  }
  
}


function addScript(documentNode, code, src, type) {
  var script = documentNode.createElement('script');
  script.type = script.type ?? 'application/javascript';
  
  if (code) {
    script.appendChild(documentNode.createTextNode(code));
  } else {
    script.src = src;
    script.defer = true;
    script.async = false;
  }
  
  script.onerror = (e) => {
    console.log('Error loading script:',e);
    //@@
    documentNode.defaultView.console.error(e);
  }
  
  documentNode.head.appendChild(script);
}
