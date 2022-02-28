
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
async function fetchRepoAndSaveToModRepos(treeLoc) {
  
  // get repository from git
  const repo = await git.getRepo(treeLoc);
  
  // if didn't encounter an error
  if (!repo.message) {
    
    // create repo obj
    const repoObj = createRepoObj(repo.full_name, repo.default_branch, (repo.permissions.push ?? false),
                                  null, repo.private, repo.fork, false);

    // add repo to modified repos
    addRepoToModRepos(repoObj);
    
  }
  
}
