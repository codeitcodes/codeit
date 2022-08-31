
// decodes cde.run links

// eg.
// https://cde.run/mrdoob/three.js/examples/physics_ammo_break.html
// or
// https://cde.run/https://github.com/mrdoob/three.js/blob/dev/examples/physics_ammo_break.html

function decodeLink(url) {

  // save link data

  const urlQuery = new URL(url).searchParams;

  url = decodeURIComponent(url);
  

  const isEmbed = urlQuery.has('embed');
  
  const isLiveViewDisabled = (urlQuery.get('live') === 'false' || urlQuery.get('l') === 'f');

  // remove query from URL
  url = url.replace('?' + urlQuery.toString(), '');
  

  const isDev = url.startsWith('https://dev.cde.run/');

  if (!isDev) url = url.slice('https://cde.run/'.length);
  else url = url.slice('https://dev.cde.run/'.length);
  
  const isGithub = url.startsWith('https://github.com/');
  if (isGithub) url = url.slice('https://github.com/'.length);
  
  
  // if link is a Git URL
  if (isGithub && url.endsWith('.git')) {
    
    // slice .git ending
    url = url.slice(0, -('.git'.length));
    
  }
  
  
  let baseURL = 'https://codeit.codes';
  if (isDev) baseURL = 'https://dev.codeit.codes';


  let linkData = {};
  let link = url.split('/');


  // if link exists
  if (link.length > 1) {

    linkData.user = link[0];
    linkData.repo = link[1];

    linkData.contents = url.slice((linkData.user + '/' + linkData.repo).length);
    
    if (linkData.contents.endsWith('/')) {
      
      linkData.contents = linkData.contents.slice(0, -1);
      
    }
    
    
    // if link includes a Github URL
    if (isGithub) {
      
      linkData.contents = linkData.contents.slice('/blob'.length);
      
      // if link includes a branch
      if (link[3]) {
        
        linkData.repo += ':' + link[3];
        
        linkData.contents = linkData.contents.slice(('/' + link[3]).length);
        
      }
      
    }


    const lastEntry = link[link.length - 1];

    // if linking to file
    if (lastEntry !== linkData.repo
        && lastEntry.split('.').length > 1) {

      linkData.file = lastEntry;
      linkData.contents = linkData.contents.slice(0, (-lastEntry.length - 1));

      // if linked file can be viewed live
      // and live view not disabled
      if ((lastEntry.endsWith('.html') || lastEntry.endsWith('.svg') ||
          lastEntry.endsWith('.md'))
          && (isLiveViewDisabled === false)) {

        // show file in live view
        linkData.openLive = true;

      } else if (isEmbed) { // if link is embed
        
        // show file link
        linkData.redirect = baseURL + '/full?dir=' +
          linkData.user + ',' + linkData.repo +
          ',' + linkData.contents +
          '&file=' + linkData.file;
          
        linkData.redirectText = 'Open ' + linkData.user + '/' + linkData.repo + ' with Codeit';
      
      } // else, show the file's code

    } else if (isEmbed) { // if linking to directory
                          // and link is embed

      // show directory link
      linkData.redirect = baseURL + '/full?dir=' +
        linkData.user + ',' + linkData.repo +
        ',' + linkData.contents;

      linkData.redirectText = 'Open ' + linkData.user + '/' + linkData.repo + ' with Codeit';

    }

  } else {

    // show codeit link
    linkData.redirect = baseURL + '/full';
    linkData.redirectText = 'Open Codeit';

  }
  
  
  // build link from data
  
  let resp = baseURL;
  
  // if redirect exists
  if (linkData.redirect) {

    resp += '/redirect?to=' + linkData.redirect +
            '&text=' + linkData.redirectText;
    
  } else {

    resp += '/full?dir=' +
            linkData.user + ',' + linkData.repo +
            ',' + linkData.contents;
    
    // if file exists
    if (linkData.file) {
      
      resp += '&file=' + linkData.file;
      
      // if live view flag exists
      if (linkData.openLive) {
        
        resp += '&openLive=true';
        
      }
      
    }
    
  }
  
  if (isEmbed) resp += '&embed=true';
  
  
  return resp;

}

