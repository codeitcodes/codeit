
// load local storage
function loadLS() {
  
  // if selected file exists in storage
  if (getStorage('selectedFile')) {
    
    // load selected file from storage
    selectedFile = JSON.parse(getStorage('selectedFile'));
    
  } else {
    
    // load empty file
    changeSelectedFile('', '', '', '', '', [0, 0], [0, 0], false);
    
  }
  
  // if modified files exist in storage
  if (getStorage('modifiedFiles')) {
    
    // load modified files from storage
    modifiedFiles = Object.fromEntries(JSON.parse(getStorage('modifiedFiles')));
    
  } else {
    
    modifiedFiles = [];
    
  }
  
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
