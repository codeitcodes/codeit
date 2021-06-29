let codedit = document.querySelector('cd');

function processFile(file) {
    
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    codedit.setValue(event.target.result);
  });
  reader.readAsText(file);
  
}

codedit.addEventListener('drop', (ev) => {
  
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  
  document.body.classList.remove('focus');

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        processFile(file);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      processFile(ev.dataTransfer.files[i]);
    }
  }
  
})

codedit.addEventListener('dragover', (ev) => {
  
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  
  document.body.classList.add('focus');
  
})

codedit.addEventListener('dragleave', (ev) => {
  
  document.body.classList.remove('focus');
  
})
