/*
  github
*/

// show bookmark on hover
sidebarToggle.addEventListener('mouseover', () => {

  if (!body.classList.contains('expanded')) {

    sidebarToggle.classList.add('visible');

  }

})

// toggle sidebar on click of bookmark
sidebarToggle.addEventListener('click', () => {

  toggleSidebar(!body.classList.contains('expanded'));

  saveSidebarStateLS();

})


// render sidebar
// call this function when logged in to git
// to render sidebar
async function renderSidebarHTML() {

  // if not already loading, start loading
  if (loader.style.opacity != '1') {
    startLoading();
  }

  // hide header screens
  titleScreen.classList.add('visible');
  optionsScreen.classList.remove('visible');
  optionsButton.classList.remove('open');
  header.classList.remove('searching');


  // map tree location
  const [user, repo, contents] = treeLoc;
  const [repoName, branch] = repo.split(':');


  // if not logged into git
  // and navigated to Repositories page
  if (gitToken == '' && repo == '') {

    // stop loading
    stopLoading();

    // show login screen
    sidebar.classList.add('intro');

    return;

  }


  let resp;

  // get items in current tree from git
  try {

    resp = await git.getItems(treeLoc);

  } catch(e) {

    // if failed to get items,
    // show login screen

    // stop loading
    stopLoading();
    
    alert('Whoops, your Github login expired. Log in again?');

    sidebar.classList.add('intro');

    return;

  }

  if (resp.message == 'Not Found') {

    // if couldn't find repository, show not found screen

    // stop loading
    stopLoading();
    
    alert('Hmm... we can\'t find that repo.\nIf it\'s private, try double checking you\'re on the account with access.');
    
    treeLoc[1] = '';
    treeLoc[2] = '';
    saveTreeLocLS(treeLoc);

    renderSidebarHTML();

    return;

  }
  
  if (resp.message && resp.message.startsWith('No commit found')) {
    
    // if couldn't find branch, show not found screen
    
    const defaultBranch = (await git.getRepo(treeLoc)).default_branch;
    
    // stop loading
    stopLoading();
    
    alert('Hmm... we can\'t find that branch.');
    
    treeLoc[1] = repo.split(':')[0] + ':' + defaultBranch;
    saveTreeLocLS(treeLoc);

    renderSidebarHTML();

    return;
    
  }

  if (resp.message == 'Bad credentials') {

    // if failed to get items,
    // show login screen

    // stop loading
    stopLoading();
    
    alert('Whoops, your Github login expired. Log in again?');

    sidebar.classList.add('intro');

    return;

  }


  // legacy modified file dir
  
  let modFilesChanged = false;
  
  Object.values(modifiedFiles).forEach(modFile => {
    
    if (modFile.dir) {
      
      // map modified file location
      let [fileUser, fileRepo, fileDir] = modFile.dir.split(',');

      // if modified file dosen't have a branch
      // and is in current repo
      if (!fileRepo.includes(':')
          && fileUser === user
          && fileRepo === repoName) {

        // append default branch to file
        fileRepo = fileRepo + ':' + branch;
        modFile.dir = [fileUser, fileRepo, fileDir].join();

        modFilesChanged = true;

      }
      
    }

  });
  
  if (modFilesChanged) updateModFilesLS();
  
  
  // create temporary modified files array
  let modifiedFilesTemp = Object.values(JSON.parse(JSON.stringify(modifiedFiles)));

  // get all modified files in directory
  modifiedFilesTemp = modifiedFilesTemp.filter(modFile => modFile.dir == treeLoc.join());


  // save rendered HTML
  let out = '';

  // if response
  if (resp) {

    // show title

    let titleAnimation;

    if (contents != '') {

      // if repo is owned by logged user
      if (user === loggedUser) {

        // show repo name and path
        sidebarLogo.innerText = repoName + contents;

      } else {

        // show username, repo name and path
        sidebarLogo.innerText = user + '/' + repoName + contents;

      }

      // animate title
      if (sidebarLogo.scrollLeft > 0) titleAnimation = 'smooth';

    } else if (repo != '') {

      // if repo is owned by logged user
      if (user === loggedUser) {

        // show repo name
        sidebarLogo.innerText = repoName;

      } else {

        // show username and repo name
        sidebarLogo.innerText = user + '/' + repoName;

      }

    } else {

      // show title
      sidebarLogo.innerText = 'Repositories';

    }

    // scroll to end of title

    if (!titleAnimation) {

      sidebarLogo.classList.add('notransition');

      window.setTimeout(() => {
        sidebarLogo.classList.remove('notransition');
      }, 180);

    }

    sidebarTitle.children[1].scrollTo({
      left: sidebarLogo.scrollWidth - sidebarLogo.offsetLeft,
      behavior: titleAnimation
    });


    // if navigating in repository
    if (repo != '') {
      
      // show branch button
      sidebarBranch.classList.add('visible');
      
      // render branch menu
      window.setTimeout(renderBranchMenuHTML, 180);

      // change header options
      optionsScreen.classList.remove('out-of-repo');


      // render files
      resp.forEach(item => {

        // if item is a file
        if (item.type == 'file') {

          let file = getLatestVersion(item);

          // search for matching modified files
          for (let i = 0; i < modifiedFilesTemp.length; i++) {

            let modFile = modifiedFilesTemp[i];

            // if modified file has matching SHA or name
            if (modFile.sha === file.sha || modFile.name === file.name) {

              // remove modified file from temporary array
              modifiedFilesTemp.splice(i, 1);

              // reset index
              i--;

            }

          }


          // add modified flag to file
          let modified = '';
          if (modifiedFiles[file.sha] &&
              !modifiedFiles[file.sha].eclipsed) modified = ' modified';
          
          // add icon to file
          const fileType = getFileType(file.name);
          let fileIconHTML = fileIcon;
          
          if (fileType === 'image') fileIconHTML = imageIcon;
          if (fileType === 'video') fileIconHTML = videoIcon;
          if (fileType === 'audio') fileIconHTML = audioIcon;
          
          out += `
          <div class="item file`+ modified +`" sha="`+ file.sha +`">
            <div class="label">
              `+ fileIconHTML +`
              <a class="name">`+ file.name +`</a>
            </div>
            <div class="push-wrapper">
              `+ pushIcon +`
            </div>
          </div>
          `;

        } else { // if item is a folder

          out += `
          <div class="item folder">
            <div class="label">
              `+ folderIcon +`
              <a class="name">`+ item.name +`</a>
            </div>
            `+ arrowIcon +`
          </div>
          `;

        }

      });


      // render modified files from temporary array

      let modFileNames = {};

      modifiedFilesTemp.forEach(file => {

        // if file isn't already in HTML
        if (!modFileNames[file.name]) {

          // add file to HTML

          modFileNames[file.name] = true;

          // get the file's latest version
          file = getLatestVersion(file);

          // add modified flag to file
          let modified = '';
          if (!file.eclipsed) modified = ' modified';

          // add icon to file
          const fileType = getFileType(file.name);
          let fileIconHTML = fileIcon;
          
          if (fileType === 'image') fileIconHTML = imageIcon;
          if (fileType === 'video') fileIconHTML = videoIcon;
          if (fileType === 'audio') fileIconHTML = audioIcon;
          
          out += `
          <div class="item file`+ modified +`" sha="`+ file.sha +`">
            <div class="label">
              `+ fileIconHTML +`
              <a class="name">`+ file.name +`</a>
            </div>
            <div class="push-wrapper">
              `+ pushIcon +`
            </div>
          </div>
          `;

        }

      });

    } else { // else, show all repositories

      // hide branch button
      sidebarBranch.classList.remove('visible');
      
      // change header options
      optionsScreen.classList.add('out-of-repo');

      
      // render repositories
      resp.forEach(item => {

        let fullName;

        // if repo is owned by logged user
        if (item.full_name.split('/')[0] === loggedUser) {

          // show repo name
          fullName = item.name;

        } else {

          // show username and repo name
          fullName = item.full_name;

        }


        /*
        // create repo obj
        const repoObj = {
          name: item.fullname,
          defaultBranch: item.default_branch,
          pushAccess: ((item.permissions.admin || item.permissions.push) ? true : false),
        };
        */


        out += `
        <div class="item repo" fullname="`+ item.full_name +`" defaultbranch="`+ item.default_branch +`">
          <div class="label">
            `+ repoIcon +`
            <a class="name">`+ fullName +`</a>
          </div>
          `+ arrowIcon +`
        </div>
        `;

      });

    }

  }

  // add rendered HTML to DOM
  fileWrapper.innerHTML = out;
  sidebar.scrollTo(0, 0);

  // stop loading
  stopLoading();

  // add item event listeners
  addHTMLItemListeners();

  // if selected file is in current directory
  if (selectedFile.dir == treeLoc.join()) {

    let selectedEl = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

    if (selectedEl) {

      // select file
      selectedEl.classList.add('selected');
      selectedEl.scrollIntoViewIfNeeded();

    }

  }
  
  // if selected file exists
  if (selectedFile.sha !== '') {
    
    // protect unsaved code
    protectUnsavedCode();
    
  }

}


