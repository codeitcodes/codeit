
// toggle sidebar on click of bookmark
github.addEventListener('click', () => {
  
  body.classList.toggle('expanded');
  saveSidebarStateLS();
  
})


// render files
// call this function when signed in to github
// to render sidebar
async function renderFilesHTML() {
  
  // if not already loading, start loading
  if (loader.style.opacity != '1') {
    startLoading();
  }
  
  // map tree location
  const [user, repo, contents] = treeLoc;
  
  // get items in current tree from git
  const resp = await git.getItems(treeLoc);
  
  // save rendered HTML
  let out = '';
  
  // if response
  if (resp) {
    
    // show title
    
    sidebarLogo.classList.remove('overflow');
    
    if (contents != '') {
      
      // show path
      sidebarLogo.innerText = repo + contents;
      
      // if path is too long, overflow
      if (sidebarLogo.innerText.length > 25) {
        
        sidebarLogo.classList.add('overflow');
        
      }
      
    } else if (repo != '') {
      
      // show repo name
      sidebarLogo.innerText = repo;
      
    } else {
      
      // show title
      sidebarLogo.innerText = 'Repositories';
      
    }
    
    
    // if navigating in repository
    if (repo != '') {
      
      // render files
      resp.forEach(item => {
        
        // if item is a file
        if (item.type == 'file') {
          
          // add modified flag to file
          let modified = '';
          if (modifiedFiles[item.sha]) modified = 'modified';
          
          out += `
          <div class="item file `+ modified +`" sha="`+ item.sha +`">
            <div class="label">
              `+ fileIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            <div class="push-wrapper">
              `+ pushIcon +`
            </div>
          </div>
          `;
          
          
        } else { // if item is a folder
          
          out += `
          <div class="item folder">
            <div class="label">
              `+ folderIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            `+ arrowIcon +`
          </div>
          `;
          
        }
        
      });
      
    } else { // else, show all repositories
      
      // render repositories
      resp.forEach(item => {
        
        // if user does not have admin permissions in repo,
        // show admin name in title ([admin]/[repo])
        let fullName = item.permissions.admin ? item.name : item.full_name;
        
        out += `
        <div class="item repo" fullname="`+ item.full_name +`">
          <div class="label">
            `+ repoIcon +`
            <a class="name">`+ fullName +`</a>
          </div>
          `+ arrowIcon +`
        </div>
        `;
        
      });
      
    }
    
  }
  
  // add rendered HTML to dom
  fileWrapper.innerHTML = out;
  sidebar.scrollTo(0, 0);
  
  // stop loading
  stopLoading();
  
  // add item event listeners
  addHTMLItemListeners();
  
  // hide search screen
  header.classList.remove('searching');
  
  // if selected file is in directory
  if (selectedFile.dir == treeLoc.join()) {
    
    let selectedItem = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');
    
    if (selectedItem) {
    
      // select file
      selectedItem.classList.add('selected');
      selectedItem.scrollIntoViewIfNeeded();
      
    }
    
  }
  
}


// adds item event listeners
function addHTMLItemListeners() {
  
  let items = fileWrapper.querySelectorAll('.item');
  
  // run on all items
  items.forEach(item => {
    
    // navigate on click
    item.addEventListener('click', async (e) => {
      
      // if item is a repository
      if (item.classList.contains('repo')) {
        
        // change location
        let itemLoc = getAttr(item, 'fullname').split('/');
        
        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1];
        saveTreeLocLS(treeLoc);
        
        // render files
        renderFilesHTML();
        
      } else if (item.classList.contains('folder')) {
        
        // if item is a folder
        
        // change location
        treeLoc[2] += '/' + item.innerText;
        saveTreeLocLS(treeLoc);
        
        // render files
        renderFilesHTML();
        
      } else { // if item is a file
        
        // if not clicked on push button
        let clickedOnPush = (e.target == item.querySelector('.push') ||
                             e.target.parentElement == item.querySelector('.push'));
        
        if (!clickedOnPush) {
          
          // if file not already selected
          if (!item.classList.contains('selected')) {
            
            // load file
            loadFileInHTML(item, getAttr(item, 'sha'));
            
          } else if (isMobile) { // if on mobile device
            
            // update bottom float
            updateFloat();
            
          }
          
        } else {
          
          // push file
          
          // play push animation
          playPushAnimation(item);
          
          // file cannot be modified
          // if its SHA was updated
          item.classList.remove('modified');
          
          
          // create commit   
          let commit = {};
          let commitFile = {};
          
          // set commit message
          commit.message = 'Update ' + item.innerText;
          
          // get SHA of file
          commitFile.sha = getAttr(item, 'sha');
                    
          // if currently editing file
          if (item.classList.contains('selected')) {

            // get current value of file
            commitFile.content = btoa(cd.textContent);

          } else { // else, load from storage

            commitFile.content = modifiedFiles[commitFile.sha][0];
            
          }
          
          
          // push file asynchronously
          const newSha = await git.push(treeLoc, commitFile, commit);
          
          // delete file from local storage
          deleteModifiedFileLS(commitFile.sha);
          
          // update file in HTML
          updateFileShaHTML(item, newSha);
          
        }
        
      }
      
    })
    
  })
  
}


