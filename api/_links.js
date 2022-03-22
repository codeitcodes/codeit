
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