// adds item event listeners
function addHTMLItemListeners() {

  let items = fileWrapper.querySelectorAll('.item');

  // run on all items
  items.forEach(item => {

    // navigate on click
    item.addEventListener('click', (e) => {

      // if item is a repository
      if (item.classList.contains('repo')) {

        // change location
        let itemLoc = getAttr(item, 'fullname').split('/');
        let defaultBranch = getAttr(item, 'defaultbranch');
        
        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1] +':'+ defaultBranch;
        saveTreeLocLS(treeLoc);

        // render sidebar
        renderSidebarHTML();

      } else if (item.classList.contains('folder')) {

        // if item is a folder

        // change location
        treeLoc[2] += '/' + item.innerText.replaceAll('\n', '');
        saveTreeLocLS(treeLoc);

        // render sidebar
        renderSidebarHTML();

      } else { // if item is a file
        
        clickedOnFileHTML(item, e);

      }

    })
    
    // if item is a file
    if (item.classList.contains('file')
        && item.querySelector('.push-wrapper')) {

      item.querySelector('.push-wrapper')
        .addEventListener('contextmenu', () => {

        let commitMessage;

        // get selected branch
        let selBranch = treeLoc[1].split(':')[1];

        // open push screen
        commitMessage = prompt('Push \''+ item.innerText + (selBranch ? '\' to branch \'' + selBranch + '\'?' : '\'?'),
                               'Type push description...');

        // if canceled push, return
        if (!commitMessage) return;

        // if not specified message
        if (commitMessage === 'Type push description...') {

          // show default message
          commitMessage = 'Update ' + item.innerText;

        }


        // play push animation
        playPushAnimation(item.querySelector('.push-wrapper'));

        // push file
        pushFileFromHTML(item, commitMessage);

      })
      
    }

  })

}


// when clicked on file in HTML
function clickedOnFileHTML(fileEl, event) {
  
  // if not clicked on push button
  let pushWrapper = fileEl.querySelector('.push-wrapper');
  let clickedOnPush = (event.target == pushWrapper);

  if (!clickedOnPush) {

    // if file not already selected
    if (!fileEl.classList.contains('selected')) {

      // load file
      loadFileInHTML(fileEl, getAttr(fileEl, 'sha'));

    } else if (isMobile) { // if on mobile device

      // update bottom float
      updateFloat();

    }

  } else {
    
    let commitMessage;
    
    // if ctrl/meta/shift-clicked on push button
    if (!isMobile && (isKeyEventMeta(event) || event.shiftKey)) {
      
      // get selected branch
      let selBranch = treeLoc[1].split(':')[1];

      // open push screen
      commitMessage = prompt('Push \''+ fileEl.innerText + (selBranch ? '\' to branch \'' + selBranch + '\'?' : '\'?'),
                             'Type push description...');

      // if canceled push, return
      if (!commitMessage) return;

      // if not specified message
      if (commitMessage === 'Type push description...') {

        // show default message
        commitMessage = 'Update ' + fileEl.innerText;

      }
      
    } else {
      
      commitMessage = 'Update ' + fileEl.innerText;
      
    }
      
    
    // play push animation
    playPushAnimation(fileEl.querySelector('.push-wrapper'));

    // push file
    pushFileFromHTML(fileEl, commitMessage);

  }
  
}


