/* 
  module (dependency) importer
*/


const moduleImporter = {};

(function() {

  // function fetches file content from full path
  async function getScriptFile(scriptPath) {

    // map current tree location
    const [user, repo, contents] = selectedFile.dir.split(',');

    // set the full script path:
    let fullScriptPath = scriptPath;

    // get list of the files in current directory
    let scriptPathArr = scriptPath.split('/').slice();
    scriptPathArr.pop();

    const resp = await git.getItems([user, repo, scriptPathArr.join('/').replaceAll(',', '').replace('/' + repo, '')]);

    // find file sha
    let path = scriptPath.split('/');
    let fileName = path[path.length - 1];

    const fileObj = resp.filter(file => file.name == fileName);

    if (fileObj.length > 0) {

      let fileSha = fileObj[0].sha;

      // fetch file content
      const respF = await git.getBlob([user, repo], fileSha);

      return respF.content;

    } else {

      console.log('[module-importer] Can\'t find script', fileName);

      return '';

    }

  }


  // function caclulates the absolute path from the relative,
  // given the current path of the file

  function absolutePath(fileOriginPath, relativePath) {

    // count level up directory in relative dir: ../../
    let numLevelUp = (relativePath.match(/(\.\.\/)/g) || []).length;

    let tmp = numLevelUp;

    // count total number of levels of relative path
    let totNumLevels = (relativePath.match(/(\/)/g) || []).length;

    // get the down path (what path to go, after reaching the up directory)
    let endPath = relativePath.replaceAll("../".repeat(numLevelUp), '');
    endPath = endPath.replaceAll('./', '');

    // get the full path up (from root - is at '0')
    let origingNumLevels = fileOriginPath.split('/').length;
    let pathUp = (fileOriginPath.split('/').slice(0, origingNumLevels - numLevelUp).join());
    pathUp = pathUp.replaceAll(',', '/');

    let fullPath = pathUp + '/' + endPath;

    return fullPath;

  }


  // function changes import statements from path to src content
  moduleImporter.getImports = async (scriptContent, fileOriginPath) => {

    // import multiple params
    let regImportParams = /(([\t\n\r ]*import \{[\t\n, a-zA-Z0-9_-]*\} from \'[\.\/a-zA-Z0-9_\-]*\.js\'\;))/g;

    // import one param
    let regImportPar = /(([\t\r\n ]*import [A-Za-z0-9_-]* from \'[\.\/a-zA-Z0-9_-]*\.js\'\;))/g;

    /*import * from myFile.js */
    let regImportAll = /(([\t\n\r ]*import \* as [\t\n, a-zA-Z0-9_-]* from \'[\.\/a-zA-Z0-9_-]*\.js\'\;))/g;


    // get the list of import scripts from given src
    let impFileList = scriptContent.match(regImportParams);
    if (impFileList) impFileList = impFileList.join().match(/([../a-zA-Z0-9_\-]*\.js)/g);

    // get list with the second import format
    let impFileListF2 = scriptContent.match(regImportAll);
    if (impFileListF2) impFileListF2 = impFileListF2.join().match(/([../a-zA-Z0-9_\-]*\.js)/g);

    let impFileListF3 = scriptContent.match(regImportPar);
    if (impFileListF3) impFileListF3 = impFileListF3.join().match(/([../a-zA-Z0-9_\-]*\.js)/g);

    // if file contains no imports
    if (!impFileList && !impFileListF2 && !impFileListF3) {
      // return unmodifed script file
      return scriptContent;
    }

    // join the two results of two import format
    if (impFileList && impFileListF2) {
      impFileList = impFileList.concat(impFileListF2);
    }


    if (!impFileList) {
      impFileList = impFileListF2;
    }

    if (!impFileList && impFileListF3) {
      impFileList = impFileListF3;
    } else {
      // add the third import option if available
      impFileList = impFileListF3 ? impFileList.concat(impFileListF3) : impFileList;
    }



    let fullPathList = [];
    let impSrcListContent = [];

    // for each import statetment
    await Promise.all(impFileList.map(async (relativeFilePath) => {

      // get the absolute path from the relative path
      let absPath = absolutePath(fileOriginPath, relativeFilePath);

      // fetch the imported script
      let importedScript = await getScriptFile(absPath);

      let relPath = absPath.split('/');

      // if the relative path includes a file name,
      // remove file name from path
      if (relPath[relPath.length - 1].includes('.')) {

        let res = relPath.slice();
        res.pop();
        relPath = res;
      }

      // combine array to path
      relPath = relPath.join('/');

      // get all imports in script
      importedScript = await getImports2(decodeUnicode(importedScript), relPath);

      importedScript = 'data:text/javascript;base64,' +
        encodeURIComponent(encodeUnicode(importedScript));

      if (importedScript.includes('\'')) {

        console.log('[module-importer] Invalid encoding', absPath);

      }

      // replace the relative path with actual script content
      scriptContent = scriptContent.replaceAll(relativeFilePath, importedScript);

    }));

    return scriptContent;

  }

})();
