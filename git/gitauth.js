/*
  github
*/

// Github login
const clientId = '7ede3eed3185e59c042d';

let githubToken, treeLoc;

window.onload = async () => {

  githubToken = getStorage('token');
  
  if (githubToken == 'undefined') {
    githubToken = null;
  }
  
  treeLoc = getStorage('tree') ? getStorage('tree').split(',') : ['', '', ''];
  
  const url = new URL(window.location.href);
  const urlQuery = url.searchParams.get('q');
  
  window.history.pushState(window.location.origin, 'Codeit', window.location.origin + '/full');
  
  if (urlQuery) {
    
    toggleSidebar(false);
    saveSidebarStateLS();
    
    treeLoc = urlQuery.split('+')[0].split(',');
    
    // change selected file
    changeSelectedFile(treeLoc.join(), fileSha, fileName, '\n\r', getFileLang(fileName),
                       [0, 0], [0, 0], false);
    
    const fileName = urlQuery.split('+')[1].split(',')[0];
    const fileSha = urlQuery.split('+')[1].split(',')[1];
    
    // if file is not modified; fetch from Git
    if (!modifiedFiles[fileSha]) {

      // start loading
      startLoading();

      // get file from git
      const resp = await git.getFile(treeLoc, fileName);

      // change selected file
      changeSelectedFile(treeLoc.join(), fileSha, fileName, resp.content, getFileLang(fileName),
                         [0, 0], [0, 0], false);

      // stop loading
      stopLoading();

    } else { // else, load file from modifiedFiles object

      const modFile = modifiedFiles[fileSha];

      changeSelectedFile(modFile.dir, modFile.sha, modFile.name, modFile.content, modFile.lang,
                         modFile.caretPos, modFile.scrollPos, false);

    }
    
    // expand bottom float
    bottomWrapper.classList.add('expanded');
    toggleLiveView(selectedFile);

    // show file content in codeit
    cd.textContent = decodeUnicode(selectedFile.content);

    // change codeit lang
    cd.lang = selectedFile.lang;

    // set caret pos in codeit
    cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

    // set scroll pos in codeit
    cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

    // clear codeit history
    cd.history = [];

    // update line numbers
    updateLineNumbersHTML();

    // if on mobile device
    if (isMobile) {

      // update bottom float
      updateFloat();

    } else { // if on desktop

      // check codeit scrollbar
      checkScrollbarArrow();

    }
    
  }
  
  loginButton.addEventListener('click', () => {

    window.open('https://github.com/login/oauth/authorize?client_id='+ clientId +'&scope=repo,write:org', 'Login with Github', 'height=575,width=575');

  })

  // if redirected from Github auth
  window.addEventListener('message', (event) => {

    // hide intro screen
    sidebar.classList.remove('intro');
    
    // if on safari, refresh header color
    if (isSafari) {
      
      document.querySelector('meta[name="theme-color"]').content = '#313744';
      
      onNextFrame(() => {
        
        document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
        
      });
      
    }

    // start loading
    startLoading();

    const githubCode = event.data;

    // get Github token
    getGithubToken(githubCode);

  })

  loadLS();

}

async function getGithubToken(githubCode) {

  // post through CORS proxy to Github with clientId, clientSecret and code
  var resp = await axios.post('https://scepter-cors2.herokuapp.com/' +
                              'https://github.com/login/oauth/access_token?' +
                              'client_id=' + clientId +
                              '&client_secret=c1934d5aab1c957800ea8e84ce6a24dda6d68f45' +
                              '&code=' + githubCode);

  // save token to localStorage
  githubToken = resp.access_token;
  saveAuthTokenLS(githubToken);

  // render sidebar
  renderSidebarHTML();

}