const fileSizeText = '<this file is too big to view>';

// push file to Git from HTML element
async function pushFileFromHTML(fileEl, commitMessage) {

  // disable pushing file in HTML
  fileEl.classList.remove('modified');
  bottomFloat.classList.remove('modified');

  // get file selected status
  const fileSelected = fileEl.classList.contains('selected');

  // create commit
  const commitFile = fileSelected ? selectedFile : modifiedFiles[getAttr(fileEl, 'sha')];

  let commit = {
    message: commitMessage,
    file: commitFile
  };

  // push file asynchronously
  const newSha = await git.push(commit);

  // Git file is eclipsed (not updated) in browser private cache,
  // so store the updated file in modifiedFiles object for 1 minute after commit
  onFileEclipsedInCache(commit.file.sha, newSha);

}


// load file in sidebar and codeit
async function loadFileInHTML(fileEl, fileSha) {

  // clear existing selections in HTML
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }

  // select the new file in HTML
  fileEl.classList.add('selected');
  fileEl.scrollIntoViewIfNeeded();

  // show all files in HTML
  let files = fileWrapper.querySelectorAll('.item[style="display: none;"]');
  files.forEach(file => { file.style.display = '' });

  header.classList.remove('searching');


  // if previous file selection exists
  if (selectedFile.sha) {

    // get previous selection in modifiedFiles array
    let selectedItem = modifiedFiles[selectedFile.sha];

    // if previous selection was modified
    if (selectedItem) {

      // save previous selection in localStorage
      updateModFileContent(selectedFile.sha, selectedFile.content);
      updateModFileCaretPos(selectedFile.sha, selectedFile.caretPos);
      updateModFileScrollPos(selectedFile.sha, selectedFile.scrollPos);

    }

  }


  // if file is not modified; fetch from Git
  if (!modifiedFiles[fileSha]) {
    
    // if not already loading, start loading
    if (loader.style.opacity != '1') {
      startLoading();
    }
    
    const fileName = fileEl.querySelector('.name').textContent.replaceAll('\n','');

    // get file from git
    let resp = await git.getFile(treeLoc, fileName);
    
    
    // if file is over 1MB
    if (resp.errors && resp.errors.length > 0 && resp.errors[0].code === 'too_large') {
      
      // show file size prompt
      
      liveView.classList.add('file-open', 'notransition');
      liveView.innerHTML = '<div class="prompt">' +
                           '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="96" viewBox="0 0 72 96" width="72" class="file-svg"><clipPath id="a"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="b"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="c"><path d="m12 36h48v48h-48z"></path></clipPath><g clip-path="url(#a)"><g clip-path="url(#b)"><path d="m72 29.3v60.3c0 2.24 0 3.36-.44 4.22-.38.74-1 1.36-1.74 1.74-.86.44-1.98.44-4.22.44h-59.20002c-2.24 0-3.36 0-4.22-.44-.74-.38-1.359997-1-1.739996-1.74-.44000025-.86-.44000006-1.98-.43999967-4.22l.00001455-83.2c.00000039-2.24.00000059-3.36.44000112-4.22.38-.74 1-1.36 1.74-1.74.86-.43999947 1.98-.43999927 4.22-.43999888l36.3.00000635c1.96.00000034 2.94.00000051 3.86.22000053.5.12.98.28 1.44.5v16.879992c0 2.24 0 3.36.44 4.22.38.74 1 1.36 1.74 1.74.86.44 1.98.44 4.22.44h16.88c.22.46.38.94.5 1.44.22.92.22 1.9.22 3.86z" fill="hsl(223deg 92% 87%)"></path><path d="m68.26 20.26c1.38 1.38 2.06 2.06 2.56 2.88.18.28.32.56.46.86h-16.88c-2.24 0-3.36 0-4.22-.44-.74-.38-1.36-1-1.74-1.74-.44-.86-.44-1.98-.44-4.22v-16.880029c.3.14.58.28.86.459999.82.5 1.5 1.18 2.88 2.56z" fill="hsl(223deg 85% 58%)" style=""></path></g><g clip-path="url(#c)" fill="hsl(223deg 85% 58%)"><path d="m24 56c4.4183 0 8-3.5817 8-8s-3.5817-8-8-8-8 3.5817-8 8 3.5817 8 8 8z"></path><path d="m44 55.998-10.352 15.528-5.648-7.528-12 16h40z"></path></g></g></svg>' +
                           '<div class="title">This file is too big to view</div><div class="desc">You can download it below :D</div></div>';

      resp = { content: fileSizeText };

      // if on mobile device
      if (isMobile) {

        onNextFrame(() => {

          liveView.classList.remove('notransition');

          // update bottom float
          bottomFloat.classList.add('file-open');
          updateFloat();

        })

      } else {

        liveToggle.classList.add('file-open');
        updateScrollbarArrow();

        onNextFrame(() => {
          liveView.classList.remove('notransition');
        })

      }
      
    }
    

    // change selected file
    changeSelectedFile(treeLoc.join(), fileSha, fileName, resp.content, getFileLang(fileName),
                       [0, 0], [0, 0], false);

    // stop loading
    stopLoading();

  } else { // else, load file from modifiedFiles object

    const modFile = modifiedFiles[fileSha];

    changeSelectedFile(modFile.dir, modFile.sha, modFile.name, modFile.content, modFile.lang,
                       modFile.caretPos, modFile.scrollPos, false);

  }

  // show file content in codeit
  try {
    
    const fileContent = decodeUnicode(selectedFile.content);
    
    // compare current code with new code
    if (hashCode(cd.textContent) !== hashCode(fileContent)) {
      
      // if the code is different, swap it
      cd.textContent = fileContent;
      
    }
    
    // change codeit lang
    cd.lang = selectedFile.lang;
    
    // update bottom float
    if (isMobile) updateFloat();
    
  } catch(e) { // if file is binary
    
    if (hashCode(selectedFile.content) !== hashCode(fileSizeText)) {
      
      cd.textContent = '';

      // load binary file
      loadBinaryFileHTML(selectedFile, true);

      return;
      
    }
    
  }
  
  // change tab character
  if (cd.textContent.includes('\t')) {
    
    cd.options.tab = '\t';
    
  } else {
    
    cd.options.tab = '  ';
    
  }

  // set caret pos in codeit
  if (!isMobile) cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

  // set scroll pos in codeit
  cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

  // clear codeit history
  cd.history = [];

  // update line numbers
  updateLineNumbersHTML();
  
  
  if (hashCode(selectedFile.content) !== hashCode(fileSizeText)) {

    liveView.classList.add('notransition');
    liveView.classList.remove('file-open');

    onNextFrame(() => {
      liveView.classList.remove('notransition');
    });

    // if on mobile device
    if (isMobile) {

      // update bottom float
      bottomFloat.classList.remove('file-open');

    } else {

      liveToggle.classList.remove('file-open');

    }
    
  }

}


