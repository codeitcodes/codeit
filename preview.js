document.addEventListener('keydown', (e) => {

  if (e.key === 'p' && isKeyEventMeta(e)) {

    e.preventDefault();
    
    if (selectedFile.lang == 'html') {
    
      previewWrapper.classList.toggle('visible');

      if (previewWrapper.classList.contains('visible')) {

        const frameDocument = preview.contentDocument;

        frameDocument.documentElement.innerHTML = cd.textContent;

        // fetch styles
        frameDocument.querySelectorAll('link[rel="stylesheet"]').forEach(async (link) => {

          const linkHref = new URL(link.href);
          const fileName = linkHref.pathname.slice(1);

          if (linkHref.origin == window.location.origin) {

            const file = Object.values(modifiedFiles).filter(file => (file.dir == treeLoc.join(',') && file.name == fileName));
            let resp;

            if (!file.content) {

              resp = await git.getFile(treeLoc, linkHref.pathname.slice(1));

            } else {

              resp = file;

            }

            link.outerHTML = '<style>' + decodeUnicode(resp.content) + '</style>';

            // remove original tag
            link.remove();

          }

        });

        // fetch scripts
        frameDocument.querySelectorAll('script').forEach(async (script) => {

          const linkHref = new URL(script.src);
          const fileName = linkHref.pathname.slice(1);

          if (linkHref.origin == window.location.origin) {

            const file = Object.values(modifiedFiles).filter(file => (file.dir == treeLoc.join(',') && file.name == fileName));
            let resp;

            if (!file.content) {

              resp = await git.getFile(treeLoc, linkHref.pathname.slice(1));

            } else {

              resp = file;

            }

            addScript(frameDocument, decodeUnicode(resp.content));

            // remove original tag
            script.remove();

          }

        })

      }

    }
    
  }

});


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
    documentNode.defaultView.console.error(e);
  }
  
  documentNode.head.appendChild(script);
}
