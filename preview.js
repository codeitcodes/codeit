document.addEventListener('keydown', (e) => {

  if (e.key === 'p' && isKeyEventMeta(e)) {

    e.preventDefault();
    
    previewWrapper.classList.toggle('visible');

  }

});