// load binary file in sidebar and live view
function loadBinaryFileHTML(file, toggled) {
  
  // if on mobile device
  if (isMobile) {
    
    // update bottom float
    bottomFloat.classList.add('file-open');
    
  }
  
  // if sidebar is open and on mobile device
  if (toggled && isMobile) {
    
    liveView.classList.add('notransition', 'file-open');
    
    onNextFrame(() => {
      
      liveView.classList.remove('notransition');
      
      updateFloat();
      
    })
    
  } else {
    
    liveView.classList.add('notransition');
    liveView.classList.add('file-open');
    
    if (!isMobile) {
      
      liveToggle.classList.add('file-open');
      updateScrollbarArrow();
      
    }
    
    onNextFrame(() => {
      liveView.classList.remove('notransition');
    });
    
  }
  

  const fileType = getFileType(file.name);

  if (hashCode(file.content) !== hashCode(fileSizeText)) {
    
    if (fileType === 'image') {

      // get MIME type (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
      let mimeType = 'image/' + file.name.split('.')[1];

      if (mimeType.endsWith('svg')) mimeType = 'image/svg+xml';

      liveView.innerHTML = '<img src="data:' + mimeType + ';base64,' + file.content + '" draggable="false"></img>';

    } else {

      // show file supported prompt
      liveView.innerHTML = '<div class="prompt">' +
                           '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="96" viewBox="0 0 72 96" width="72" class="file-svg"><clipPath id="a"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="b"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="c"><path d="m12 36h48v48h-48z"></path></clipPath><g clip-path="url(#a)"><g clip-path="url(#b)"><path d="m72 29.3v60.3c0 2.24 0 3.36-.44 4.22-.38.74-1 1.36-1.74 1.74-.86.44-1.98.44-4.22.44h-59.20002c-2.24 0-3.36 0-4.22-.44-.74-.38-1.359997-1-1.739996-1.74-.44000025-.86-.44000006-1.98-.43999967-4.22l.00001455-83.2c.00000039-2.24.00000059-3.36.44000112-4.22.38-.74 1-1.36 1.74-1.74.86-.43999947 1.98-.43999927 4.22-.43999888l36.3.00000635c1.96.00000034 2.94.00000051 3.86.22000053.5.12.98.28 1.44.5v16.879992c0 2.24 0 3.36.44 4.22.38.74 1 1.36 1.74 1.74.86.44 1.98.44 4.22.44h16.88c.22.46.38.94.5 1.44.22.92.22 1.9.22 3.86z" fill="hsl(223deg 92% 87%)"></path><path d="m68.26 20.26c1.38 1.38 2.06 2.06 2.56 2.88.18.28.32.56.46.86h-16.88c-2.24 0-3.36 0-4.22-.44-.74-.38-1.36-1-1.74-1.74-.44-.86-.44-1.98-.44-4.22v-16.880029c.3.14.58.28.86.459999.82.5 1.5 1.18 2.88 2.56z" fill="hsl(223deg 85% 58%)" style=""></path></g><g clip-path="url(#c)" fill="hsl(223deg 85% 58%)"><path d="m24 56c4.4183 0 8-3.5817 8-8s-3.5817-8-8-8-8 3.5817-8 8 3.5817 8 8 8z"></path><path d="m44 55.998-10.352 15.528-5.648-7.528-12 16h40z"></path></g></g></svg>' +
                           '<div class="title">This file type isn\'t supported yet</div><div class="desc">You can download it below :D</div></div>';

    }
    
  } else {

    // show file size prompt
    liveView.innerHTML = '<div class="prompt">' +
                         '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="96" viewBox="0 0 72 96" width="72" class="file-svg"><clipPath id="a"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="b"><path d="m0 0h72v96h-72z"></path></clipPath><clipPath id="c"><path d="m12 36h48v48h-48z"></path></clipPath><g clip-path="url(#a)"><g clip-path="url(#b)"><path d="m72 29.3v60.3c0 2.24 0 3.36-.44 4.22-.38.74-1 1.36-1.74 1.74-.86.44-1.98.44-4.22.44h-59.20002c-2.24 0-3.36 0-4.22-.44-.74-.38-1.359997-1-1.739996-1.74-.44000025-.86-.44000006-1.98-.43999967-4.22l.00001455-83.2c.00000039-2.24.00000059-3.36.44000112-4.22.38-.74 1-1.36 1.74-1.74.86-.43999947 1.98-.43999927 4.22-.43999888l36.3.00000635c1.96.00000034 2.94.00000051 3.86.22000053.5.12.98.28 1.44.5v16.879992c0 2.24 0 3.36.44 4.22.38.74 1 1.36 1.74 1.74.86.44 1.98.44 4.22.44h16.88c.22.46.38.94.5 1.44.22.92.22 1.9.22 3.86z" fill="hsl(223deg 92% 87%)"></path><path d="m68.26 20.26c1.38 1.38 2.06 2.06 2.56 2.88.18.28.32.56.46.86h-16.88c-2.24 0-3.36 0-4.22-.44-.74-.38-1.36-1-1.74-1.74-.44-.86-.44-1.98-.44-4.22v-16.880029c.3.14.58.28.86.459999.82.5 1.5 1.18 2.88 2.56z" fill="hsl(223deg 85% 58%)" style=""></path></g><g clip-path="url(#c)" fill="hsl(223deg 85% 58%)"><path d="m24 56c4.4183 0 8-3.5817 8-8s-3.5817-8-8-8-8 3.5817-8 8 3.5817 8 8 8z"></path><path d="m44 55.998-10.352 15.528-5.648-7.528-12 16h40z"></path></g></g></svg>' +
                         '<div class="title">This file is too big to view</div><div class="desc">You can download it below :D</div></div>';

  }
  
}


