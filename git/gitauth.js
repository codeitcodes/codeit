/*
  github
*/

// git login

window.onload = async () => {

  gitToken = getStorage('gitToken') ?? '';

  if (gitToken == 'undefined') {
    gitToken = '';
  }


  // decode URL
  linkData = decodeLink(window.location.href);

  // clear URL
  window.history.pushState(window.location.origin, 'Codeit', window.location.origin + '/full');


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


  loginButton.addEventListener('click', () => {
    
    if (isMobile) {
      
        window.location.href = 'https://github.com/login/oauth/authorize?client_id=7ede3eed3185e59c042d&scope=repo,user,write:org';
      
    } else {
      
      window.open('https://github.com/login/oauth/authorize?client_id=7ede3eed3185e59c042d&scope=repo,user,write:org', 'Login with Github', 'height=575,width=575');
      
    }

  })


  window.addEventListener('message', (event) => {

    // if redirected from git auth
    if (event.source.location.pathname === '/git/login') {

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

      const gitCode = event.data;

      // get git token from Github
      getGithubToken(gitCode);

    }
    
  })

  
  // if git code exists in link
  if (linkData.gitCode) {
    
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

    const gitCode = linkData.gitCode;

    // get git token from Github
    await getGithubToken(gitCode);
    
  }
  
  
  loadLS();

}

async function getGithubToken(gitCode) {

  // post through CORS proxy to git with clientId, clientSecret and code
  const resp = await axios.post('https://scepter-cors2.herokuapp.com/' +
                               'https://github.com/login/oauth/access_token?' +
                               'client_id=7ede3eed3185e59c042d' +
                               '&client_secret=c1934d5aab1c957800ea8e84ce6a24dda6d68f45' +
                               '&code=' + gitCode);

  // save git token to localStorage
  gitToken = resp.access_token;
  saveGitTokenLS(gitToken);


  // get logged user
  loggedUser = await axios.get('https://api.github.com/user', gitToken);
  loggedUser = loggedUser.login;
  
  // save logged user in local storage
  setStorage('loggedUser', loggedUser);


  // render sidebar
  renderSidebarHTML();

}

