
/*
 * Codeit Link API
 * Creates and decodes Codeit links
 */


// create link
function createLink(linkData) {

  // save link
  const base = window.location.origin + '/full';
  let link = '';

  if (linkData.dir) {

    link += '?dir=' +
            encodeURI(
              linkData.dir.join(',')
            );


    if (linkData.file) {

      link += '&file=' +
              encodeURI(
                linkData.file.name + ',' +
                linkData.file.sha
              );


      if (linkData.openLive) {

        link += '&openLive=true';

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

          const [name, sha] = link.get('file').split(',');

          if (name && sha) {

            linkData.file = {name, sha};


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
      
      const [name, sha] = link.get('q').split('+')[1].split(',');
      
      linkData.file = {name, sha};
      
      linkData.openLive = true;
      
    }

  }

  return linkData;

}
