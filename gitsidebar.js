
// render files
// call this function when signed in to github
// to render sidebar
async function renderFiles() {
  
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
          
          out += `
          <div class="item file" sha="`+ item.sha +`">
            <div class="label">
              `+ fileIcon +`
              <a class="name">`+ item.name +`</a>
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
  
  // add item event listeners
  addItemListeners();
  
  // if selected file exists
  if (getStorage('selectedFile')) {
    
    let selectedFile = fileWrapper.querySelector('.item[sha="'+ getStorage('selectedFile') +'"]');
    
    if (selectedFile) {
    
      // select file
      selectedFile.classList.add('selected');
      selectedFile.scrollIntoViewIfNeeded();
      
    }
    
  }
  
}


// adds item event listeners
function addItemListeners() {
  
  let items = fileWrapper.querySelectorAll('.item');
  
  // run on all items
  items.forEach(item => {
    
    // navigate on click
    item.addEventListener('click', () => {
      
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
        
        // if item is a repository
        
        // change location
        treeLoc[2] += '/' + item.innerText;
        setStorage('tree', treeLoc.join());
        
        // render files
        renderFiles();
        
      } else { // if item is a file
        
        // load file
        loadFile(item, getAttr(item, 'sha'));
        
      }
      
    })
    
  })
  
}


async function loadFile(file, sha) {
  
  // clear existing selections
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }
  
  // save selected file
  file.classList.add('selected');
  setStorage('selectedFile', sha);
  
  // map tree location
  let query = 'https://api.github.com';
  const [user, repo, contents] = treeLoc;
  
  query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ file.innerText;
  
  // get the query
  var resp = await axios.get(query, githubToken);
  
  // show file content in codeit
  cd.setValue(atob(resp.content));
  
  // set caret pos in code
  cd.textarea.setSelectionRange(0, 0);
  //cd.textarea.focus();
  
}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {
  
  // map tree location
  let [user, repo, contents] = treeLoc;
  
  // clear selected file
  setStorage('selectedFile', '');
  
  // if navigating in folders
  if (contents != '') {
    
    // pop last folder
    contents = contents.split('/');
    contents.pop();
    
    // change location
    treeLoc[2] = contents.join('/');
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else if (repo != '') { // if navigating in repository
    
    // change location
    treeLoc[1] = '';
    setStorage('tree', treeLoc.join());
    
    // render files
    renderFiles();
    
  } else { // show user
    
    
    
  }
  
})