// render branch menu
async function renderBranchMenuHTML(renderAll) {
  
  // map tree location
  let [user, repo, contents] = treeLoc;

  // get repository branch
  let [repoName, selectedBranch] = repo.split(':');
  
  // get repository branches
  let branchResp = JSON.parse(getAttr(branchMenu, 'resp'));
  
  
  // if branch menu isn't already rendered
  if (getAttr(branchMenu, 'tree') !== [user, repoName, contents].join()) {
    
    setAttr(branchMenu, 'tree', [user, repoName, contents].join());
    
    // show loading message
    branchMenu.innerHTML = '<div class="icon selected"><a>Loading...</a></div>';
    
    // get branches for repository
    branchResp = await git.getBranches(treeLoc);
    
    // clean resp and save only relevant fields
    let cleanedResp = branchResp.map(branch => {
      return { name: branch.name, commit: { sha: branch.commit.sha } };
    });
    
    // save resp in HTML
    setAttr(branchMenu, 'resp', JSON.stringify(cleanedResp));
    
  }
    

  // save rendered HTML
  let out = '';
  
  
  // render selected branch
  
  const selBranchObj = branchResp.filter(branch => branch.name === selectedBranch)[0];
  
  out += '<div class="icon selected">' + branchIcon + '<a>' + selectedBranch +'</a></div>';
  
  
  // if clicked on show more button,
  // render all branches
  if (renderAll) {

    // run on all branches
    branchResp.forEach(branch => {
      
      // don't render selected branch twice
      if (branch.name !== selectedBranch) {

        out += '<div class="icon">' + branchIcon + '<a>' + branch.name +'</a></div>';

      }

    });
    
  }
  
  
  // render show more button
  if (!renderAll && branchResp.length > 1) {
    
    out += '<div class="icon see-more">' + moreIcon + '<a>see more</a></div>';
    
  }
  
  // render new branch button
  // out += '<div class="icon new-branch">' + plusIcon + '<a>new branch</a></div>';
  

  // add rendered HTML to DOM
  branchMenu.innerHTML = out;


  // add branch event listeners

  let branches = branchMenu.querySelectorAll('.icon');

  // run on all branches
  branches.forEach(branch => {

    // select branch on click
    branch.addEventListener('click', async () => {
      
      // if clicked on branch, not a special button
      if (!branch.classList.contains('new-branch')
          && !branch.classList.contains('see-more')) {

        // hide branch menu
        branchMenu.classList.remove('visible');
        sidebarBranch.classList.remove('active');
        branchButton.classList.remove('active');

        // if branch isn't already selected
        if (!branch.classList.contains('selected')) {

          // change location
          selectedBranch = branch.querySelector('a').textContent;
          treeLoc[1] = repoName + ':' + selectedBranch;
          saveTreeLocLS(treeLoc);

          // render sidebar
          renderSidebarHTML();

        }

      } else if (branch.classList.contains('see-more')) { // if clicked on show more button

        // render branch menu
        renderBranchMenuHTML(true);

      } else if (branch.classList.contains('new-branch')) { // if clicked on new branch button
        
        let newBranchName = prompt('New branch from \'' + selectedBranch + '\':', 'branch name');

        if (newBranchName) {
          
          // replace all special chars in name with dashes
        
          const specialChars = validateString(newBranchName);

          if (specialChars) {

            specialChars.forEach(char => { newBranchName = newBranchName.replaceAll(char, '-') });

          }
          
          
          // hide branch menu
          branchMenu.classList.remove('visible');
          sidebarBranch.classList.remove('active');
          branchButton.classList.remove('active');
          
          // start loading
          startLoading();
          
          // get origin branch SHA
          const shaToBranchFrom = selBranchObj.commit.sha;
          
          // create branch
          await git.createBranch(treeLoc, shaToBranchFrom, newBranchName);
          
          // clear tree from HTML
          setAttr(branchMenu, 'tree', '');
          
          // change location
          treeLoc[1] = repoName + ':' + newBranchName;
          saveTreeLocLS(treeLoc);

          // render sidebar
          renderSidebarHTML();
          
        }
        
      }

    });

  });
  
}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', (e) => {
  
  // if clicked on branch menu, return
  if (e.target == sidebarBranch) {
    return;
  }
  
  
  // map tree location
  const [user, repo, contents] = treeLoc;

  // if navigating in folders
  if (contents != '') {

    // pop last folder
    let splitContents = contents.split('/');
    splitContents.pop();

    // change location
    treeLoc[2] = splitContents.join('/');
    saveTreeLocLS(treeLoc);

    // render sidebar
    renderSidebarHTML();

  } else if (repo != '') { // if navigating in repository

    // change location
    treeLoc[1] = '';
    saveTreeLocLS(treeLoc);

    // render sidebar
    renderSidebarHTML();

  } else { // show learn page

    sidebar.classList.add('learn');

  }

})


// show gradients on edges of sidebar title
// when scrolling long titles

sidebarLogo.addEventListener('scroll', () => {

  if (sidebarLogo.scrollLeft > 0) {

    sidebarLogo.classList.add('scrolled-start');

  } else {

    sidebarLogo.classList.remove('scrolled-start');

  }

  if ((sidebarLogo.offsetWidth + sidebarLogo.scrollLeft)
      >= sidebarLogo.scrollWidth) {

    sidebarLogo.classList.add('scrolled-end');

  } else {

    sidebarLogo.classList.remove('scrolled-end');

  }

})


// show options on click of button
optionsButton.addEventListener('click', () => {

  optionsButton.classList.toggle('open');

  titleScreen.classList.toggle('visible');
  optionsScreen.classList.toggle('visible');

})


// if clicked on branch icon,
// toggle branch menu
sidebarBranch.addEventListener('click', () => {
  
  // move branch menu to icon
  moveElToEl(branchMenu, sidebarBranch);
  
  branchMenu.classList.add('top-margin');
  
  branchMenu.classList.toggle('visible');
  sidebarBranch.classList.toggle('active');
  branchButton.classList.toggle('active');
  
})

