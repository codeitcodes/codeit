
// create a repository object
function createRepoObj(fullName, selBranch, defaultBranch,
                       pushAccess, branches, private,
                       isFork, empty,
                       repoDataExpiration, branchExpiration) {

  return {
    fullName,
    selBranch,
    defaultBranch,
    pushAccess,
    branches,
    private,
    isFork,
    empty,
    repoDataExpiration,
    branchExpiration,
  }

}


// modified repos

function addRepoToModRepos(repoObj) {
  
  modifiedRepos[repoObj.fullName] = repoObj;
  
  updateModReposLS();
  
}

function deleteModRepo(fullName) {
  
  delete modifiedRepos[fullName];
  
  updateModReposLS();
  
}

function updateModRepoSelectedBranch(fullName, selBranch) {
  
  modifiedRepos[fullName].selBranch = selBranch;
  
  if (!isEmbed) {
    updateModReposLS();
  }
  
}

function updateModRepoDefaultBranch(fullName, defaultBranch) {
  
  modifiedRepos[fullName].defaultBranch = defaultBranch;
  
  updateModReposLS();
  
}

function updateModRepoPushAccess(fullName, pushAccess) {
  
  modifiedRepos[fullName].pushAccess = pushAccess;
  
  updateModReposLS();
  
}

function updateModRepoBranches(fullName, branches) {

  modifiedRepos[fullName].branches = branches;
  
  updateModReposLS();
  
}

function updateModRepoPrivateStatus(fullName, private) {

  modifiedRepos[fullName].private = private;
  
  updateModReposLS();
  
}

function updateModRepoEmptyStatus(fullName, empty) {

  modifiedRepos[fullName].empty = empty;
  
  updateModReposLS();
  
}

function updateModRepoDataExpiration(fullName, time) {

  modifiedRepos[fullName].repoDataExpiration = time;
  
  updateModReposLS();
  
}

function updateModRepoBranchExpiration(fullName, time) {

  modifiedRepos[fullName].branchExpiration = time;
  
  updateModReposLS();
  
}



// get repo obj from git
// and save to modified repos

let repoPromise;

async function fetchRepoAndSaveToModRepos(treeLoc) {
  
  // get full name of repository
  const fullName = treeLoc[0] + '/' + treeLoc[1].split(':')[0];
  const selBranch = treeLoc[1].split(':')[1];
  
  
  // create temporary repo object
  const tempRepoObj = createRepoObj(fullName, selBranch, null,
                                    null, null, null, null, null, 0, 0);
  
  // add temp repo object
  // to modified repos
  addRepoToModRepos(tempRepoObj);
  

  // get repository from git
  
  // create promise
  repoPromise = git.getRepo(treeLoc);
  
  // await promise
  const repo = await repoPromise;
  
  // remove promise
  repoPromise = null;
  
  
  // if didn't encounter an error
  if (!repo.message) {
    
    // check temp repo changed
    const tempRepo = modifiedRepos[fullName];
    
    
    // get repo data expiration time
    // (two days from now)
    
    let expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 2);
    
    const twoDaysFromNow = expirationDate.getTime();
    
    
    // create repo obj
    const repoObj = createRepoObj(fullName,
                                  
                                  (tempRepo.selBranch ?? repo.default_branch),
                                  
                                  repo.default_branch,
                                  
                                  (tempRepo.pushAccess ?? ((repo.permissions && repo.permissions.push) ?? false)),
                                  
                                  (tempRepo.branches ?? null),
                                  
                                  repo.private, repo.fork,
                                  
                                  (tempRepo.empty ?? false),
                                  
                                  twoDaysFromNow,
                                  
                                  tempRepo.branchExpiration);

    // add repo object
    // to modified repos
    addRepoToModRepos(repoObj);
    
  } else {
    
    // remove temp repo object
    // from modified repos
    deleteModRepo(fullName);
    
  }
  
}
