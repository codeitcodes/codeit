
let modifiedFiles, selectedFile;

// create a file
function createFile(dir, sha, name, content, lang,
                    scrollPos, caretPos, eclipsed) {

  return {
    dir: dir,
    sha: sha,
    name: name,
    content: content,
    lang: lang,
    scrollPos: scrollPos,
    caretPos: caretPos,
    eclipsed: eclipsed
  }

}


// selected file

function changeSelectedFile(dir, sha, name, content, lang,
                            scrollPos, caretPos, eclipsed) {

  selectedFile = createFile(dir, sha, name, content, lang,
                            scrollPos, caretPos, eclipsed);

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

// when Git file is eclipsed (not updated) in browser private cache,
// store the updated file in modifiedFiles object for 1 minute after commit
function onFileEclipsedInCache(oldSha, newSha) {

  // find the eclipsed file
  let fileToUpdate = modifiedFiles[oldSha];

  fileToUpdate.sha = newSha;
  fileToUpdate.eclipsed = true;

  updateModFilesLS();

  // if file is selected
  if (selectedFile.sha === oldSha) {

    // update selected file
    selectedFile.sha = newSha;
    selectedFile.eclipsed = true;

    updateSelectedFileLS();

  }


  // set 1 minute timeout to remove updated file
  window.setTimeout(() => {

    // if not commited again while in timout
    if (fileToUpdate.sha === newSha) {

      // if file is selected
      if (selectedFile.sha === newSha) {

        // update selected file
        selectedFile.eclipsed = false;

        updateSelectedFileLS();

      }

      // remove the updated file from modifiedFiles
      deleteModFile(oldSha);

    }

  }, 60 * 1000); // 60s

}

function deleteModFile(fileSha) {

  delete modifiedFiles[fileSha];

  updateModFilesLS();

}
