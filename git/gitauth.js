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
