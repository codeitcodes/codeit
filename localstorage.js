
// load local storage
function loadLS() {

  // if selected file exists in storage
  if (getStorage('selectedFile')) {

    // load selected file from storage
    selectedFile = JSON.parse(getStorage('selectedFile'));

  } else {

    // load empty file
    changeSelectedFile(',,', '', '', '', '', [0, 0], [0, 0], false);

  }

  // if modified files exist in storage
  // and not embed
  if (getStorage('modifiedFiles') && !isEmbed) {

    // load modified files from storage
    modifiedFiles = Object.fromEntries(JSON.parse(getStorage('modifiedFiles')));

  } else {

    modifiedFiles = {};

  }

  // if modified repos exist in storage
  if (getStorage('modifiedRepos')) {

    // load modified repos from storage
    modifiedRepos = Object.fromEntries(JSON.parse(getStorage('modifiedRepos')));

  } else {

    modifiedRepos = {};

  }
  
  setupLiveView();
  setupCodeitApp();

}


// files

function updateSelectedFileLS() {
  
  if (!isEmbed) {
    
    setStorage('selectedFile', JSON.stringify(selectedFile));
    
  }

}

function updateModFilesLS() {
  
  if (!isEmbed) {
    
    setStorage('modifiedFiles', JSON.stringify(Object.entries(modifiedFiles)));
    
  }

}


// repos

function updateModReposLS() {
  
  setStorage('modifiedRepos', JSON.stringify(Object.entries(modifiedRepos)));
  
}


// miscellaneous

function saveTreeLocLS(treeLoc) {
  
  if (!isEmbed) {
    
    setStorage('tree', treeLoc.join());
    
  }

}

function saveSidebarStateLS() {

  if (!isEmbed) {

    setStorage('sidebar', body.classList.contains('expanded'));
    
  }

}

function saveGitTokenLS(gitToken) {

  setStorage('gitToken', gitToken);

}
