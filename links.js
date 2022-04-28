
/*
 * Codeit Link API
 * Creates and decodes Codeit links
 */


// create link
function createLink(linkData) {

  // save link
  let base = 'https://cde.run';
  if (window.location.hostname === 'dev.codeit.codes') base = 'https://dev.cde.run';
  
  let link = '';

  if (linkData.dir) {
    
    const [user, repo, contents] = linkData.dir;
    let [repoName, branch] = repo.split(':');
    
    if (user && repo) {
      
      const modRepo = modifiedRepos[user + '/' + repoName];
    
      // if selected branch is the default branch
      if (modRepo &&
          (modRepo.defaultBranch === branch)) {
        
        branch = '';
        
      } else {
        
        branch = ':' + branch;
        
      }
      
      
      link += '/' + encodeURI(user) +
              '/' + encodeURI(repoName + branch);
      
      if (contents) {
        
        link += encodeURI(contents);
        
      }
      
      
      if (linkData.file) {
        
        link += '/' + encodeURI(linkData.file.name);
  
      }
      
    }

  }

  return base + link;

}


// decode link
function decodeLink(url) {

  // save link data
  let link = new URL(url);
  let linkData = {};

  if (link.origin === window.location.origin) {

    link = link.searchParams;


    if (link.get('dir')) {

      const dir = link.get('dir').split(',');

      if (dir.length === 3) {

        linkData.dir = dir;


        if (link.get('file')) {

          const file = link.get('file');

          if (file) {

            linkData.file = file;


            if (link.get('openLive') === 'true') {

              linkData.openLive = true;

            }

          }

        }

      }

    }
    
    if (link.get('embed')) {
      
      linkData.embed = true;
      
    }
    
    if (link.get('gitToken')) {
      
      linkData.gitToken = link.get('gitToken');
      
    }
    
    
    
    // legacy link type
    if (link.get('q')) {
      
      linkData.dir = link.get('q').split('+')[0].split(',');
      linkData.dir[1] = linkData.dir[1] + ':main';
      
      const [name] = link.get('q').split('+')[1].split(',');
      
      linkData.file = name;
      
      linkData.openLive = true;
      
    }

  }

  return linkData;

}
