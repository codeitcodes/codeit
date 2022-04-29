
// gitlab login

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


  const authURL = 'https://gitlab.com/oauth/authorize?client_id=f3b94ba233943fa82855c1b495f28c02ccaa11cf276b419d6d1798488a4bb7b0&redirect_uri=https://codeit.codes/git/gitlab/oauth&response_type=code&state=1f3b3477&scope=api';

  loginButton.addEventListener('click', () => {
    
    if (isMobile) {
      
      window.location.href = authURL; 
      
    } else {
      
      window.open(authURL, 'Login with Gitlab', 'height=575,width=575');
      
    }

  })


  window.addEventListener('message', (event) => {

    // if redirected from git auth
    if (event.source.location.pathname === '/git/gitlab/oauth') {

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

      // get git token from Gitlab
      getGitlabToken(gitCode);

    }
    
  })
  
  
  loadLS();
  
  
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

    // get git token from Gitlab
    getGitlabToken(gitCode);
    
  }

}

async function getGitlabToken(gitCode) {

  // post to git with clientId, clientSecret and code
  const resp = await axios.post('https://gitlab.com/oauth/token?' +
                                'client_id=f3b94ba233943fa82855c1b495f28c02ccaa11cf276b419d6d1798488a4bb7b0' +
                                '&client_secret=1a4098e4770f84f01c94df563201d87b39dae740fe910622c76cd05d8ea30d03' +
                                '&grant_type=authorization_code&redirect_uri=https://codeit.codes/git/gitlab/oauth' +
                                '&code=' + gitCode);

  // save git token to localStorage
  gitToken = resp.access_token;
  saveGitTokenLS(gitToken);


  // get logged user
  loggedUser = await axios.get('https://gitlab.com/api/v4/user', gitToken);
  loggedUser = loggedUser.username;
  
  // save logged user in local storage
  setStorage('loggedUser', loggedUser);


  // render sidebar
  renderSidebarHTML();

}





await axios.post('https://gitlab.com/oauth/token?client_id=&client_secret=&code=&&redirect_uri=https://codeit.codes/git/gitlab/oauth')

