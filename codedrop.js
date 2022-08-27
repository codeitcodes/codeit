
function getFileLang(src) {
  
  const lang_aliases = /*aliases_placeholder[*/ {
    "html": "markup",
    "xml": "markup",
    "svg": "markup",
    "mathml": "markup",
    "ssml": "markup",
    "atom": "markup",
    "rss": "markup",
    "js": "javascript",
    "g4": "antlr4",
    "ino": "arduino",
    "arm-asm": "armasm",
    "art": "arturo",
    "adoc": "asciidoc",
    "avs": "avisynth",
    "avdl": "avro-idl",
    "gawk": "awk",
    "sh": "bash",
    "shell": "bash",
    "shortcode": "bbcode",
    "rbnf": "bnf",
    "oscript": "bsl",
    "cs": "csharp",
    "dotnet": "csharp",
    "cfc": "cfscript",
    "cilk-c": "cilkc",
    "cilk-cpp": "cilkcpp",
    "cilk": "cilkcpp",
    "coffee": "coffeescript",
    "conc": "concurnas",
    "jinja2": "django",
    "dns-zone": "dns-zone-file",
    "dockerfile": "docker",
    "gv": "dot",
    "eta": "ejs",
    "xlsx": "excel-formula",
    "xls": "excel-formula",
    "gamemakerlanguage": "gml",
    "po": "gettext",
    "gni": "gn",
    "ld": "linker-script",
    "go-mod": "go-module",
    "hbs": "handlebars",
    "mustache": "handlebars",
    "hs": "haskell",
    "idr": "idris",
    "gitignore": "ignore",
    "hgignore": "ignore",
    "npmignore": "ignore",
    "webmanifest": "json",
    "kt": "kotlin",
    "kts": "kotlin",
    "kum": "kumir",
    "tex": "latex",
    "context": "latex",
    "ly": "lilypond",
    "emacs": "lisp",
    "elisp": "lisp",
    "emacs-lisp": "lisp",
    "md": "markdown",
    "moon": "moonscript",
    "n4jsd": "n4js",
    "nani": "naniscript",
    "objc": "objectivec",
    "qasm": "openqasm",
    "objectpascal": "pascal",
    "px": "pcaxis",
    "pcode": "peoplecode",
    "plantuml": "plant-uml",
    "pq": "powerquery",
    "mscript": "powerquery",
    "pbfasm": "purebasic",
    "purs": "purescript",
    "py": "python",
    "qs": "qsharp",
    "rkt": "racket",
    "razor": "cshtml",
    "rpy": "renpy",
    "res": "rescript",
    "robot": "robotframework",
    "rb": "ruby",
    "sh-session": "shell-session",
    "shellsession": "shell-session",
    "smlnj": "sml",
    "sol": "solidity",
    "sln": "solution-file",
    "rq": "sparql",
    "sclang": "supercollider",
    "t4": "t4-cs",
    "trickle": "tremor",
    "troy": "tremor",
    "trig": "turtle",
    "ts": "typescript",
    "tsconfig": "typoscript",
    "uscript": "unrealscript",
    "uc": "unrealscript",
    "url": "uri",
    "vb": "visual-basic",
    "vba": "visual-basic",
    "webidl": "web-idl",
    "mathematica": "wolfram",
    "nb": "wolfram",
    "wl": "wolfram",
    "xeoracube": "xeora",
    "yml": "yaml"
  } /*]*/ ;
  
  src = src.replaceAll('\n', '');
  const extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
  return lang_aliases[extension] || extension;

}


function processFile(file) {
  
  showMessage('Opening file...', -1);
  
  const reader = new FileReader();

  reader.addEventListener('load', (event) => {
    
    // clear existing selections in HTML
    if (fileWrapper.querySelector('.selected')) {
      fileWrapper.querySelector('.selected').classList.remove('selected');
    }
    
    // if adding a new file, remove it
    if (fileWrapper.querySelector('.focused')) {
      
      fileWrapper.querySelector('.focused').classList.add('hidden');
      
      window.setTimeout(() => {
        fileWrapper.querySelector('.focused').remove();
      }, 180);
      
    }
    
  
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
    

    changeSelectedFile('', '', file.name, encodeUnicode(event.target.result), getFileLang(file.name), [0, 0], [0, 0], false);


    if (hashCode(event.target.result) !== hashCode(cd.textContent)) {
      
      cd.textContent = event.target.result;
      
    }
    
    cd.lang = getFileLang(file.name);
    
    cd.blur();
    
    cd.scrollTo(0, 0);

    cd.history.records = [{ html: cd.innerHTML, pos: cd.getSelection() }];
    cd.history.pos = 0;
    
    // update line numbers
    updateLineNumbersHTML();
    
    if (liveToggle.classList.contains('visible')) {
      
      liveToggle.classList.remove('visible');
      
    }
    
    if (liveView.classList.contains('file-open')) {
  
      liveView.classList.add('notransition');
      liveView.classList.remove('file-open');
  
      onNextFrame(() => {
        liveView.classList.remove('notransition');
      });
      
    }
    
    
    hideMessage();

  });

  reader.readAsText(file);

}


body.addEventListener('drop', (ev) => {
  
  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();
  
  // remove drop indication
  
  if (!liveView.classList.contains('file-open')) {
    
    cd.classList.remove('focus');
    
  } else {
    
    liveView.classList.remove('focus');
    
  }
  
  
  if (ev.dataTransfer.items) {
  
    // use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
  
      // if dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
  
        var file = ev.dataTransfer.items[i].getAsFile();
        processFile(file);
  
      }
  
    }
  
  } else {
  
    // use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
  
      processFile(ev.dataTransfer.files[i]);
  
    }
    
  }

})

body.addEventListener('dragover', (ev) => {

  // prevent default behavior (prevent file from being opened)
  ev.preventDefault();
  
  // show drop indication
  
  if (!liveView.classList.contains('file-open')) {
    
    cd.classList.add('focus');
    
  } else {
    
    liveView.classList.add('focus');
    
  }

})

body.addEventListener('dragleave', (ev) => {

  // remove drop indication
  
  if (!liveView.classList.contains('file-open')) {
    
    cd.classList.remove('focus');
    
  } else {
    
    liveView.classList.remove('focus');
    
  }

})


if ('launchQueue' in window) {

  window.launchQueue.setConsumer(async (launchParams) => {
        
    if (!launchParams.files.length) {
      return;
    }
    
    const launchFile = launchParams.files[0];
    
    console.log('[launchQueue] Launched with: ', launchFile);
    
    
    // get the file
    const fileData = await launchFile.getFile();
    
    // if localStorage not loaded yet
    if (typeof selectedFile === 'undefined') {
      
      // wait until localStorage is loaded
      window.addEventListener('load', () => {
        
        // handle the file
        processFile(fileData);
        
      });
      
    }
        
  });
  
}

