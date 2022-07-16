
// load local storage
function loadLS() {

  // if selected file exists in storage
  if (getStorage('selectedFile')) {

    // load selected file from storage
    selectedFile = axios.get('/worker/storage/selectedFile');
    //@@selectedFile = JSON.parse(getStorage('selectedFile'));

  } else {

    // load empty file
    changeSelectedFile(',,', '', '', '', '', [0, 0], [0, 0], false);

  }


  // if modified files exist in storage
  // and not embed  
  if (!isEmbed) {
    
    const modFilesStorage = axios.get('/worker/storage/modifiedFiles');
    
    if (modFilesStorage) {

      // load modified files from storage
      modifiedFiles = modFilesStorage;
      //@@modifiedFiles = Object.fromEntries(JSON.parse(getStorage('modifiedFiles')));
    
    } else {
      
      modifiedFiles = {};
      
    }
    
  } else {

    modifiedFiles = {};

  }


  const modReposStorage = axios.get('/worker/storage/modifiedRepos');

  // if modified repos exist in storage
  if (modReposStorage) {

    // load modified repos from storage
    modifiedRepos = modReposStorage;
    //@@modifiedRepos = Object.fromEntries(JSON.parse(getStorage('modifiedRepos')));

  } else {

    modifiedRepos = {};

  }
  
  
  setupLiveView();
  setupCodeitApp();

}


// files

function updateSelectedFileLS() {
  
  if (!isEmbed) {
    
    //@@setStorage('selectedFile', JSON.stringify(selectedFile));
    axios.put('/worker/storage/selectedFile', '', selectedFile);
    
  }

}

function updateModFilesLS() {
  
  if (!isEmbed) {
    
    //@@setStorage('modifiedFiles', JSON.stringify(Object.entries(modifiedFiles)));
    axios.put('/worker/storage/modifiedFiles', '', modifiedFiles);
    
  }

}


// repos

function updateModReposLS() {
  
  //@@setStorage('modifiedRepos', JSON.stringify(Object.entries(modifiedRepos)));
  axios.put('/worker/storage/modifiedRepos', '', modifiedRepos);
  
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

  //@@setStorage('gitToken', gitToken);
  axios.put('/worker/storage/gitToken', '', gitToken);

}
