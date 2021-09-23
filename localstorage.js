
let modifiedFiles, selectedFile;

// load local storage
function loadLS() {

  // load modified files from storage
  modifiedFiles = getStorage('modifiedFiles') ? JSON.parse(getStorage('modifiedFiles')) : {};

  // load selected file from storage
  selectedFile = getStorage('selectedFile') ? JSON.parse(getStorage('selectedFile')) : {};

  setupCodeitApp();

}


// modified files

function saveModifiedFileLS(modifiedFile) {

  modifiedFiles[modifiedFile.sha] = modifiedFile;

  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));

}

function deleteModifiedFileLS(fileSha) {

  delete modifiedFiles[fileSha];

  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));

}


// selected file

function changeSelectedFileLS(newSelectedFile) {

  selectedFile = newSelectedFile;

  updateSelectedFileLS();

}

function saveCodeLS() {

  selectedFile.content = encodeUnicode(cd.innerHTML);

  updateSelectedFileLS();

}

function saveCodeCaretPosLS() {

  const codeSel = cd.getSelection();
  selectedFile.caretPos = [codeSel.start, codeSel.end];

  updateSelectedFileLS();

}

function saveCodeScrollPosLS() {

  selectedFile.scrollPos = [cd.scrollLeft, cd.scrollTop];

  updateSelectedFileLS();

}

function saveCodeLangLS() {

  selectedFile.lang = cd.lang;

  updateSelectedFileLS();

}

function updateSelectedFileLS() {

  setStorage('selectedFile', JSON.stringify(selectedFile));

}


// miscellaneous

function saveTreeLocLS(treeLoc) {

  setStorage('tree', treeLoc.join());

}

function saveSidebarStateLS() {

  setStorage('sidebar', body.classList.contains('expanded'));

}

function saveAuthTokenLS(authToken) {

  setStorage('token', authToken);

}
