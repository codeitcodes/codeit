
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
        
        const fileName = linkData.file.name;
        
        link += '/' + encodeURI(fileName);
        
        if (linkData.openLive === false &&
            (fileName.endsWith('.html') || fileName.endsWith('.svg') ||
             fileName.endsWith('.md'))) {
          
          link += '?l=f';
          
        }
        
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
    
    if (link.get('gitCode')) {
      
      linkData.gitCode = link.get('gitCode');
      
    }

  }

  return linkData;

}
