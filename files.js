
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
  
  
  let fileToUpdate;
  
  // if old sha exists
  if (oldSha) {

    // store the updated file under old sha as key

    // find the eclipsed file
    fileToUpdate = modifiedFiles[oldSha];
    
    if (fileToUpdate) {
      
      // update old file to new sha
      fileToUpdate.sha = newSha;
      
      // set old file to eclipsed mode
      fileToUpdate.eclipsed = true;
  
      // if file to update is selected
      if (selectedFile.sha === oldSha) {
  
        // update its content
        // to the selected file contents
        fileToUpdate.content = selectedFile.content;
  
        // update selected file to new sha
        selectedFile.sha = newSha;
        
        // set selected file to eclipsed mode
        selectedFile.eclipsed = true;
  
        updateSelectedFileLS();
        
      }
      
    }
    
  } else {
    
    fileToUpdate = newFile;
    
  }
  
  
  if (fileToUpdate) {
    
    // store the updated file under new sha as key
    modifiedFiles[newSha] = fileToUpdate;
    
  }
  
  
  // update modified files in local storage
  updateModFilesLS();
  
  
  // set 1 minute timeout to remove updated files
  window.setTimeout(() => {
    
    // if old sha exists
    if (oldSha) {

      // remove the updated file under old sha as key
      // from modifiedFiles
      deleteModFile(oldSha);
      
    }
    
    // if not edited updated file under new sha as key
    // while in timeout (file is still eclipsed)
    if (modifiedFiles[newSha] &&
        modifiedFiles[newSha].eclipsed) {
      
      // remove the updated file under new sha as key
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
