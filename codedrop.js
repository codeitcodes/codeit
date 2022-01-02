
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
  
  src = src.replaceAll('\n', '');

  const extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
  return EXTENSIONS[extension] || extension;

}


function processFile(file) {

  const reader = new FileReader();

  reader.addEventListener('load', (event) => {

    cd.textContent = event.target.result;
    cd.lang = getFileLang(file.name);
    cd.focus();

    cd.history = [];

    saveSelectedFileContent();
    saveSelectedFileCaretPos();
    saveSelectedFileScrollPos();
    saveSelectedFileLang();

    console.log('Loaded local file. Name: ' + file.name + ' Size: ' + file.size + ' bytes');

  });

  reader.readAsText(file);

}

cd.on('drop', (ev) => {

  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();

  // if not logged into git
  if (gitToken == '') {

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

cd.on('dragover', (ev) => {

  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();

  // if not logged into git
  if (gitToken == '') {

    // show drop indication
    document.body.classList.add('focus');

  }

})

cd.on('dragleave', (ev) => {

  // if not logged into git
  if (gitToken == '') {

    // remove drop indication
    document.body.classList.remove('focus');

  }

})

if ('launchQueue' in window) {

  launchQueue.setConsumer(async (launchParams) => {

    // if not logged into git
    if (gitToken == '') {

      // nothing to do when the queue is empty
      if (!launchParams.files.length) {
        return;
      }

      for (const fileHandle of launchParams.files) {

        // handle the file
        const fileData = await fileHandle.getFile();

        processFile(fileData);

      }

    }

  });
  
}