// if clicked on branch button,
// toggle branch menu
branchButton.addEventListener('click', () => {
  
  // move branch menu to button
  moveElToEl(branchMenu, branchButton);
  
  branchMenu.classList.remove('top-margin');
  
  branchMenu.classList.toggle('visible');
  sidebarBranch.classList.toggle('active');
  branchButton.classList.toggle('active');
  
})


// hide branch menu when clicked anywhere else

if (!isMobile) {
  
  document.addEventListener('mousedown', checkBranchMenu);
  
} else {
  
  document.addEventListener('touchstart', checkBranchMenu);
  
}

function checkBranchMenu(e) {
  
  // if branch menu is visible
  if (branchMenu.classList.contains('visible')) {
    
    const notClickedOnMenu = (e.target != branchMenu && e.target != sidebarBranch && e.target != branchButton);
    const notClickedOnMenuChild = ((e.target.parentElement && e.target.parentElement != branchMenu)
                                   && (e.target.parentElement.parentElement &&
                                       e.target.parentElement.parentElement != branchMenu));
    
    if (notClickedOnMenu && notClickedOnMenuChild) {
      
      // hide branch menu
      branchMenu.classList.remove('visible');
      sidebarBranch.classList.remove('active');
      branchButton.classList.remove('active');

    }
    
  }
  
}


// create new file
// on click of button
newFileButton.addEventListener('click', () => {

  // if not already adding new file
  if (!fileWrapper.querySelector('.focused')) {

    // clear existing selections
    if (fileWrapper.querySelector('.selected')) {
      fileWrapper.querySelector('.selected').classList.remove('selected');
    }

    // create new file
    const fileEl = document.createElement('div');
    fileEl.classList = 'item file selected focused hidden';

    fileEl.innerHTML = `
    <div class="label">
      `+ fileIcon +`
      <a class="name" contenteditable="plaintext-only" spellcheck="false" autocorrect="off" autocomplete="off" aria-autocomplete="list" autocapitalize="off" dir="auto"></a>
    </div>
    <div class="push-wrapper">
      `+ pushIcon +`
    </div>
    `;

    // add new file to DOM
    fileWrapper.prepend(fileEl);

    // focus file
    fileEl.querySelector('.name').focus();
    fileEl.scrollIntoViewIfNeeded();


    // add push button event listener
    const pushWrapper = fileEl.querySelector('.push-wrapper');

    fileEl.querySelector('.name').addEventListener('keydown', (e) => {

      if (e.key === 'Enter') {

        e.preventDefault();

        onNextFrame(pushNewFileInHTML);

      }

    });

    let pushListener = pushWrapper.addEventListener('click', pushNewFileInHTML);


    // on next frame
    onNextFrame(() => {

      // animate file
      fileEl.classList.remove('hidden');

    });


    async function pushNewFileInHTML() {

      if (fileEl.classList.contains('focused')) {

        // play push animation
        playPushAnimation(fileEl.querySelector('.push-wrapper'));

        // disable pushing file from HTML
        fileEl.classList.remove('focused');

        // make file name uneditable
        fileEl.querySelector('.name').setAttribute('contenteditable', 'false');
        fileEl.querySelector('.name').blur();
        
        // hide header screens
        titleScreen.classList.add('visible');
        optionsScreen.classList.remove('visible');
        optionsButton.classList.remove('open');

        
        // pad file content with random number of invisible chars
        // to generate unique file content and fix git sha generation
        const randomNum = Math.floor(Math.random() * 100) + 1;
        const fileContent = '\r\n'.padEnd(randomNum, '\r');


        // validate file name

        // get file name
        let fileName = fileEl.querySelector('.name').textContent.replaceAll('\n', '');

        // replace all special chars in name with dashes
        
        const specialChars = validateString(fileName);
        
        if (specialChars) {
          
          specialChars.forEach(char => { fileName = fileName.replaceAll(char, '-') });
          
        }
        
        
        // if another file in the current directory
        // has the same name, add a differentiating number
        fileWrapper.querySelectorAll('.item.file').forEach(fileElem => {

          if (fileElem !== fileEl
              && (fileName === fileElem.querySelector('.name').textContent)) {

            // split extension from file name
            fileName = splitFileName(fileName);

            // add a differentiating number
            // and reconstruct file name
            fileName = fileName[0] + '-1' + (fileName[1] !== 'none' ? ('.' + fileName[1]) : '');

          }

        });

        fileEl.querySelector('.name').textContent = fileName;


        // change selected file
        changeSelectedFile(treeLoc.join(), fileContent, fileName, encodeUnicode('\r\n'), getFileLang(fileName),
                           [0, 0], [0, 0], true);


        // open file

        // show file content in codeit
        cd.textContent = '\r\n';

        // change codeit lang
        cd.lang = getFileLang(fileName);

        // clear codeit history
        cd.history = [];

        // update line numbers
        updateLineNumbersHTML();

        // if on desktop
        if (!isMobile) {

          // set caret pos in codeit
          cd.setSelection(0, 0);

        }


        // create commit
        const commitMessage = 'Create ' + fileName;

        const commitFile = {
          name: fileName,
          dir: treeLoc.join(),
          content: encodeUnicode(fileContent)
        };

        let commit = {
          message: commitMessage,
          file: commitFile
        };

        // push file asynchronously
        const newSha = await git.push(commit);

        // update file sha in HTML with new sha from Git
        setAttr(fileEl, 'sha', newSha);

        // change selected file
        changeSelectedFile(treeLoc.join(), newSha, fileName, encodeUnicode('\r\n'), getFileLang(fileName),
                           [0, 0], [0, 0], true);

        // Git file is eclipsed (not updated) in browser private cache,
        // so store the updated file in modifiedFiles object for 1 minute after commit
        if (modifiedFiles[fileContent]) {

          onFileEclipsedInCache(fileContent, newSha, selectedFile);

        } else {

          onFileEclipsedInCache(false, newSha, selectedFile);

        }


        // remove push listener
        pushWrapper.removeEventListener('click', pushListener);

        // add file event listeners
        
        fileEl.addEventListener('click', (e) => {
          
          clickedOnFileHTML(fileEl, e);

        })
        
        fileEl.querySelector('.push-wrapper')
          .addEventListener('contextmenu', () => {
          
          let commitMessage;

          // get selected branch
          let selBranch = treeLoc[1].split(':')[1];

          // open push screen
          commitMessage = prompt('Push '+ fileEl.innerText + (selBranch ? ' to branch ' + selBranch + '?' : '?'),
                                 'Type a push description...');

          // if canceled push, return
          if (!commitMessage) return;

          // if not specified message
          if (commitMessage === 'Type a push description...') {

            // show default message
            commitMessage = 'Update ' + fileEl.innerText;

          }


          // play push animation
          playPushAnimation(fileEl.querySelector('.push-wrapper'));

          // push file
          pushFileFromHTML(fileEl, commitMessage);
          
        })

      }

    }

  } else {

    // if already adding a new file, focus it
    fileWrapper.querySelector('.item.focused .name').focus();

  }

})


