
// change pushing state
function changePushingState(to) {
  
  if (to === true) {
    
    window.addEventListener('beforeunload', beforeUnloadListener, {capture: true});
    
  } else {
    
    window.removeEventListener('beforeunload', beforeUnloadListener, {capture: true});
    
  }
  
}

const beforeUnloadListener = (event) => {
  
  event.preventDefault();
  return event.returnValue = 'Are you sure you want to exit?';
  
};


let git = {
  
  // get file
  'getFile': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;
    
    query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ fileName;
    
    // get the query
    const resp = await axios.get(query, githubToken);
    
    return resp;
    
  },
  
  // get items in tree
  'getItems': async (treeLoc) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // if navigating in repository
    if (repo != '') {

      query += '/repos/'+ user +'/'+ repo +'/contents'+ contents;

    } else { // else, show all repositories

      query += '/user/repos?visibility=all&sort=updated&per_page=100&page=1';

    }

    // get the query
    const resp = await axios.get(query, githubToken);
    
    return resp;
    
  },
  
  // push file
  'push': async (commit) => {
    
    // map file location in tree
    const [user, repo, contents] = commit.file.dir.split(',');
    
    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo +
                  '/contents' + contents +
                  '/' + commit.file.name;

    let commitData;
    
    if (commit.file.sha) {
      
      commitData = {
        message: commit.message,
        content: commit.file.content,
        sha: commit.file.sha
      };
      
    } else {
      
      commitData = {
        message: commit.message,
        content: commit.file.content
      };
      
    }
    
    // change pushing state
    changePushingState(true);
    
    // put the query
    const resp = await axios.put(query, githubToken, commitData);
    
    // change pushing state
    changePushingState(false);
    
    return resp.content.sha;

  },

  // create repository
  createRepo: async (repoName) => {
    
    const query = 'https://api.github.com/user/repos';
    
    const repoData = {
      name: repoName,
      private: true,
      has_wiki: false,
      auto_init: true
    };
    
    // post the query
    const resp = await axios.post(query, githubToken, repoData);
    
    return resp.full_name;
    
  },
  
  // fork repository
  createFork: async (treeLoc) => {
    
    // map tree location
    const [user, repo] = treeLoc;
    
    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo + '/forks';
    
    // post the query
    const resp = await axios.post(query, githubToken);
    
    return resp.full_name;
    
  },
  
  // invite user to repository
  inviteUser: async (treeLoc, username) => {
    
    // map tree location
    const [user, repo] = treeLoc;
    
    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo +
                  '/collaborators/' + username;
    
    // put the query
    const resp = await axios.put(query, githubToken);
    
    return resp.node_id;
    
  },
  
  // invite user to repository
  getInvites: async (treeLoc, username) => {
    
    // map tree location
    const [user, repo] = treeLoc;
    
    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo +
                  '/collaborators/' + username;
    
    // put the query
    const resp = await axios.put(query, githubToken);
    
    return resp.node_id;
    
  }

};
