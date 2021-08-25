
// toggle sidebar on click of bookmark
github.addEventListener('click', () => {
  
  body.classList.toggle('expanded');
  
})


// render files
// call this function when signed in to github
// to render sidebar
async function renderFiles() {
  
  // if not already loading, start loading
  if (loader.style.opacity != '1') {
    startLoading();
  }
  
  // map tree location
  let query = 'https://api.github.com';
  const [user, repo, contents] = treeLoc;
  
  // if navigating in repository
  if (repo != '') {
    
    query += '/repos/'+ user +'/'+ repo +'/contents'+ contents;
    
  } else { // else, show all repositories
    
    query += '/user/repos?visibility=all&sort=updated&page=1';
    
  }

  // get the query
  var resp = await axios.get(query, githubToken);
  
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
        
        // if repo is not user-created,
        // show username of admin (username/repo)
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
  addItemListeners();
  
  // hide search screen
  header.classList.remove('searching');
  
  // if selected file is in directory
  if (selectedFile.dir == treeLoc.join()) {
    
    let selectedItem = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');
    
    if (selectedItem) {
    
      // select file
      selectedItem.classList.add('selected');
      selectedItem.scrollIntoViewIfNeeded();
      
      // set event listener for file change
      cd.addEventListener('keydown', checkBackspace);
      cd.addEventListener('input', fileChange);
      
    }
    
  }
  
}


// adds item event listeners
function addItemListeners() {
  
  let items = fileWrapper.querySelectorAll('.item');
  
  // run on all items
  items.forEach(item => {
    
    // navigate on click
    item.addEventListener('click', (e) => {
      
      // if item is a repository
      if (item.classList.contains('repo')) {
        
        // change location
        let itemLoc = getAttr(item, 'fullname').split('/');
        
        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1];
        setStorage('tree', treeLoc.join());
        
        // render files
        renderFiles();
        
      } else if (item.classList.contains('folder')) {
        
        // if item is a folder
        
        // change location
        treeLoc[2] += '/' + item.innerText;
        setStorage('tree', treeLoc.join());
        
        // render files
        renderFiles();
        
      } else { // if item is a file
        
        // if not clicked on push button
        let clickedOnPush = (e.target == item.querySelector('.push') ||
                             e.target.parentElement == item.querySelector('.push'));
        
        if (!clickedOnPush) {
          
          // if file not already selected
          if (!item.classList.contains('selected')) {
            
            // load file
            loadFile(item, getAttr(item, 'sha'));
            
          } else if (isMobile) { // if on mobile device
            
            // update bottom float
            updateFloat();
            
          }
          
        } else {
          
          // push file
          
          // play push animation
          item.classList.add('checked');
          
          // build file and commit
          
          let file = {};
          let commit = {};
          
          file.sha = getAttr(item, 'sha');
          file.selected = item.classList.contains('selected');
          
          // set commit message
          commit.message = 'Update ' + item.innerText;
          
          // push file asynchronously
          pushFile(file, commit);
          
        }
        
      }
      
    })
    
  })
  
}


async function loadFile(file, sha) {
  
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
      
      saveModifiedFile(previousFile);
      
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
  
  changeSelectedFile(newSelectedFile);
  
  // if file is not modified; fetch from Git
  if (!file.classList.contains('modified')) {
    
    // start loading
    startLoading();
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;
    
    query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ selectedFileName;
    
    // get the query
    var resp = await axios.get(query, githubToken);

    // show file content in codeit
    cd.textContent = atob(resp.content);
    
    // stop loading
    stopLoading();
    
  } else { // else, load file from local storage
    
    const content = modifiedFiles[sha].content;
    
    // show file content in codeit
    cd.textContent = atob(content);
    
  }
  
  // change codeit lang
  cd.lang = getFileLang(selectedFileName);
  
  // set caret pos in code
  cd.setSelection(0, 0);
  cd.scrollTo(0, 0);
  
  // if on mobile device
  if (isMobile) {
    
    // update bottom float
    updateFloat();
    
  }
  
  // set event listener for file change
  cd.addEventListener('keydown', checkBackspace);
  cd.addEventListener('input', fileChange);
  
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
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else if (repo != '') { // if navigating in repository
    
    // change location
    treeLoc[1] = '';
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else { // show learn screen
    
    sidebar.classList.add('learn');
    
  }
  
})


// check for backspace to see if file has changed
function checkBackspace(e) {
  
  if (e.key === "Backspace" || e.key === "Delete") {
    fileChange();
  }
  
}

// called on file change event
function fileChange() {
  
  const file = fileWrapper.querySelector('.selected');
  
  // enable pushing file
  file.classList.add('modified');
  
  // change bottom float flag
  bottomFloat.classList.add('modified');
  
  // save modified file in localStorage
  
  const modifiedFile = {
    dir: treeLoc.join(),
    sha: selectedFile.sha,
    name: selectedFile.name,
    exists: selectedFile.exists,
    content: btoa(cd.textContent)
  };
  
  saveModifiedFile(modifiedFile);

  // remove event listener
  cd.removeEventListener('keydown', checkBackspace);
  cd.removeEventListener('input', fileChange);

}
