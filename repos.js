
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

let modRepos = {

  add: (repoObj) => {

    modifiedRepos[repoObj.fullName] = repoObj;

    updateModReposLS();

  },

  remove: (fullName) => {
    
    delete modifiedRepos[fullName];
    
    updateModReposLS();
  
  },

  updateRepo: (fullName) => {
    
    return {
      
      selBranchTo: (branch) => {
        
        modifiedRepos[fullName].selBranch = branch;
        
        if (!isEmbed) {
          updateModReposLS();
        }
        
      },
      
      defaultBranchTo: (branch) => {
        
        modifiedRepos[fullName].defaultBranch = branch;
  
        updateModReposLS();
        
      },
      
      pushAccessTo: (pushAccess) => {
        
        modifiedRepos[fullName].pushAccess = pushAccess;
        
        updateModReposLS();
        
      },
      
      branchesTo: (branches) => {
        
        modifiedRepos[fullName].branches = branches;
  
        updateModReposLS();
        
      },
      
      privateStatusTo: (privateStatus) => {
      
        modifiedRepos[fullName].private = privateStatus;
        
        updateModReposLS();
        
      },
      
      emptyStatusTo: (emptyStatus) => {
    
        modifiedRepos[fullName].empty = emptyStatus;
        
        updateModReposLS();
        
      },
      
      dataExpirationTo: (time) => {
      
        modifiedRepos[fullName].repoDataExpiration = time;
        
        updateModReposLS();
        
      },
      
      branchExpirationTo: (time) => {
      
        modifiedRepos[fullName].branchExpiration = time;
        
        updateModReposLS();
        
      }
      
    };
    
  },
  
  // fetch repo obj from git
  // and save to modified repos
  fetchAndAddRepoObj: async (treeLoc) => {
    
    // get full name of repository
    const fullName = treeLoc[0] + '/' + treeLoc[1].split(':')[0];
    const selBranch = treeLoc[1].split(':')[1];
    
    
    // create temporary repo object
    const tempRepoObj = createRepoObj(fullName, selBranch, null,
                                      null, null, null, null, null, 0, 0);
    
    // add temp repo object
    // to modified repos
    modRepos.addRepo(tempRepoObj);
    
  
    // get repository from git
    
    // create promise
    const repoPromise = git.getRepo(treeLoc);
    
    // save promise in global object
    pendingPromise.repoObjFetch = repoPromise;
    
    // await promise
    const repo = await repoPromise;
    
    // remove promise from global object
    if (repoPromise === pendingPromise.repoObjFetch) {
      
      pendingPromise.repoObjFetch = null;
      
    }
    
    
    // if didn't encounter an error
    if (!repo.message) {
      
      // get repo data expiration time
      // (two months from now)
      
      let expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (2 * 4 * 7));
      
      const twoMonthsTime = expirationDate.getTime();
      
      
      const tempRepo = modifiedRepos[fullName];
      
      // create repo obj,
      // while preserving changed properties from the temporary repo
      const repoObj = createRepoObj(fullName,
                                    
                                    (tempRepo.selBranch ?? repo.default_branch), // check if changed selected branch while fetching repo obj
                                    
                                    repo.default_branch,
                                    
                                    (tempRepo.pushAccess ?? ((repo.permissions && repo.permissions.push) ?? false)), // check for push access in repo 
                                    
                                    (tempRepo.branches ?? null), // check if finished fetching repo branches
                                    
                                    repo.private, repo.fork,
                                    
                                    (tempRepo.empty ?? false), // check if created file in empty repo while fetching repo obj
                                    
                                    twoMonthsTime, // repo data expiration time
                                    
                                    tempRepo.branchExpiration); // check if finished fetching repo branches
  
      // add repo object
      // to modified repos
      modRepos.addRepo(repoObj);
      
    } else { // if encountered an error
      
      // remove temp repo object
      // from modified repos
      modRepos.removeRepo(fullName);
      
    }
    
  }
  
};

