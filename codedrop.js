let codedit = document.querySelector('cd');

codedit.addEventListener('drop', (ev) => {
  
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('... file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }
  
})

codedit.addEventListener('dragover', (ev) => {
  
  document.body.classList.add('focus');
  
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  
})

codedit.addEventListener('dragend', () => {
  
  document.body.classList.remove('focus');
  
})
