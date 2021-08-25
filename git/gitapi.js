
let git = {
  
  // get file
  'getFile': async (treeLoc, fileName) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;
    
    query += '/repos/'+ user +'/'+ repo +'/contents/'+ contents +'/'+ selectedFileName;
    
    // get the query
    var resp = await axios.get(query, githubToken);
    
    return resp;
    
  },
  
  // get items
  // get items in tree
  'getItems': async (treeLoc) => {
    
    // map tree location
    let query = 'https://api.github.com';
    const [user, repo, contents] = treeLoc;

    // if navigating in repository
    if (repo != '') {

      query += '/repos/'+ user +'/'+ repo +'/contents'+ contents;

    } else { // else, show all repositories

      query += '/user/repos?visibility=all&sort=updated&page=1';

    }

    // get the query
    const resp = await axios.get(query, githubToken);
    
    return resp;
    
  },
  
  // push file
  // function pushes file to git
  'push': async (file, commit) => {

    let content;

    // if updating an existing file
    if (file.sha) {

      // if currently editing file
      if (file.selected) {

        // get current value of file
        content = btoa(cd.textContent);

      } else { // else, load from storage

        content = modifiedFiles[file.sha][0];

      }

    } else { // if creating a new file

      content = file.content;
      file.sha = '';

    }


    let query = 'https://api.github.com/repos/' +
                treeLoc[0] +
                '/' + treeLoc[1] +
                '/contents' + treeLoc[2] + '/' + file.name;

    let commitData = {
      message: commit.message,
      content: content,
      sha: file.sha
    };

    // commit file
    var resp = await axios.put(query, githubToken, commitData);


    // if updating an existing file
    if (file.sha) {

      // force-update cache
      var newFile = await axios.get(query, githubToken, file.sha);

      // delete file from modified files
      deleteModifiedFile(file.sha);

      file.element.classList.remove('modified');

    }

    return resp.content.sha;

  },

  // create repo (indev)
  // function creates a new repository
  createRepo: async (repo) => {

  }

};
