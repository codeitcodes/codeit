
// create a repository object
function createRepoObj(fullName, selBranch, pushAccess,
                       branches, private, isFork, empty) {

  return {
    fullName,
    selBranch,
    pushAccess,
    branches,
    private,
    isFork,
    empty
  }

}


// modified repos

function addRepoToModRepos(repoObj) {
  
  modifiedRepos[repoObj.fullName] = repoObj;
  
  updateModReposLS();
  
}

function removeRepoFromModRepos(fullName) {
  
  delete modifiedRepos[fullName];
  
  updateModReposLS();
  
}

function updateModRepoSelectedBranch(fullName, selBranch) {
  
  modifiedRepos[fullName].selBranch = selBranch;
  
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



// get repo obj from git
// and save to modified repos

let repoPromise;

async function fetchRepoAndSaveToModRepos(treeLoc) {
  
  // get full name of repository
  const fullName = treeLoc[0] + '/' + treeLoc[1].split(':')[0];
  const selBranch = treeLoc[1].split(':')[1];
  
  
  // create temporary repo object
  const tempRepoObj = createRepoObj(fullName, selBranch, null,
                                    null, null, null, null);
  
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
    
    // create repo obj
    const repoObj = createRepoObj(fullName,
                                  
                                  (tempRepo.selBranch ?? repo.default_branch),
                                  
                                  (tempRepo.pushAccess ?? (repo.permissions.push ?? false)),
                                  
                                  (tempRepo.branches ?? null),
                                  
                                  repo.private, repo.fork,
                                  
                                  (tempRepo.empty ?? false));

    // add repo object
    // to modified repos
    addRepoToModRepos(repoObj);
    
  } else {
    
    // remove temp repo object
    // from modified repos
    removeRepoFromModRepos(fullName);
    
  }
  
}
