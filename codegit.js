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
    
    // hide intro screen
    sidebar.classList.remove('intro');
    
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
  
  /*
  // get username
  var user = await axios.get('https://api.github.com/user', githubToken);
  
  // save location in filetree
  treeLoc = [user.login, '', ''];
  setStorage('tree', treeLoc.join());
  */
  
  // render files
  renderFiles();
  
}



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
