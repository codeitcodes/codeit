/*
  github
*/

// Github login
const clientId = '7ede3eed3185e59c042d';

let githubToken, treeLoc;

window.onload = () => {

  githubToken = getStorage('token');
  treeLoc = getStorage('tree') ? getStorage('tree').split(',') : ['', '', ''];

  loginButton.addEventListener('click', () => {

    window.open('https://github.com/login/oauth/authorize?client_id='+ clientId +'&scope=repo', 'Login with Github', 'height=575,width=575');

  })
  
  logoutButton.addEventListener('click', () => {
    
    
    
  })

  // if redirected from Github auth
  window.addEventListener('message', (event) => {

    // hide intro screen
    sidebar.classList.remove('intro');

    // start loading
    startLoading();

    const githubCode = event.data;

    // get Github token
    getGithubToken(githubCode);

  })

  loadLS();

  // if not logged into Github
  if (githubToken == null) {

    // show intro screen
    sidebar.classList.add('intro');

    // do a silent transition
    body.classList.add('transitioning');

    // show sidebar
    toggleSidebar(true);
    saveSidebarStateLS();

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 0);

  } else {

    // render sidebar
    renderSidebarHTML();

  }

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
