
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
            linkData.dir.join(',');


    if (linkData.file) {

      link += '&file=' +
              linkData.file.name + ',' +
              linkData.file.sha;


      if (linkData.openLive) {

        link += '&openLive=true';

      }

    }

  }

  return base + encodeURIComponent(link);

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

  }

  return linkData;

}


// 'Run ' + treeLoc[0] + '/' + treeLoc[1] + ' with Codeit: ' +
