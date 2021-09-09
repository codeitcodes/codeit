
function getFileLang(src) {
  
  var EXTENSIONS = {
    'js': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'sh': 'bash',
    'bat': 'batch',
    'h': 'c',
    'tex': 'latex'
  };
  
  var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
  return EXTENSIONS[extension] || extension;
  
}

function processFile(file) {
    
  const reader = new FileReader();
  
  reader.addEventListener('load', (event) => {
    
    cd.textContent = event.target.result;
    cd.lang = getFileLang(file.name);
    cd.focus();
    
    cd.history = [];
    
    saveCodeLS();
    saveCodePosLS();
    saveCodeLangLS();
    
    console.log('Loaded local file. Name: ' + file.name + ' Size: ' + file.size + ' bytes');
    
  });
  
  reader.readAsText(file);
  
}

cd.addEventListener('drop', (ev) => {
  
  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();
  
  // if not logged into Github
  if (githubToken == null) {
  
    // remove drop indication
    document.body.classList.remove('focus');

    if (ev.dataTransfer.items) {
      
      // use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        
        // if dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          
          var file = ev.dataTransfer.items[i].getAsFile();
          processFile(file);
          
        }
        
      }
      
    } else {
      
      // use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        
        processFile(ev.dataTransfer.files[i]);
        
      }
      
    }
    
  }
  
})

cd.addEventListener('dragover', (ev) => {
  
  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();
  
  // if not logged into Github
  if (githubToken == null) {
    
    // show drop indication
    document.body.classList.add('focus');
    
  }
  
})

cd.addEventListener('dragleave', (ev) => {
  
  // if not logged into Github
  if (githubToken == null) {
    
    // remove drop indication
    document.body.classList.remove('focus');
    
  }
  
})

if ('launchQueue' in window) {
  launchQueue.setConsumer(async (launchParams) => {
    // nothing to do when the queue is empty.
    if (!launchParams.files.length) {
      return;
    }
    for (const fileHandle of launchParams.files) {
      
      // handle the file
      const fileData = await fileHandle.getFile();
      
      processFile(fileData);
      
    }
    
  });
}