async function loadFileInHTML(file, sha) {
  
  // if previous selection exists
  if (selectedFile.sha != '') {
  
    // get selection in modifiedFiles array
    let selectedItem = modifiedFiles[selectedFile.sha];

    // if previous selection was modified
    if (selectedItem) {

      // save previous selection in localStorage

      const previousFile = {
        dir: treeLoc.join(),
        sha: selectedFile.sha,
        name: selectedFile.name,
        exists: selectedFile.exists,
        content: btoa(cd.textContent)
      };

      saveModifiedFileLS(previousFile);

    }

  }

  // clear existing selections
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }

  const selectedFileName = file.querySelector('.name').innerText;

  // change selected file

  file.classList.add('selected');

  const newSelectedFile = {
    dir: treeLoc.join(),
    sha: getAttr(file, 'sha'),
    name: selectedFileName,
    exists: getAttr(file, 'exists')
  };

  changeSelectedFileLS(newSelectedFile);
  
  // if file is not modified; fetch from Git
  if (!file.classList.contains('modified')) {
    
    // start loading
    startLoading();
    
    // get file from git
    const resp = await git.getFile(treeLoc, selectedFileName);

    // show file content in codeit
    cd.textContent = atob(resp.content);
    
    // stop loading
    stopLoading();
    
  } else { // else, load file from local storage
    
    const content = codeStorage.modifiedFiles[sha].content;
    
    // show file content in codeit
    cd.textContent = atob(content);
    
  }
  
  // change codeit lang
  cd.lang = getFileLang(selectedFileName);
  
  // set caret pos in code
  cd.setSelection(0, 0);
  cd.scrollTo(0, 0);
  
  // save code in local storage
  saveCodeLS();
  saveCodePosLS();
  saveCodeLangLS();
  
  // if on mobile device
  if (isMobile) {
    
    // update bottom float
    updateFloat();
    
  }
 
}


function updateFileShaHTML(file, newSha) {
  
  // update SHA of file
  setAttr(file, 'sha', newSha);
  
  // if file is selected
  if (file.classList.contains('selected')) {

    const newSelectedFile = {
      dir: treeLoc.join(),
      sha: newSha,
      name: file.innerText,
      exists: true
    };
    
    changeSelectedFileLS(newSelectedFile);

  }
  
}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {
  
  // map tree location
  const [user, repo, contents] = treeLoc;
  
  // if navigating in folders
  if (contents != '') {
    
    // pop last folder
    let splitContents = contents.split('/');
    splitContents.pop();
    
    // change location
    treeLoc[2] = splitContents.join('/');
    saveTreeLocLS(treeLoc);
    
    // render files
    renderFilesHTML();
    
  } else if (repo != '') { // if navigating in repository
    
    // change location
    treeLoc[1] = '';
    saveTreeLocLS(treeLoc);
    
    // render files
    renderFilesHTML();
    
  } else { // show learn screen
    
    sidebar.classList.add('learn');
    
  }
  
})


// check for backspace to see if code has changed
function checkBackspace(e) {
  
  if (e.key === "Backspace" || e.key === "Delete") {
    codeChange();
  }
  
}

// called on code change event
function codeChange() {
  
  const selectedEl = fileWrapper.querySelector('.selected:not(.modified)');
  
  // if selected file exists
  if (selectedEl) {
    
    // enable pushing file
    selectedEl.classList.add('modified');

    // enable pushing from bottom float
    bottomFloat.classList.add('modified');
    
    // save modified file in localStorage

    const modifiedFile = {
      dir: treeLoc.join(),
      sha: selectedFile.sha,
      name: selectedFile.name,
      exists: selectedFile.exists,
      content: btoa(cd.textContent)
    };

    saveModifiedFileLS(modifiedFile);
    
  }
  
  // save code in async thread
  asyncThread(saveBeforeUnloadLS, 300);

}

function setupEditor() {
  
  // add editor event listeners
  cd.addEventListener('keydown', checkBackspace);
  cd.addEventListener('input', codeChange);
  
  // if code in storage
  if (getStorage('code')) {
    
    // set codeit to code
    cd.lang = getStorage('lang');
    cd.textContent = atob(getStorage('code'));

    // set caret pos in code
    cd.setSelection(getStorage('caret'), getStorage('caret'));

    // scroll to pos in code
    cd.scrollTo(getStorage('scrollPos').split(',')[0], getStorage('scrollPos').split(',')[1]);

  }
  
}

function setupSidebar() {
  
  // if sidebar is open
  if (getStorage('sidebar') == 'true') {
    
    // do a silent transition
    body.classList.add('transitioning');
    body.classList.add('expanded');
    
    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 400);

  } else {
    
    // update bottom floater
    updateFloat();
    
  }
  
}