// if clicked on share button,
// share repository link
repoShareButton.addEventListener('click', () => {

  if (treeLoc[1] !== '') {

    // create a link
    const link = createLink({
      dir: treeLoc
    });

    if (isMobile) {

      const shareTitle = treeLoc[2] ? 'Share folder' : 'Share repository';

      try {

        navigator.share({
          title: shareTitle,
          text: link
        });

      } catch(e) {

        copy(link).then(() => {
          alert('Copied link to clipboard.');
        });

      }

    } else {

      copy(link).then(() => {
        alert('Copied link to clipboard.');
      });

    }
    
  } else {
    
    // share codeit
    
    const shareText = 'Hey, I\'m using Codeit to code. It\'s a mobile code editor connected to Git. Join me! ' + window.location.origin;
  
    if (isMobile) {

      try {

        navigator.share({
          title: 'Share Codeit',
          text: shareText
        });

      } catch(e) {

        // if couldn't open share dialog
        // copy text to clipboard
        copy(shareText).then(() => {
          alert('Copied text to clipboard.');
        });

      }

    } else {

      // if couldn't open share dialog
      // copy text to clipboard
      copy(shareText).then(() => {
        alert('Copied text to clipboard.');
      });

    }
  
  }

});


// share codeit on click of button
learnShare.addEventListener('click', () => {
  
  const shareText = 'Hey, I\'m using Codeit to code. It\'s a mobile code editor connected to Git. Join me! ' + window.location.origin;
  
  if (!isWindows) {

    try {

      navigator.share({
        title: 'Share Codeit',
        text: shareText
      });

    } catch(e) {

      // if couldn't open share dialog
      // copy text to clipboard
      copy(shareText).then(() => {
        alert('Copied text to clipboard.');
      });

    }

  } else {

    // if couldn't open share dialog
    // copy text to clipboard
    copy(shareText).then(() => {
      alert('Copied text to clipboard.');
    });

  }

})

// close learn page on click of button
learnClose.addEventListener('click', () => {

  sidebar.classList.remove('learn');

})


// toggle the sidebar
function toggleSidebar(open) {

  if (open) {

    body.classList.add('expanded');
    sidebarToggle.classList.add('visible');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
    }

  } else {

    body.classList.remove('expanded');
    sidebarToggle.classList.remove('visible');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#313744';
    }

  }

}


// when scrolled editor, save new scroll position

let editorScrollTimeout;

function onEditorScroll() {

  if (editorScrollTimeout) window.clearTimeout(editorScrollTimeout);

  // when stopped scrolling, save scroll pos
  editorScrollTimeout = window.setTimeout(saveSelectedFileScrollPos, 100);

}

function updateScrollbarArrow() {

  // if codeit is horizontally scrollable
  if (cd.scrollWidth > cd.clientWidth) {

    // move sidebar arrow up to make
    // way for horizontal scrollbar
    body.classList.add('scroll-enabled');

  } else {

    body.classList.remove('scroll-enabled');

  }

}

// check for meta key (Ctrl/Command)
function isKeyEventMeta(event) {
  return event.metaKey || event.ctrlKey;
}

// called on code change event
function codeChange() {

  // if selected file is not in modifiedFiles
  // or if it is in modifiedFiles and eclipsed
  if (!modifiedFiles[selectedFile.sha] ||
      (modifiedFiles[selectedFile.sha] &&
       modifiedFiles[selectedFile.sha].eclipsed)) {

    // if selected file is in modifiedFiles and eclipsed
    if ((modifiedFiles[selectedFile.sha] &&
        modifiedFiles[selectedFile.sha].eclipsed)) {

      // file cannot be both eclipsed and modified
      selectedFile.eclipsed = false;

    }

    // add selected file to modifiedFiles
    addSelectedFileToModFiles();

  }

  // enable pushing file in HTML

  const selectedEl = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

  // if selected file element exists in HTML
  if (selectedEl) {

    // enable pushing file
    selectedEl.classList.add('modified');

    // enable pushing from bottom float
    bottomFloat.classList.add('modified');

  }

  // save code in async thread
  asyncThread(saveSelectedFileContent, 30);

}

