
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

  // get a blob
  'getBlob': async (treeLoc, sha) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;

    query += '/repos/'+ user +'/'+ repo +'/git/blobs/'+ sha;

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },

  // get a file
  'getFile': async (treeLoc, fileName) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');

    if (branch) branch = '?ref='+ branch;
    else branch = '';

    query += '/repos/' + user + '/' + repoName +
             '/contents/' + contents
             + '/' + fileName +
             branch;

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },

  // get items in tree
  'getItems': async (treeLoc) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // if navigating in repository
    if (repo != '') {

      // get repository branch
      let [repoName, branch] = repo.split(':');

      if (branch) branch = '?ref='+ branch;
      else branch = '';

      query += '/repos/' + user + '/' + repoName +
               '/contents' + contents +
               branch;

    } else { // else, show all repositories

      query += '/user/repos?visibility=all&sort=updated&per_page=100&page=1';

    }

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },
  
  'getRepoPushAccess': async (treeLoc, loggedUser) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;
    
    const [repoName] = repo.split(':');
    
    query += '/repos/' + user + '/' + repoName + '/collaborators/' + loggedUser + '/permission';
    
    // get the query
    const resp = await axios.get(query, gitToken);
    
    if (resp.message &&
        resp.message === 'Must have push access to view collaborator permission.') {
      
      return false;
      
    } else {
      
      return true;
      
    }
    
  },
  
  // list branches for repository
  'getBranches': async (treeLoc) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;

    const [repoName] = repo.split(':');

    query += '/repos/'+ user +'/'+ repoName +'/branches';

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },
  
  // get a repository
  'getRepo': async (treeLoc) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;
    
    // get repository branch
    const [repoName, branch] = repo.split(':');
    
    query += '/repos/' + user + '/' + repoName;
    
    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;
    
  },

  // push a file
  'push': async (commit) => {

    // map file location in tree
    const [user, repo, contents] = commit.file.dir.split(',');

    // get repository branch
    let [repoName, branch] = repo.split(':');

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repoName +
                  '/contents' + contents +
                  '/' + commit.file.name;

    let commitData;

    if (commit.file.sha) {

      commitData = {
        message: commit.message,
        content: commit.file.content,
        sha: commit.file.sha,
        branch: branch
      };

    } else {

      commitData = {
        message: commit.message,
        content: commit.file.content,
        branch: branch
      };

    }

    // change pushing state
    changePushingState(true);

    // put the query
    const resp = await axios.put(query, gitToken, commitData);

    // change pushing state
    changePushingState(false);

    return resp.content.sha;

  },

  // create a repository
  'createRepo': async (repoName) => {

    const query = 'https://api.github.com/user/repos';

    const repoData = {
      name: repoName,
      private: true,
      has_wiki: false,
      auto_init: true
    };

    // post the query
    const resp = await axios.post(query, gitToken, repoData);

    return resp.full_name;

  },
  
  // create a branch
  'createBranch': async (treeLoc, baseBranchName, newBranchName) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;
    
    const [repoName] = repo.split(':');
        
    query += '/repos/'+ user +'/'+ repoName +'/git/refs';

    // get the query
    const refs = await axios.get(query + '/heads', gitToken);

    // find base branch
    // to branch from
    let baseBranch = refs.filter(ref => ref.ref.endsWith(baseBranchName));
    
    // if base branch exists
    if (baseBranch) {
      
      // get SHA to branch from
      const shaToBranchFrom = baseBranch[0].object.sha;
      
      
      // create new branch
      const branchData = {
        ref: 'refs/heads/' + newBranchName,
        sha: shaToBranchFrom
      };
      
      // post the query
      const resp = await axios.post(query, branchData, gitToken);
      
      return resp;
      
    } else {
      
      return false;
      
    }

  },
  
  // fork a repository
  'forkRepo': async (treeLoc) => {

    // map tree location
    const [user, repo] = treeLoc;

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo + '/forks';

    // post the query
    const resp = await axios.post(query, gitToken);

    return resp.full_name;
    
    // change treeLoc to fork dir, change all the repo's modified files' dir to the fork's dir, and push modified files in dir. 

  },
  
  // invite a user to a repository
  'sendInviteToRepo': async (treeLoc, usernameToInvite) => {

    // map tree location
    const [user, repo] = treeLoc;

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repo +
                  '/collaborators/' + usernameToInvite;

    // put the query
    const resp = await axios.put(query, gitToken);

    return resp.node_id;

  },
  
  'acceptInviteToRepo': async (treeLoc) => {

    // map tree location
    const [user, repo] = treeLoc;
    
    let query = 'https://api.github.com/user' +
                '/repository_invitations';

    // get the query
    const invites = await axios.get(query, gitToken);

    // find repo invite
    let repoInvite = invites.filter(invite =>
                                      invite.repository.full_name ===
                                      (user + '/' + repo)
                                   );
    
    // if invite exists
    if (repoInvite) {
      
      // accept invite
      query += '/' + repoInvite.node_id;
      
      // patch the query
      const resp = await axios.patch(query, gitToken);
      
      return true;
      
    } else {
      
      return false;
      
    }

  }

};
