
let modifiedFiles, selectedFile;


function changeSelectedFile(fileDir, fileSha, fileName, fileExists) {
  
  selectedFile = { dir: fileDir,
                   sha: fileSha,
                   name: fileName,
                   exists: fileExists,
                 };
  
  setStorage('selectedFile', JSON.stringify(selectedFile));
  
}


function saveModifiedFile(fileDir, fileSha, fileName, fileExists) {
    
  modifiedFiles[fileSha] = { dir: fileDir,
                             sha: fileSha,
                             name: fileName,
                             exists: fileExists,
                             content: btoa(cd.textarea.value)
                           };
  
  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));
  
}


function loadCodeFromStorage() {
  
  // load modified files from storage
  modifiedFiles = getStorage('modifiedFiles') ? JSON.parse(getStorage('modifiedFiles')) : {};
  
  // load selected file from storage
  selectedFile = getStorage('selectedFile') ? JSON.parse(getStorage('selectedFile')) : {dir: '', sha: ''};
  
  // if code in storage
  if (getStorage('code')) {
    
    // set codeit to code
    cd.setValue(atob(getStorage('code')));
    
    // set caret pos in code
    cd.textarea.setSelectionRange(getStorage('caret'), getStorage('caret'));
    cd.textarea.focus();
        
  }
  
  // if sidebar is open
  if (getStorage('sidebar') == 'true') {
    
    // do a silent transition
    body.classList.add('transitioning');
    body.classList.add('expanded');

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 400);

  }
  
}

window.onbeforeunload = () => {
  
  // set localStorage values
  setStorage('code', btoa(cd.textarea.value));
  setStorage('caret', cd.textarea.selectionStart);
  setStorage('sidebar', body.classList.contains('expanded'));
  
};
