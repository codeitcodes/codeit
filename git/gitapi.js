
// change pushing state

let pendingPromise;

function changePushingState(to, pendingPromise) {

  if (to === true) {

    pendingPromise = pendingPromise ?? null;

    window.addEventListener('beforeunload', beforeUnloadListener, {capture: true});

  } else {

    pendingPromise = null;

    window.removeEventListener('beforeunload', beforeUnloadListener, {capture: true});

  }

}

const beforeUnloadListener = (event) => {

  event.preventDefault();
  return event.returnValue = 'Are you sure you want to exit?';

};


async function isText(arrBuff) {
  
  //const response = await fetch('https://example.com/data');
  //const arrayBuffer = await resp.arrayBuffer();
  const decoder = new TextDecoder('utf-8');
  const decodedText = decoder.decode(arrBuff);
  
  return (decodedText.length > 0);
}


let git = {

  // get a blob
  'getBlob': async (treeLoc, sha) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');

    if (branch) branch = '?ref='+ branch;
    else branch = '';

    query += '/repos/'+ user +'/'+ repoName +'/git/blobs/'+ sha + branch;

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
  
  // get public file content
  'getPublicFile': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://raw.githubusercontent.com';
    const [user, repo, contents] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');
  
    query += '/' + user + '/' + repoName +
             '/' + branch +
             '/' + contents + '/' + fileName;
  
    // get the query
    const resp = await axios.get(query, '', true);
    
    return resp;
        
  },

  // get public file content as ReadableStream
  'getPublicFileAsStream': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://raw.githubusercontent.com';
    const [user, repo, contents] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');
  
    query += '/' + user + '/' + repoName +
             '/' + branch +
             '/' + contents + '/' + fileName;
  
    // get the query
    const resp = await fetch(query);
    
    // if received an error
    if (String(resp.status).startsWith('4')) {
      
      return {
        errorCode: resp.status
      };
      
    }
    
    
    // get data from response
    
    const reader = resp.body.getReader();
    let buffer = [];
    
    async function readChunk() {
      
      const chunk = await reader.read();
      
      // if finished reading, return
      if (chunk.done) return;
      
      // add new chunk to buffer
      buffer = new Uint8Array([...buffer, ...chunk.value]);
      
      // read next chunk
      return readChunk();
      
    }
    
    await readChunk();

    return buffer;
    
  },

  // get items in tree
  'getItems': async (treeLoc, page = 1) => {

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

      query += '/user/repos?visibility=all&sort=updated&per_page=100&page=' + page;

    }

    // get the query
    const resp = await axios.get(query, gitToken);

    return resp;

  },
  
  
   // get file from LFS as ReadableStream
  'getPublicLFSFileAsStream': async (treeLoc, fileName) => {
    //curl -u {username}:{personal access token'} https://api.github.com/repos/{organisation}/{repository}/contents/{file or folder path}
    //  "download_url": "https://media.githubusercontent.com/media/KostaMalsev/WebGPT/main/weights/gpt2/transformer.h.0.attn.bias_gpt.bin",

    // map tree location
    let query = 'https://media.githubusercontent.com/media';
    const [user, repo, contents] = treeLoc;

    // get repository branch
    let [repoName, branch] = repo.split(':');
  
    query += '/' + user + '/' + repoName +
             '/' + branch +
             '/' + contents + '/' + fileName;
  
    // get the query
    const resp = await fetch(query);
    
    
    
    // if received an error
    if (String(resp.status).startsWith('4')) {
      return {
        errorCode: resp.status
      };
      
    }
    
    const buffer = await resp.arrayBuffer();
    
    // get data from response
    if(isText(buffer)){
      return new Uint8Array(buffer);
    }else{
      return new Float32Array(buffer);
    }
    
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
  'createRepo': async (repoName, private) => {

    const query = 'https://api.github.com/user/repos';

    const repoData = {
      name: repoName,
      private: private,
      has_wiki: false,
      auto_init: false
    };

    // create post request with query
    const postRequest = axios.post(query, gitToken, repoData);

    // change pushing state
    changePushingState(true, postRequest);

    // await the request
    const resp = await postRequest;

    // change pushing state
    changePushingState(false);

    return resp.full_name;

  },

  // create a branch
  'createBranch': async (treeLoc, shaToBranchFrom, newBranchName) => {

    // map tree location
    let query = 'https://api.github.com';
    const [user, repo] = treeLoc;
    const [repoName] = repo.split(':');

    query += '/repos/'+ user +'/'+ repoName +'/git/refs';

    // create new branch
    const branchData = {
      ref: 'refs/heads/' + newBranchName,
      sha: shaToBranchFrom
    };

    // change pushing state
    changePushingState(true);

    // post the query
    const resp = await axios.post(query, branchData, gitToken);

    // change pushing state
    changePushingState(false);

    return resp;

  },

  // fork a repository
  'forkRepo': async (treeLoc) => {

    // map tree location
    const [user, repo] = treeLoc;
    const [repoName] = repo.split(':');

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repoName + '/forks';

    // change pushing state
    changePushingState(true);

    // post the query
    const resp = await axios.post(query, gitToken);

    // change pushing state
    changePushingState(false);

    return resp.full_name;

  },

  // invite a user to a repository
  'sendInviteToRepo': async (treeLoc, usernameToInvite) => {

    // map tree location
    const [user, repo] = treeLoc;
    const [repoName] = repo.split(':');

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repoName +
                  '/collaborators/' + usernameToInvite;

    // change pushing state
    changePushingState(true);

    // put the query
    const resp = await axios.put(query, gitToken);

    // change pushing state
    changePushingState(false);

    return resp.node_id;

  },

  // accept an invitation to a repository
  'acceptInviteToRepo': async (treeLoc) => {

    // map tree location
    const [user, repo] = treeLoc;
    const [repoName] = repo.split(':');

    let query = 'https://api.github.com/user' +
                '/repository_invitations';

    // get the query
    const invites = await axios.get(query, gitToken);

    // find repo invite
    const repoInvite = invites.filter(invite =>
                                      invite.repository.full_name ===
                                      (user + '/' + repoName)
                                     );

    // if invite exists
    if (repoInvite.length > 0) {

      // accept invite
      query += '/' + repoInvite[0].id;

      // patch the query
      const resp = await axios.patch(query, gitToken);

      return true;

    } else {

      return false;

    }

  },

  // delete a repository
  'deleteRepo': async (treeLoc) => {

    // map tree location
    const [user, repo] = treeLoc;
    const [repoName] = repo.split(':');

    const query = 'https://api.github.com/repos' +
                  '/' + user + '/' + repoName;

    // dispatch request with query
    await axios.delete(query, gitToken);

    return;

  }

};

