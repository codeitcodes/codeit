/*
  github
*/

// toggle sidebar on click of bookmark
github.addEventListener('click', () => {

  toggleSidebar(!body.classList.contains('expanded'));

  saveSidebarStateLS();

})


// render sidebar
// call this function when signed in to github
// to render sidebar
async function renderSidebarHTML() {

  // if not already loading, start loading
  if (loader.style.opacity != '1') {
    startLoading();
  }

  // map tree location
  const [user, repo, contents] = treeLoc;

  // get items in current tree from git
  const resp = await git.getItems(treeLoc);

  // save rendered HTML
  let out = '';

  // if response
  if (resp) {

    // show title

    sidebarLogo.classList.remove('overflow');

    if (contents != '') {

      // show path
      sidebarLogo.innerText = repo + contents;

      // if path is too long, overflow
      if (sidebarLogo.innerText.length > 25) {

        sidebarLogo.classList.add('overflow');

      }

    } else if (repo != '') {

      // show repo name
      sidebarLogo.innerText = repo;

    } else {

      // show title
      sidebarLogo.innerText = 'Repositories';

    }


    // if navigating in repository
    if (repo != '') {

      // render files
      resp.forEach(item => {

        // if item is a file
        if (item.type == 'file') {

          // add modified flag to file
          let modified = '';
          if (modifiedFiles[item.sha] &&
              !modifiedFiles[item.sha].eclipsed) modified = ' modified';

          out += `
          <div class="item file`+ modified +`" sha="`+ item.sha +`">
            <div class="label">
              `+ fileIcon +`
              <a class="name">`+ item.name +`</a>
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

    } else { // else, show all repositories

      // render repositories
      resp.forEach(item => {

        // if user does not have admin permissions in repo,
        // show admin name in title ([admin]/[repo])
        let fullName = item.permissions.admin ? item.name : item.full_name;

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

  // hide search screen
  header.classList.remove('searching');

  // if selected file is in directory
  if (selectedFile.dir == treeLoc.join()) {

    let selectedEl = fileWrapper.querySelector('.item[sha="'+ selectedFile.sha +'"]');

    if (selectedEl) {

      // select file
      selectedEl.classList.add('selected');
      selectedEl.scrollIntoViewIfNeeded();

    }

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
        treeLoc[2] += '/' + item.innerText;
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

          // push file
          pushFileFromHTML(item);

        }

      }

    })

  })

}


// push file to Git from HTML element
async function pushFileFromHTML(fileEl) {

  // play push animation
  playPushAnimation(fileEl.querySelector('.push-wrapper'));

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

  // clear existing selections
  if (fileWrapper.querySelector('.selected')) {
    fileWrapper.querySelector('.selected').classList.remove('selected');
  }


  // select the new file

  fileEl.classList.add('selected');

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
                       modFile.caretPos, modFile.scrollPos, modFile.eclipsed);

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

  } else { // show learn screen

    sidebar.classList.add('learn');

  }

})


// toggle the sidebar
function toggleSidebar(open) {

  if (open) {

    body.classList.add('expanded');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#1a1c24';
    }

  } else {

    body.classList.remove('expanded');

    if (isMobile) {
      document.querySelector('meta[name="theme-color"]').content = '#313744';
    }

  }

}


// check for key to see if code
// or caret position have changed
function onEditorKeyup(event) {

  // if code has changed
  if (hasKeyChangedCode(event)) {

    // save code to local storage
    codeChange();

  }

  // if caret position has changed
  if (hasKeyChangedCaretPos(event)) {

    // save caret pos to local storage
    saveSelectedFileCaretPos();

  }

}

// when clicked on editor, save new caret position
function onEditorClick(event) {

  // save caret pos to local storage
  saveSelectedFileCaretPos();

}

// when scrolled editor, save new scroll position

let editorScrollTimeout;

function onEditorScroll(event) {

  if (editorScrollTimeout) window.clearTimeout(editorScrollTimeout);

  // when stopped scrolling, save scroll pos
  editorScrollTimeout = window.setTimeout(saveSelectedFileScrollPos, 300);

}

// check for key to see if code has changed
function hasKeyChangedCode(event) {

  return event.key !== 'Meta'
      && event.key !== 'Control'
      && event.key !== 'Alt'
      && !event.key.startsWith('Arrow');

}

// check for key to see
// if caret position has changed
function hasKeyChangedCaretPos(event) {

  return event.key.startsWith('Arrow');

}

// check for meta key (Ctrl/Command)
function isKeyEventMeta(event) {
  return event.metaKey || event.ctrlKey;
}

// called on code change event
function codeChange() {

  // if selected file is not in modifiedFiles
  if (!modifiedFiles[selectedFile.sha]) {

    // add selected file to modifiedFiles
    addSelectedFileToModFiles();

    // if selected file is eclipsed,
    // change the sha of file element in HTML to new sha
    if (selectedFile.eclipsed) {

      let selectedEl = fileWrapper.querySelector('.file.selected');
      setAttr(selectedEl, 'sha', selectedFile.sha);

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

  }

  // update line numbers
  updateLineNumbersHTML();

  // save code in async thread
  asyncThread(saveSelectedFileContent, 30);

}

function setupEditor() {

  // add editor event listeners

  cd.addEventListener('keyup', onEditorKeyup);
  cd.addEventListener('click', onEditorClick);
  cd.addEventListener('scroll', onEditorScroll);

  // if code in storage
  if (selectedFile.content) {

    // set codeit to code
    cd.lang = selectedFile.lang || 'plain';
    cd.textContent = decodeUnicode(selectedFile.content);

    // set caret pos in code
    cd.setSelection(selectedFile.caretPos[0], selectedFile.caretPos[1]);

    // scroll to pos in code
    cd.scrollTo(selectedFile.scrollPos[0], selectedFile.scrollPos[1]);

    // update line numbers
    updateLineNumbersHTML();

    // save code history
    cd.recordHistory();

  }


  // update line numbers on screen resize
  window.addEventListener('resize', () => {

    // update line numbers
    updateLineNumbersHTML();

  });


  // update line numbers when finished highlighting
  Prism.hooks.add('complete', function (env) {

    if (!env.code) {
      return;
    }

    // update line numbers
    updateLineNumbersHTML();

  });


  // disable context menu
  window.addEventListener('contextmenu', (e) => {

    e.preventDefault();

  });

}

function updateLineNumbersHTML() {

  // if mobile but not in landscape,
  // or if editor isn't in view, return
  if (isMobile && (!isLandscape || body.classList.contains('expanded'))) {

    if (cd.querySelector('.line-numbers-rows')) {

      cd.querySelector('.line-numbers-rows').remove();

    }

    cd.classList.remove('line-numbers');
    cd.style.paddingLeft = '';

    return;

  }

  cd.classList.add('line-numbers');

  // update line numbers
  Prism.plugins.lineNumbers.resize(cd);

}

function setupSidebar() {

  // if sidebar is open
  if (getStorage('sidebar') == 'true') {

    // do a silent transition
    body.classList.add('transitioning');

    toggleSidebar(true);

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 0);

  } else {

    // update bottom floater
    updateFloat();

  }

}

function setupCodeitApp() {

  setupEditor();
  setupSidebar();

}
