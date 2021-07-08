/*
  github
*/

const body = document.body,
      
      github = document.querySelector('.github'),
      
      sidebar = document.querySelector('.sidebar'),
      introWrapper = sidebar.querySelector('.intro-wrapper'),
      contentWrapper = sidebar.querySelector('.content-wrapper'),
      
      loginButton = introWrapper.querySelector('.login'),
      
      header = contentWrapper.querySelector('.header'),
      
      titleScreen = header.querySelector('.titlescreen'),
      searchScreen = header.querySelector('.searchscreen'),
      
      sidebarTitle = titleScreen.querySelector('.title'),
      sidebarLogo = sidebarTitle.querySelector('.logo'),
      
      searchButton = titleScreen.querySelector('.search'),
      searchBack = searchScreen.querySelector('.back'),
      searchInput = searchScreen.querySelector('.searchinput'),
      searchClear = searchScreen.querySelector('.clear'),
      
      fileWrapper = sidebar.querySelector('.files');


// toggle sidebar on click of bookmark
github.addEventListener('click', () => {
  
  body.classList.toggle('expanded');
  
})



// Github login
const clientId = '7ede3eed3185e59c042d';

let githubToken, treeLoc;

window.onload = () => {
  
  githubToken = getStorage('token');
  treeLoc = getStorage('tree') ? getStorage('tree').split(',') : ['', '', ''];

  loginButton.addEventListener('click', () => {
  
    window.open('https://github.com/login/oauth/authorize?client_id='+ clientId +'&scope=repo', 'Login with Github', 'height=575,width=575');
  
  })
  
  // if not logged into Github
  if (githubToken == null) {

    // show intro screen
    sidebar.classList.add('intro');

  } else {

    // render files
    renderFiles();

  }
  
  // if redirected from Github auth
  window.addEventListener('message', (event) => {
    
    var githubCode = event.data;
    
    // get Github token
    getGithubToken(githubCode);
  
  })
  
  loadCodeFromStorage();
  
}

async function getGithubToken(githubCode) {
  
  // CORS post to Github with clientId, clientSecret and code
  var resp = await axios.post('https://sceptercors.herokuapp.com/' +
                              'https://github.com/login/oauth/access_token?' +
                              'client_id=' + clientId +
                              '&client_secret=c1934d5aab1c957800ea8e84ce6a24dda6d68f45' +
                              '&code=' + githubCode);
  
  // save token to localStorage
  githubToken = resp.access_token;
  setStorage('token', githubToken);
  
  // get username
  var user = await axios.get('https://api.github.com/user', githubToken);
  
  // save location in filetree
  treeLoc = [user.login, '', ''];
  setStorage('tree', treeLoc.join());
  
  // render files
  sidebar.classList.remove('intro');
  renderFiles();
  
}


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
    
    query += '/users/'+ user +'/repos';
    
  }

  // get the query
  var resp = await axios.get(query, githubToken);
  
  // save rendered HTML
  let out = '';
  
  // if response
  if (resp) {
    
    // if navigating in repository
    if (repo != '') {
      
      // show repo name
      sidebarLogo.innerText = repo;
      
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
      
      // show title
      sidebarLogo.innerText = 'Repositories';
      
      // render repositories
      resp.forEach(item => {
        
        out += `
        <div class="item repo">
          <div class="label">
            `+ repoIcon +`
            <a class="name">`+ item.name +`</a>
          </div>
          `+ arrowIcon +`
        </div>
        `;
        
      });
      
    }
    
  }
  
  // add rendered HTML to dom
  fileWrapper.innerHTML = out;
  
  // add item event listeners
  addItemListeners();
  
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
        treeLoc[1] = item.innerText;
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
        
        // show file
        showFile(item, getAttr(item, 'sha'));
        
      }
      
    })
    
  })
  
}


async function showFile(file, sha) {
  
  // clear existing selections
  fileWrapper.querySelector('.selected').classList.remove('selected');
  
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
  
}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {
  
  // map tree location
  const [user, repo, contents] = treeLoc;
  
  // if navigating in folders
  if (contents != '') {
    
    // pop last folder
    contents = contents.split('/');
    contents.pop();
    
    // change location
    treeLoc[2] = contents;
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



// open search screen on click of button
searchButton.addEventListener('click', () => {
  
  header.classList.add('searching');
  
  // focus search input
  searchInput.focus();
  
})

// close search screen on click of button
searchBack.addEventListener('click', () => {
    
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  header.classList.remove('searching');
  
  // clear search input
  window.setTimeout(() => {
    
    searchInput.innerText = '';
    
  }, 180);
  
})

// search when typed in input
searchInput.addEventListener('input', () => {
  
  let query = searchInput.innerText.toLowerCase();
  let files = fileWrapper.querySelectorAll('.item');
  
  // search files
  files.forEach(file => {
    
    let name = file.querySelector('.name').innerText;
    
    if (!name.toLowerCase().includes(query)) {

      file.style.display = 'none';

    }

    else {

      file.style.display = '';

    }

  })
  
  // if search query exists
  if (searchInput.innerText != '') {
    
    // show clear button
    searchClear.classList.add('visible');
    
  } else {
    
    // hide clear button
    searchClear.classList.remove('visible');
    
  }
  
})

// clear search input when clicked on button
searchClear.addEventListener('click', () => {
  
  // clear search input
  searchInput.innerText = '';
  
  // show all files
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });
  
  // hide clear button
  searchClear.classList.remove('visible');
  
  // focus search input
  searchInput.focus();
  
})



function loadCodeFromStorage() {
  
  // if code in storage
  if (getStorage('code')) {
    
    // set codeit to code
    cd.setValue(getStorage('code'));
    
    // set caret pos in code
    cd.textarea.setSelectionRange(getStorage('caret'), getStorage('caret'));
    cd.textarea.focus();
        
  }
  
  // if sidebar is open
  if (getStorage('sidebar') == 'true') {
    
    // do a silent transition
    body.classList.add('transitioning');
    body.classList.add('expanded');

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 400);

  }
  
}

window.onbeforeunload = () => {
  
  // set localStorage values
  setStorage('code', cd.textarea.value);
  setStorage('caret', cd.textarea.selectionStart);
  setStorage('sidebar', body.classList.contains('expanded'));
  
};



// localStorage

let getStorage = (item) => {
  
  return localStorage.getItem(item);
  
}

let setStorage = (item, value) => {
  
  return localStorage.setItem(item, value);
  
}


// Attributes

let getAttr = (element, item) => {
  
  return element.getAttribute(item);
  
}

let setAttr = (element, item, value) => {
  
  return element.setAttribute(item, value);
  
}


// HTTP Request
let axios = {
  'get': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };
        
        xmlhttp.open('GET', url, true);
        
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  },
  'post': (url, data, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('POST', url, true);
        
        xmlhttp.setRequestHeader('Accept', 'application/json');
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'put': (url, data, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('PUT', url, true);

        xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'delete': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };

        xmlhttp.open('DELETE', url, true);
        
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};



const repoIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" fill="currentColor"></path> </svg>';
const fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M14.59 2.59c-.38-.38-.89-.59-1.42-.59H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM15 18H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2-6V3.5L18.5 9H14c-.55 0-1-.45-1-1z" fill="currentColor"></path> </svg>';
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z" fill="currentColor"></path> </svg>';

const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="arrow" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" fill="currentColor"></path> </svg>';
