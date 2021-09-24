
// load local storage
function loadLS() {

  // load selected file from storage
  selectedFile = getStorage('selectedFile') ? JSON.parse(getStorage('selectedFile')) : {};

  // load modified files from storage
  modifiedFiles = getStorage('modifiedFiles') ? JSON.parse(getStorage('modifiedFiles')) : {};

  setupCodeitApp();

}


// files

function updateSelectedFileLS() {

  setStorage('selectedFile', JSON.stringify(selectedFile));

}

function updateModFilesLS() {

  setStorage('modifiedFiles', JSON.stringify(modifiedFiles));

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
