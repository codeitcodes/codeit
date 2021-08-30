
let modifiedFiles, selectedFile;


function changeSelectedFileLS(newSelectedFile) {
  
  selectedFile = newSelectedFile;
  
  setStorage('selectedFile', JSON.stringify(newSelectedFile));
  
}


function saveModifiedFileLS(modifiedFile) {
  
  modifiedFiles[modifiedFile.sha] = modifiedFile;
  
  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));
  
}


function deleteModifiedFileLS(fileSha) {
    
  delete modifiedFiles[fileSha];
  
  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));
  
}


function saveTreeLocLS(treeLoc) {
  
  setStorage('tree', treeLoc.join());
  
}


function loadLS() {
  
  // load modified files from storage
  modifiedFiles = getStorage('modifiedFiles') ? JSON.parse(getStorage('modifiedFiles')) : {};
  
  // load selected file from storage
  selectedFile = getStorage('selectedFile') ? JSON.parse(getStorage('selectedFile')) : {dir: '', sha: ''};
  
  setupCodeitApp();
  
  body.classList.add('loaded');
  
}

function saveBeforeUnloadLS() {
  
  // set localStorage values
  saveCodeLS();
  saveCodePosLS();
  
}

window.onbeforeunload = saveBeforeUnloadLS;

function saveCodeLS() {
  
  setStorage('code', encodeUnicode(cd.textContent));
  
}

function saveCodePosLS() {
  
  setStorage('caret', cd.getSelection().start);
  setStorage('scrollPos', (cd.scrollLeft + ',' + cd.scrollTop));
  
}

function saveCodeLangLS() {
  
  setStorage('lang', cd.lang);
  
}

function saveSidebarStateLS() {
  
  setStorage('sidebar', body.classList.contains('expanded'));
  
}

function saveAuthTokenLS(authToken) {
  
  setStorage('token', authToken);
  
}