// protect unsaved code
// if selected file is in current directory
// but does not exist in the HTML
function protectUnsavedCode() {

  // map tree location
  const [user, repo, contents] = treeLoc;
  const [repoName, branch] = repo.split(':');
  
  // map selected file location
  const [selUser, selRepo, selContents] = selectedFile.dir.split(',');
  const [selRepoName, selBranch] = selRepo.split(':');

  if (user === selUser &&
      repoName === selRepoName &&
      contents === selContents) {

    // get selected file element in HTML
    // by sha
    let selectedElSha = fileWrapper.querySelector('.file.selected');
    let selectedElName;

    // if the selected file's sha changed
    if (!selectedElSha) {

      // get selected file element in HTML
      // by name
      selectedElName = Array.from(fileWrapper.querySelectorAll('.file'))
                       .filter(file => file.querySelector('.name').textContent == selectedFile.name);

      selectedElName = (selectedElName.length > 0) ? selectedElName[0] : null;

      // if new version of selected file exists
      if (selectedElName !== null) {

        // load file
        loadFileInHTML(selectedElName, getAttr(selectedElName, 'sha'));

      } else {

        // if the selected file was deleted,
        // protect unsaved code by clearing codeit

        // clear codeit contents
        cd.textContent = '';

        // change codeit lang
        cd.lang = '';

        // clear codeit history
        cd.history = [];

        // update line numbers
        updateLineNumbersHTML();

        // if on mobile, show sidebar
        if (isMobile) {

          // don't transition
          body.classList.add('notransition');

          // show sidebar
          toggleSidebar(true);
          saveSidebarStateLS();

          onNextFrame(() => {

            body.classList.remove('notransition');

          });

        }

        // change selected file to empty file
        changeSelectedFile('', '', '', '', '', [0, 0], [0, 0], false);

      }
      
    } else {
  
      // if selected file isn't loaded
      if (selectedFile.sha !== getAttr(selectedElSha, 'sha')) {
        
        // load file
        loadFileInHTML(selectedElSha, getAttr(selectedElSha, 'sha'));
        
      }

    }

  }

}

function setupEditor() {

  // if code in storage
  if (selectedFile.content) {

    // show file content in codeit
    try {

      cd.textContent = decodeUnicode(selectedFile.content);

      // change codeit lang
      cd.lang = selectedFile.lang;

    } catch(e) { // if file is binary

      cd.textContent = '';
      
      // load binary file
      loadBinaryFileHTML(selectedFile, false);

    }
      
    // if sidebar is closed, focus codeit
    if (!isMobile || (isMobile && getStorage('sidebar') != 'true')) {

      // set caret pos in code
      cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

    }

    // prevent bottom float disappearing on mobile
    if (isMobile) lastScrollTop = selectedFile.scrollPos[1];

    // scroll to pos in code
    cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

    // update line numbers
    updateLineNumbersHTML();

  }


  // add editor event listeners

  cd.on('type', codeChange);
  cd.on('scroll', onEditorScroll);
  cd.on('caretmove', saveSelectedFileCaretPos);

  if (!isMobile) cd.on('type', updateScrollbarArrow);

  // update on screen resize

  let lastWidth = undefined;

  window.addEventListener('resize', () => {

    if (lastWidth === window.innerWidth) {
      return;
    }

    lastWidth = window.innerWidth;

    updateLineNumbersHTML();

  });

  // disable context menu
  if (!isMobile) {

    window.addEventListener('contextmenu', (e) => {

      e.preventDefault();

    });

  }
  
  
  let beautifierOptions = {
    "indent_size": "2",
    "indent_char": " ",
    "max_preserve_newlines": "5",
    "preserve_newlines": true,
    "keep_array_indentation": false,
    "break_chained_methods": false,
    "indent_scripts": "normal",
    "brace_style": "collapse",
    "space_before_conditional": true,
    "unescape_strings": false,
    "jslint_happy": false,
    "end_with_newline": false,
    "wrap_line_length": "0",
    "indent_inner_html": false,
    "comma_first": false,
    "e4x": false,
    "indent_empty_lines": false
  };
  
  
  document.addEventListener('keydown', (e) => {

    // disable Ctrl/Cmd+S
    if ((e.key === 's' || e.keyCode === 83) && isKeyEventMeta(e)) {

      e.preventDefault();

      if (isMac) console.log('[Cmd+S] Always saving. Always saving.');
      else console.log('[Ctrl+S] Always saving. Always saving.');

    }
    
    
    // beautify on Ctrl/Cmd+D
    if ((e.key === 'd' || e.keyCode === 68) && isKeyEventMeta(e)) {
      
      e.preventDefault();
      
      // if codeit is active
      if (document.activeElement === cd) {
        
        const selText = window.getSelection().toString();
        
        // if selection exists
        if (selText !== '') {

          const cursor = cd.dropper.cursor();
          const cursorEl = cursor.startContainer === cd ? cd : cursor.getParent();

          // get selection language
          let selLang = Prism.util.getLanguage(cursorEl);
          if (selLang == 'javascript') selLang = 'js';
          if (selLang == 'markup') selLang = 'html';

          // find syntax for language
          const beautifyLang = beautifier[selLang];

          // if syntax exists
          if (beautifyLang) {

            // beautify
            beautifierOptions.indent_char = cd.options.tab[0];
            const beautifiedText = beautifyLang(selText, beautifierOptions);
            
            // compare current code with new code
            // if the code is different, swap it
            if (hashCode(selText) !== hashCode(beautifiedText)) {

              // replace selection contents
              // with beautified text
              cd.deleteCurrentSelection();
              cd.insert(beautifiedText);

              // dispatch type event (simulate typing)
              cd.dispatchTypeEvent();
              
            }
            
          }

        }
        
      }

    }

  });

}

function updateLineNumbersHTML() {

  // if mobile but not in landscape,
  // or if editor isn't in view, return
  if (isMobile && !isLandscape) {

    if (cd.querySelector('.line-numbers-rows')) {

      cd.querySelector('.line-numbers-rows').textContent = '';

    }

    cd.classList.remove('line-numbers');

    return;

  }

  cd.classList.add('line-numbers');

  Prism.plugins.lineNumbers.update(cd);


  if (!isMobile) {

    updateScrollbarArrow();
    updateLiveViewArrow();

  }

}

function setupSidebar() {

  // if not logged into git
  // and navigated to Repositories page
  if (gitToken == '' && treeLoc[1] == '') {

    // show intro screen
    sidebar.classList.add('intro');

    // don't transition
    body.classList.add('notransition');

    // show sidebar
    toggleSidebar(true);
    saveSidebarStateLS();

    onNextFrame(() => {

      body.classList.remove('notransition');

    });

  } else { // if logged into git

    // render sidebar
    renderSidebarHTML();

    // if sidebar is open
    if (getStorage('sidebar') == 'true') {

      // don't transition
      body.classList.add('notransition');

      toggleSidebar(true);

      onNextFrame(() => {

        body.classList.remove('notransition');

      });

    } else if (isMobile) {

      // update bottom floater
      updateFloat();

    }

  }

}

function setupCodeitApp() {

  setupEditor();
  setupSidebar();

  setTimeoutForEclipsedFiles();

}
