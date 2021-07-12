
let modifiedFiles;

function saveFile(file) {
  
  const sha = getAttr(file, 'sha');
  
  modifiedFiles[sha] = [btoa(cd.textarea.value)];
  
  setStorage('files', JSON.stringify(modifiedFiles));
  
}


function loadCodeFromStorage() {
  
  // load modified files from storage
  modifiedFiles = getStorage('files') ? JSON.parse(getStorage('files')) : [];
  
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
