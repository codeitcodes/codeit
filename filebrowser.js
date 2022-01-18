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
  header.classList.remove('searching');


  // map tree location
  const [user, repo, contents] = treeLoc;


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

    sidebar.classList.add('intro');

    return;

  }

  if (resp.message == 'Bad credentials') {

    // if failed to get items,
    // show login screen

    // stop loading
    stopLoading();

    sidebar.classList.add('intro');

    return;

  }


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

      const repoName = repo.split(':')[0];

      // if repo is owned by logged user
      if (loggedUser && user == loggedUser.login) {

        // show repo name and path
        sidebarLogo.innerText = repoName + contents;

      } else {

        // show username, repo name and path
        sidebarLogo.innerText = user + '/' + repoName + contents;

      }

      // animate title
      if (sidebarLogo.scrollLeft > 0) titleAnimation = 'smooth';

    } else if (repo != '') {

      const repoName = repo.split(':')[0];

      // if repo is owned by logged user
      if (loggedUser && user == loggedUser.login) {

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

      // get repository branch
      let [repoName, branch] = repo.split(':');

      // if branch exists
      if (branch) {

        // show branch
        sidebarBranch.children[1].innerText = branch;
        sidebarBranch.classList.add('visible');

      }


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

          out += `
          <div class="item file`+ modified +`" sha="`+ file.sha +`">
            <div class="label">
              `+ fileIcon +`
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

          out += `
          <div class="item file`+ modified +`" sha="`+ file.sha +`">
            <div class="label">
              `+ fileIcon +`
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

      // hide branch
      sidebarBranch.classList.remove('visible');


      // change header options
      optionsScreen.classList.add('out-of-repo');
      

      // render repositories
      resp.forEach(item => {

        let fullName;

        // if repo is owned by logged user
        if (loggedUser && item.full_name.split('/')[0] == loggedUser.login) {

          // show repo name
          fullName = item.name;

        } else {

          // show username and repo name
          fullName = item.full_name;

        }


        /*
        // create repo obj
        const repoObj = {
          fullName: item.full_name,
          ownerName: item.owner.login,
          repoName: item.name,
          private: item.private,
          permissions: {
            admin: item.permissions.admin,
            push: item.permissions.push
          },
          allowForking: item.allow_forking
        };
        */


        out += `
        <div class="item repo" fullname="`+ item.full_name +`">
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

  // add rendered HTML to dom
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

        treeLoc[0] = itemLoc[0],
        treeLoc[1] = itemLoc[1];
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

        // if not clicked on push button
        let pushWrapper = item.querySelector('.push-wrapper');
        let clickedOnPush = (e.target == pushWrapper);

        if (!clickedOnPush) {

          // if file not already selected
          if (!item.classList.contains('selected')) {

            // load file
            loadFileInHTML(item, getAttr(item, 'sha'));

          } else if (isMobile) { // if on mobile device

            // update bottom float
            updateFloat();

          }

        } else {

          // play push animation
          playPushAnimation(item.querySelector('.push-wrapper'));

          // push file
          pushFileFromHTML(item);

        }

      }

    })

  })

}


// push file to Git from HTML element
async function pushFileFromHTML(fileEl) {

  // disable pushing file in HTML
  fileEl.classList.remove('modified');
  bottomFloat.classList.remove('modified');

  // get file selected status
  const fileSelected = fileEl.classList.contains('selected');

  // create commit
  const commitMessage = 'Update ' + fileEl.innerText;
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

    // start loading
    startLoading();

    // get file from git
    const resp = await git.getFile(treeLoc, fileEl.innerText);

    // change selected file
    changeSelectedFile(treeLoc.join(), fileSha, fileEl.innerText, resp.content, getFileLang(fileEl.innerText),
                       [0, 0], [0, 0], false);

    // stop loading
    stopLoading();

  } else { // else, load file from modifiedFiles object

    const modFile = modifiedFiles[fileSha];

    changeSelectedFile(modFile.dir, modFile.sha, modFile.name, modFile.content, modFile.lang,
                       modFile.caretPos, modFile.scrollPos, false);

  }

  // show file content in codeit
  cd.textContent = decodeUnicode(selectedFile.content);

  // change codeit lang
  cd.lang = selectedFile.lang;

  // set caret pos in codeit
  cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

  // set scroll pos in codeit
  cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

  // clear codeit history
  cd.history = [];

  // update line numbers
  updateLineNumbersHTML();

  // if on mobile device
  if (isMobile) {

    // update bottom float
    updateFloat();

  }

}


// traverse backwards in tree when clicked on button
sidebarTitle.addEventListener('click', () => {

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


// create new file
// on click of button
addFileButton.addEventListener('click', () => {

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


        // pad file content with random number of invisible chars
        // to generate unique file content and fix git sha generation
        const randomNum = Math.floor(Math.random() * 100) + 1;
        const fileContent = '\r\n'.padEnd(randomNum, '\r');


        // validate file name

        // get file name
        let fileName = fileEl.querySelector('.name').textContent.replaceAll('\n', '');

        // replace all spaces in name with dashes
        fileName = fileName.replaceAll(' ', '-');

        // if another file in the current directory
        // has the same name, add a differentiating number
        fileWrapper.querySelectorAll('.item.file').forEach(fileElem => {

          if (fileElem !== fileEl
              && (fileName === fileElem.querySelector('.name').textContent)) {

            // split extension from file name
            fileName = splitFileName(fileName);

            // add a differentiating number
            // and reconstruct file name
            fileName = fileName[0] + '-1.' + fileName[1];

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

        // add file event listener
        fileEl.addEventListener('click', (e) => {

          // if not clicked on push button
          let pushWrapper = fileEl.querySelector('.push-wrapper');
          let clickedOnPush = (e.target == pushWrapper);

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

            // play push animation
            playPushAnimation(fileEl.querySelector('.push-wrapper'));

            // push file
            pushFileFromHTML(fileEl);

          }

        });

      }

    }

  } else {

    // if already adding a new file, focus it
    fileWrapper.querySelector('.item.focused .name').focus();

  }

})


// share codeit on click of button
learnShare.addEventListener('click', () => {

  const shareData = {
    title: "Share Codeit",
    text: "Hey, I'm using Codeit to code. It's a mobile code editor connected to Git. Join me! " + window.location.origin
  };

  if (!isWindows) {

    try {

      navigator.share(shareData);

    } catch(e) {

      // if could not open share dialog, share on Twitter
      window.open('https://twitter.com/intent/tweet' +
                  '?text=' + encodeURIComponent(shareData.text.toLowerCase()),
                  '_blank');

    }

  } else {

    // share on Twitter
    window.open('https://twitter.com/intent/tweet' +
                '?text=' + encodeURIComponent(shareData.text.toLowerCase()),
                '_blank');

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

  // get selected file element in HTML
  // by sha
  let selectedElSha = fileWrapper.querySelectorAll('.file[sha="'+ selectedFile.sha +'"]');
  let selectedElName;

  // if the selected file's sha changed
  if (selectedElSha.length == 0) {

    // get selected file element in HTML
    // by name
    selectedElName = Array.from(fileWrapper.querySelectorAll('.item.file'))
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

  }

}

function setupEditor() {

  // if code in storage
  if (selectedFile.content) {

    // set codeit to code
    cd.lang = selectedFile.lang || 'plain';
    cd.textContent = decodeUnicode(selectedFile.content);

    // if sidebar isn't expanded, focus codeit
    if (!(isMobile && body.classList.contains('expanded'))) {

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

  // disable Ctrl/Cmd+S
  document.addEventListener('keydown', (e) => {

    if ((e.key === 's' || e.keyCode === 83) && isKeyEventMeta(e)) {

      e.preventDefault();

      if (isMac) console.log('[Cmd+S] Always saving. Always saving.');
      else console.log('[Ctrl+S] Always saving. Always saving.');

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
