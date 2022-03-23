
/*
 * Codeit Link API
 * Creates and decodes Codeit links
 */


// create link
function createLink(linkData) {

  // save link
  let base = 'https://cde.run';
  if (isDev) base = 'https://dev.cde.run';
  
  let link = '';

  if (linkData.dir) {
    
    [user, repo, contents] = linkData.dir;
    
    if (user && repo) {
      
      link += '/' + encodeURIComponent(user) +
              '/' + encodeURIComponent(repo);
      
      if (contents) {
        
        link += '/' + encodeURIComponent(contents);
        
      }
      
      
      if (linkData.file) {
                
        link += '/' + encodeURIComponent(linkData.file.name);
  
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
