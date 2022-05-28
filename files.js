
// create a file
function createFile(dir, sha, name, content, lang,
                    caretPos, scrollPos, eclipsed) {

  return {
    dir,
    sha,
    name,
    content,
    lang,
    caretPos,
    scrollPos,
    eclipsed
  }

}


// selected file

function changeSelectedFile(dir, sha, name, content, lang,
                            caretPos, scrollPos, eclipsed) {

  selectedFile = createFile(dir, sha, name, content, lang,
                            caretPos, scrollPos, eclipsed);

  updateSelectedFileLS();

}

function saveSelectedFileContent() {

  selectedFile.content = encodeUnicode(cd.textContent);

  updateSelectedFileLS();
  

}

function saveSelectedFileCaretPos() {

  const codeSel = cd.getSelection();
  selectedFile.caretPos = [codeSel.start, codeSel.end];

  updateSelectedFileLS();

}

function saveSelectedFileScrollPos() {

  selectedFile.scrollPos = [cd.scrollLeft, cd.scrollTop];

  updateSelectedFileLS();

}

function saveSelectedFileLang() {

  selectedFile.lang = cd.lang;

  updateSelectedFileLS();

}


// modified files

function addSelectedFileToModFiles() {

  modifiedFiles[selectedFile.sha] = selectedFile;

  updateModFilesLS();

}

function updateModFileContent(sha, content) {

  modifiedFiles[sha].content = content;

  updateModFilesLS();

}

function updateModFileCaretPos(sha, caretPos) {

  modifiedFiles[sha].caretPos = caretPos;

  updateModFilesLS();

}

function updateModFileScrollPos(sha, scrollPos) {

  modifiedFiles[sha].scrollPos = scrollPos;

  updateModFilesLS();

}

// when Git file is eclipsed (not updated) in browser private cache,
// store the updated file under old sha as key
// and store the updated file under new sha as key
// in modifiedFiles object for 1 minute after commit
function onFileEclipsedInCache(oldSha, newSha, newFile) {
  
  // if file element under old sha exists in HTML,
  // update it to the new sha
  const fileEl = fileWrapper.querySelector('.file[sha="' + oldSha + '"]');
  if (fileEl) setAttr(fileEl, 'sha', newSha);
  
  
  // search for old eclipsed file
  // in modifiedFiles
  const oldEclipsedFile = modifiedFiles[oldSha];
  
  // if old eclipsed file
  // is modified
  if (oldEclipsedFile) {
  
    // update old eclipsed file sha
    // to point to new file sha
    updateOldEclipsedFile(oldEclipsedFile, newSha);
    
  }
  
  
  // if old eclipsed file
  // is selected
  if (selectedFile.sha === oldSha) {
  
    // update old eclipsed file sha
    // to point to new file sha
    updateOldEclipsedFile(selectedFile, newSha);
  
    updateSelectedFileLS();
  
  
    // if old eclipsed file
    // is modified
    if (oldEclipsedFile) {
  
      // update old file content
      // to selected file content
      oldEclipsedFile.content = selectedFile.content;
  
    }
  
  }
  
  
  function updateOldEclipsedFile(oldEclipsedFile, newSha) {
    
    // update old eclipsed file sha to point to new file sha
    oldEclipsedFile.sha = newSha;
  
    // set old file to eclipsed mode
    oldEclipsedFile.eclipsed = true;
    
  }
  
  
  // store the file under new sha as key
  modifiedFiles[newSha] = oldEclipsedFile;
  
  
  // update modified files in local storage
  updateModFilesLS();
  
  
  // set 1 minute timeout to remove eclipsed files
  window.setTimeout(() => {
    
    // if old eclipsed file exists
    if (modifiedFiles[oldSha]) {

      // delete the old eclipsed file
      // from modifiedFiles
      deleteModFile(oldSha);
      
    }
    
    // if not edited eclipsed file under new sha as key
    // while in timeout (file is still eclipsed)
    if (modifiedFiles[newSha] &&
        modifiedFiles[newSha].eclipsed) {
      
      // remove the eclipsed file under new sha as key
      // from modifiedFiles
      deleteModFile(newSha);
      
    }
    
  }, 65 * 1000); // 65s

}

function setTimeoutForEclipsedFiles() {
  
  const eclipsedFiles = Object.entries(modifiedFiles).filter(file => file[1].eclipsed);
  
  // run on all eclipsed files
  eclipsedFiles.forEach(file => {
    
    // set 1 minute timeout to remove eclipsed file
    window.setTimeout(() => {
      
      // if not edited eclipsed file
      // while in timeout (file is still eclipsed)
      if (modifiedFiles[file[0]] &&
          modifiedFiles[file[0]].eclipsed) {
      
        // remove the eclipsed file
        // from modifiedFiles
        deleteModFile(file[0]);
        
      }
      
    }, 65 * 1000); // 65s

  });
  
}

function deleteModFile(fileSha) {

  delete modifiedFiles[fileSha];

  updateModFilesLS();

}

// follow breadcrumb trail of file versions until
// reached latest version
function getLatestVersion(item) {
  
  function followTrail(crumb) {
    
    if (modifiedFiles[crumb]) {

      // if version sha matches its key
      // (it dosen't point to another version)
      if (modifiedFiles[crumb].sha === crumb) {

        // reached the most recent version
        return modifiedFiles[crumb];

      } else {

        // version sha points to another version,
        // follow the trail
        return followTrail(modifiedFiles[crumb].sha);

      }
      
    } else {
      
      return item;
      
    }
    
  }
  
  // if item is in modifiedFiles object
  if (modifiedFiles[item.sha]) {
    
    // get latest version
    return followTrail(item.sha);
    
  } else {
    
    return item;
    
  }
  
}
