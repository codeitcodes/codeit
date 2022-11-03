
// github login

window.addEventListener('load', async () => {

  gitToken = getStorage('gitToken') ?? '';

  if (gitToken == 'undefined') {
    gitToken = '';
  }


  // decode URL
  linkData = decodeLink(window.location.href);

  // clear URL
  window.history.replaceState(window.location.origin, 'Codeit', window.location.origin + '/full');


  // if treeLoc is in local storage
  if (linkData.dir) {

    treeLoc = linkData.dir;
    saveTreeLocLS(treeLoc);

  } else {

    treeLoc = getStorage('tree') ? getStorage('tree').split(',') : ['', '', ''];
    
    // if repo dosen't have a branch (legacy treeLoc)
    if (treeLoc[1] && !treeLoc[1].includes(':')) {
      
      // add default branch to repo
      treeLoc[1] += ':main';
      saveTreeLocLS(treeLoc);
      
    }
    
  }


  if (getStorage('loggedUser')) {
    
    loggedUser = getStorage('loggedUser');
    
    try {
      
      loggedUser = JSON.parse(loggedUser);

      // save logged user in local storage
      setStorage('loggedUser', loggedUser.login);
      
    } catch(e) {}
    
  } else {
    
    loggedUser = false;
    
  }


  const authURL = 'https://github.com/login/oauth/authorize?client_id=7ede3eed3185e59c042d&scope=repo,user,write:org';

  loginButton.addEventListener('click', () => {
    
    if (isMobile) {
      
      window.location.href = authURL;
      
    } else {
      
      window.open(authURL, 'Login with GitHub', 'height=575,width=575');
      
    }

  })


  window.addEventListener('message', async (event) => {
    
    // if received a git code
    if (event.origin === window.location.origin
        && event.data.startsWith('gitCode=')) {
    
      // hide intro screen
      sidebar.classList.remove('intro');
      
      // if on Repositories page
      if (treeLoc[1] === '') {
        
        // show sidebar title
        sidebarLogo.innerText = 'Repositories';
        
      }
  
      // if on safari, refresh header color
      if (isSafari) {
  
        document.querySelector('meta[name="theme-color"]').content = '#313744';
  
        onNextFrame(() => {
  
          document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
  
        });
  
      }
  
      // start loading
      startLoading();
        
      const gitCode = event.data.split('gitCode=')[1];
  
      // get git token from Github
      await getGithubToken(gitCode);
      
      // clear modified repos
      modifiedRepos = {};
      updateModReposLS();
      
      if (messageEl.textContent === 'Logging in...') {
        hideMessage();
      }
      
      // render sidebar
      renderSidebarHTML();
      
    }
  
  })
  
  
  // if git code exists in link
  if (linkData.gitCode) {
    
    // hide intro screen
    sidebar.classList.remove('intro');
    
    // if on Repositories page
    if (treeLoc[1] === '') {
      
      // show sidebar title
      sidebarLogo.innerText = 'Repositories';
      
    }
    
    if (getStorage('sidebar') === 'true') {
      
      // don't transition
      body.classList.add('notransition');
  
      toggleSidebar(true);
  
      onNextFrame(() => {
  
        body.classList.remove('notransition');
  
      });


      // if on safari, refresh header color
      if (isSafari) {
  
        document.querySelector('meta[name="theme-color"]').content = '#313744';
  
        onNextFrame(() => {
  
          document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
  
        });
        
      }

    } else {
      
      // if on safari, refresh header color
      if (isSafari) {
  
        document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
  
        onNextFrame(() => {
  
          document.querySelector('meta[name="theme-color"]').content = '#313744';
  
        });
        
      }
      
    }

    // start loading
    startLoading();
    
    body.classList.add('loaded');
    
    showMessage('Logging in...', -1);

    const gitCode = linkData.gitCode;

    // get git token from Github
    await getGithubToken(gitCode);
    
    // clear modified repos
    modifiedRepos = {};
    updateModReposLS();
    
    hideMessage();
    
  }
  
  
  loadLS();

});

async function getGithubToken(gitCode) {

  // post through CORS proxy to git with clientId, clientSecret and code
  const resp = await axios.get(window.location.origin + '/api/cors?url=' +
                               'https://github.com/login/oauth/access_token?' +
                               'client_id=7ede3eed3185e59c042d' +
                               '&client_secret=c1934d5aab1c957800ea8e84ce6a24dda6d68f45' +
                               '&code=' + gitCode, '', true);

  // save git token to localStorage
  gitToken = resp.split('access_token=')[1].split('&')[0];
  saveGitTokenLS(gitToken);


  // if logged user dosen't exist
  if (getStorage('loggedUser') === null) {

    // get logged user
    loggedUser = await axios.get('https://api.github.com/user', gitToken);
    loggedUser = loggedUser.login;
  
    // save logged user in local storage
    setStorage('loggedUser', loggedUser);
    
  }

}

