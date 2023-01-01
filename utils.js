
let treeLoc, linkData, gitToken, authUser,
    selectedFile, modifiedFiles, modifiedRepos;


const body = document.body,

      cd = document.querySelector('cd-el'),

      bottomWrapper = document.querySelector('.bottom-wrapper'),

      bottomFloat = bottomWrapper.querySelector('.bottom-float'),
      sidebarOpen = bottomFloat.querySelector('.sidebar-open'),
      floatLogo = sidebarOpen.querySelector('.logo'),
      pushWrapper = bottomFloat.querySelector('.push-wrapper'),
      floatDownload = bottomFloat.querySelector('.download'),
      
      liveButtonOptions = bottomWrapper.querySelector('.live-button.options'),

      sidebarToggle = document.querySelector('.sidebar-toggle'),
      liveToggle = document.querySelector('.live-toggle'),

      sidebar = document.querySelector('.sidebar'),
      introWrapper = sidebar.querySelector('.intro-wrapper'),
      contentWrapper = sidebar.querySelector('.content-wrapper'),
      learnWrapper = sidebar.querySelector('.learn-wrapper'),

      loginButton = introWrapper.querySelector('.login'),

      loader = contentWrapper.querySelector('.loader'),
      header = contentWrapper.querySelector('.header'),

      titleScreen = header.querySelector('.title-screen'),
      searchScreen = header.querySelector('.search-screen'),

      sidebarTitle = titleScreen.querySelector('.title'),
      sidebarLogo = sidebarTitle.querySelector('.logo'),
      sidebarBranch = sidebarTitle.querySelector('.branch-icon'),

      addButton = header.querySelector('.add'),

      searchButton = titleScreen.querySelector('.search'),
      searchBack = searchScreen.querySelector('.back'),
      searchInput = searchScreen.querySelector('.search-input'),
      searchClear = searchScreen.querySelector('.clear'),

      sidebarBackground = document.querySelector('.sidebar-background'),

      fileWrapper = sidebar.querySelector('.files'),

      versionEl = learnWrapper.querySelector('.version'),
      learnTitle = learnWrapper.querySelector('.title'),
      logoutButton = learnWrapper.querySelector('.logout'),
      learnAbout = learnWrapper.querySelector('.about'),
      learnShare = learnWrapper.querySelector('.share'),
      learnClose = learnWrapper.querySelector('.close'),

      branchMenu = document.querySelector('.branch-menu'),
      
      liveViewMenu = document.querySelector('.live-view-menu'),
      liveMenuShare = liveViewMenu.querySelector('.share'),
      liveMenuConsole = liveViewMenu.querySelector('.console'),
      
      liveConsoleSheet = document.querySelector('.sheet .live-console-sheet'),
            
      dialogWrapper = document.querySelector('.dialog-wrapper'),
      dialogTitle = dialogWrapper.querySelector('.title'),
      dialogCancel = dialogWrapper.querySelector('.cancel'),
      dialogConfirm = dialogWrapper.querySelector('.confirm'),
      dialogBackground = dialogWrapper.querySelector('.dialog-background'),

      messageEl = document.querySelector('.message'),

      liveView = document.querySelector('.live-view');



// version
const version = '3.4.4';
versionEl.innerText = version;

let logVersion = () => {
  console.log('%cCodeit ' + version, 'font-style: italic; color: gray');
}

logVersion();


// dev build
const isDev = (window.location.hostname === 'dev.codeit.codes');

if (isDev) {

  learnTitle.innerHTML += '<sup>dev</sup>';

}



// sidebar loader

function startLoading() {

  sidebar.classList.add('loading');

}

function stopLoading() {

  sidebar.classList.remove('loading');

}



// show message

let messageTimeout;

let showMessage = (message, duration) => {
  
  // if message includes an icon
  if (message.icon) {
    
    // show message in HTML
    messageEl.innerHTML = message.icon + message.message;
    
  } else {
  
    // show message in HTML
    messageEl.textContent = message;
    
  }

  // if message is already visible
  if (messageEl.classList.contains('visible')) {

    // animate new message

    messageEl.classList.add('animating');

    onNextFrame(() => {
      messageEl.classList.remove('animating');
    });

  }

  messageEl.classList.add('visible');


  if (messageTimeout) window.clearTimeout(messageTimeout);
  
  if (duration !== -1) {
    
    messageTimeout = window.setTimeout(() => {
  
      messageEl.classList.remove('visible');
  
    }, (duration ?? 2000));
    
  } else {
    
    messageTimeout = null;
    
  }

}

let hideMessage = () => {
  messageEl.classList.remove('visible');
}



// show dialog

let showDialog = (confirmHandler, titleText, confirmText, showOneButton = false) => {
  
  return new Promise(resolve => {
    
    // add dialog text to HTML
    dialogTitle.textContent = titleText;
    dialogConfirm.textContent = confirmText;
    
    // toggle button visibility
    dialogWrapper.classList.toggle('one-button', showOneButton);
    
    // show dialog
    dialogWrapper.classList.add('visible');
    
    // if on desktop, hide sidebar toggle
    if (!isMobile) sidebarToggle.classList.add('dialog-visible');
    
    // if on mobile,
    // change status bar color
    if (isMobile) {
      
      if (body.classList.contains('expanded')) {
        
        document.querySelector('meta[name="theme-color"]').content = '#1e2028';
        
      } else {
        
        document.querySelector('meta[name="theme-color"]').content = '#2b303b';
        
      }
      
    }
    
    // add confirm button listener
    dialogConfirm.onclick = async (e) => {
            
      if (confirmHandler) await confirmHandler(e);
      resolve(true);
      
    };
    
    // add cancel button listener
    dialogCancel.onclick = () => {
      
      hideDialog();
      resolve(false);
      
    };

    // add dialog background click listener
    dialogBackground.onclick = () => {
      
      hideDialog();
      resolve(false);
      
    };
    
  });
  
}

let hideDialog = () => {
  
  // hide dialog
  dialogWrapper.classList.remove('visible');
  
  // if on desktop, show sidebar toggle
  if (!isMobile) sidebarToggle.classList.remove('dialog-visible');
  
  // if on mobile,
  // change status bar color
  if (isMobile) {

    if (body.classList.contains('expanded')) {

      document.querySelector('meta[name="theme-color"]').content = '#1a1c24';

    } else {

      document.querySelector('meta[name="theme-color"]').content = '#313744';

    }

  }
  
}



// device and platform queries

let isMobile = false;

if (navigator.userAgentData
    && navigator.userAgentData.mobile) isMobile = true;

if (navigator.userAgent
    && navigator.userAgent.includes('Mobile')) isMobile = true;

let isSafari = false;

if (navigator.userAgentData
    && navigator.userAgentData.platform === 'iOS') isSafari = true;

if (navigator.userAgent
    && isMobile
    && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) isSafari = true;

const isMac = navigator.platform.includes('Mac');
const isWindows = navigator.platform.includes('Win');

let isLandscape = window.matchMedia('(orientation: landscape)').matches;

let isOffline = !window.navigator.onLine;

let isEmbed = (window.top !== window);

if (isMobile) {

  body.classList.add('mobile');

}

if (isSafari) {

  body.classList.add('safari');

}

if (isMac) {

  body.classList.add('platform-mac');

} else if (isWindows) {

  body.classList.add('platform-win');

}

if (isEmbed) {
  
  body.classList.add('embed');
  
}

window.matchMedia('(orientation: landscape)').addEventListener('change', (e) => {
  
  isLandscape = e.matches;

});

window.addEventListener('online', () => { isOffline = false });
window.addEventListener('offline', () => { isOffline = true });


// persistent storage

let isPersistStorage = false;

let checkPersistStorage = async () => {
  
  if (navigator.storage && navigator.storage.persist) {

    isPersistStorage = await navigator.storage.persisted();

    if (!isPersistStorage) {

      // request persistent storage
      isPersistStorage = await navigator.storage.persist();

    }

  }
  
}

checkPersistStorage();


// escape HTML
let escapeHTML = (str) => {
  
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  
  let resp = p.innerHTML;
  resp = resp.replaceAll(/"/g, "&quot;").replaceAll(/'/g, "&#039;");
  
  return resp;
  
}


// base64 encode/decode

let encodeUnicode = (str) => {

  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
  }));

}

let decodeUnicode = (str) => {

  // going backwards: from bytestream, to percent-encoding, to original string
  return decodeURIComponent(atob(str).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

}


// split file name
let splitFileName = (src) => {

  src = src.replaceAll('\n', '');

  const extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
  return [src.replace(('.' + extension), ''), extension];

}


// file types (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)

const fileTypes = {
  'image': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'tif', 'tiff', 'webp'],
  'video': ['mp4', 'mpeg', 'ogv', 'webm'],
  'audio': ['avi', 'mp3', 'oga', 'ogg', 'opus', 'wav', 'weba'],
  'font': ['woff', 'woff2', 'ttf', 'otf'],
  'html': ['html', 'svg', 'htm'],
  'css': ['css', 'scss'],
  'javascript': ['js', 'ts', 'mjs', 'jsx'],
  'json': ['json'],
  'python': ['py', 'python'],
  'markdown': ['md'],
  'midi': ['midi'],
  'pdf': ['pdf']
};

let getFileType = (fileName) => {

  // get file extension
  const extension = splitFileName(fileName)[1];

  let fileType = 'other';

  if (fileName === 'README') return 'markdown';

  Object.entries(fileTypes).forEach(type => {

    if (type[1].includes(extension)) {

      fileType = type[0];
      return fileType;

    }

  });

  return fileType;

}


// localStorage

let getStorage = (item) => {

  return localStorage.getItem(item);

}

let setStorage = (item, value) => {

  return localStorage.setItem(item, value);

}


// move element to element (when origin element has 'position: fixed')

let moveElToEl = (originEl, destEl, boundryMargin = null, margin = null, boundryEl = null) => {

  // get bounding box of dest element
  const rect = destEl.getBoundingClientRect(),
        destHeight = destEl.clientHeight;

  // get bounding box of origin element
  const originHeight = originEl.clientHeight,
        originWidth = originEl.clientWidth;


  // define window constraints
  // (stop moving element when it goes offscreen)
  let maxTop = window.innerHeight,
      minTop = -originHeight,
      maxLeft = window.innerWidth,
      minLeft = -originWidth;


  // if defined boundry element,
  // update constraints
  if (boundryEl) {

    maxTop = boundryEl.clientHeight;
    maxLeft = boundryEl.clientWidth;

  }


  // add margin from boundry edges
  if (boundryMargin && !isNaN(boundryMargin)) {

    // add vertical margin from screen edges
    maxTop -= originHeight + boundryMargin;
    minTop = boundryMargin;

    // add horizontal margin from screen edges
    maxLeft -= originWidth + boundryMargin;
    minLeft = boundryMargin;

  }


  let destTop = rect.top + destHeight,
      destLeft = rect.left;
      
      
  // add margin
  if (margin) {
    
    if (margin.top) destTop = destTop + margin.top;
    
    if (margin.left) destLeft = destLeft + margin.left;
    
  }
  

  // check if element is outside window
  if (maxTop < destTop) destTop = maxTop;
  if (minTop > destTop) destTop = minTop;
  if (maxLeft < destLeft) destLeft = maxLeft;
  if (minLeft > destLeft) destLeft = minLeft;
  

  originEl.style.top = destTop + 'px';
  originEl.style.left = destLeft + 'px';

}


// move element to mouse (when element has 'position: fixed')

let moveElToMouse = (originEl, mouseEvent, boundryMargin = null, boundryEl = null) => {

  // get bounding box of origin element
  const originHeight = originEl.clientHeight,
        originWidth = originEl.clientWidth;


  // define window constraints
  // (stop moving element when it goes offscreen)
  let maxTop = window.innerHeight,
      minTop = -originHeight,
      maxLeft = window.innerWidth,
      minLeft = -originWidth;


  // if defined boundry element,
  // update constraints
  if (boundryEl) {

    maxTop = boundryEl.clientHeight;
    maxLeft = boundryEl.clientWidth;

  }


  // add margin from boundry edges
  if (boundryMargin && !isNaN(boundryMargin)) {

    // add vertical margin from screen edges
    maxTop -= originHeight + boundryMargin;
    minTop = boundryMargin;

    // add horizontal margin from screen edges
    maxLeft -= originWidth + boundryMargin;
    minLeft = boundryMargin;

  }


  let destTop = mouseEvent.clientY,
      destLeft = mouseEvent.clientX;

  // check if element is outside window
  if (maxTop < destTop) destTop = maxTop;
  if (minTop > destTop) destTop = minTop;
  if (maxLeft < destLeft) destLeft = maxLeft;
  if (minLeft > destLeft) destLeft = minLeft;


  originEl.style.top = destTop + 'px';
  originEl.style.left = destLeft + 'px';

}


// attributes

let getAttr = (element, item) => {

  return element.getAttribute(item);

}

let setAttr = (element, item, value) => {

  return element.setAttribute(item, value);

}


// validate string
let validateString = (string) => {

  const acceptableChars = 'abcdefghijklmnopqrstuvwxyz' +
                          'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                          '0123456789' +
                          '-_.';

  const stringArr = string.split('').filter(char => !acceptableChars.includes(char));

  return (stringArr.length > 0 ? stringArr : false);

}


// hash string
let hashCode = (string) => {
  let hash = 0, i, chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // convert to 32bit integer
  }
  return hash;
}


// generate SHA
let generateSHA = (len) => {
  let dec2hex = (dec) => {
    return dec.toString(16).padStart(2, '0');
  }
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}


// load a script
let loadScript = (src, inEl = document.body) => {
  
  return new Promise((resolve, reject) => {
    
    let s = document.createElement('script');
    s.src = src;
    
    s.onload = () => {
      inEl.removeChild(s);
      resolve();
    };
    
    s.onerror = () => {
      inEl.removeChild(s);
      reject();
    };
    
    inEl.appendChild(s);
    
  });
  
}

// load a stylesheet
let loadStyleSheet = (href, inEl = document.head) => {
  
  return new Promise((resolve, reject) => {
    
    let s = document.createElement('link');
    s.href = href;
    s.rel = 'stylesheet';
    
    s.onload = () => {
      resolve();
    };
    
    s.onerror = () => {
      reject();
    };
    
    inEl.appendChild(s);
    
  });
  
}


// asynchronous thread

let onNextFrame = (callback) => {

  window.requestAnimationFrame(callback);

}

let asyncThread = (callback, time) => {

  window.setTimeout(callback, time);

}

let asyncForEach = async (array, callback) => {
  
  for (let index = 0; index < array.length; index++) {
    
    await callback(array[index], index, array);
    
  }
  
}


// add event listeners

Element.prototype.on = (events, callback, passive) => {

  events.split(' ').forEach(evt => {

    this.addEventListener(evt, callback, passive);

  });

}


// copy
let copy = async (text) => {
  
  try {
    
    await navigator.clipboard.writeText(text);
    
  } catch(e) {
    
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // avoid scrolling to bottom
    textarea.style.top = 0;
    textarea.style.left = 0;
    textarea.style.position = 'fixed';
  
    body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    document.execCommand('copy');
    
    body.removeChild(textarea);
    
  }
  
}

// read clipboard
let readClipboard = async () => {
  
  try {
    
    const text = await navigator.clipboard.readText();

    return text;
    
  } catch(e) {
    
    return {
      error: 'Permission declined'
    };
    
  }

}


// HTTP Request

try {
  axios = axios;
} catch(e) {
  window.axios = null;
}

axios = {
  'get': (url, token, noParse) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {}
          }
        };
        xmlhttp.onerror = function () {
          if (this.responseText) {
            try {
              if (!noParse) {
                resolve(JSON.parse(this.responseText));
              } else {
                resolve(this.responseText);
              }
            } catch(e) {}
          }
        };

        xmlhttp.open('GET', url, true);
        if (token) xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  },
  'post': (url, token, data) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {
              resolve();
            }
          }
        };
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Accept', 'application/json');
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'put': (url, token, data) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {
              resolve();
            }
          }
        };
        xmlhttp.open('PUT', url, true);
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'patch': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {}
          }
        };
        xmlhttp.onerror = function () {
          if (this.responseText) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {}
          }
        };
        xmlhttp.open('PATCH', url, true);
        if (token) xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  },
  'delete': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && String(this.status).startsWith('2')) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {
              resolve();
            }
          } else if (this.responseText) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {}
          }
        };
        xmlhttp.onerror = function () {
          if (this.responseText) {
            try {
              resolve(JSON.parse(this.responseText));
            } catch(e) {}
          }
        };
        xmlhttp.open('DELETE', url, true);
        if (token) xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};



// HTML Icons

const repoIcon = '<svg viewBox="0 0 16 16" class="icon" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z" fill="currentColor"></path></svg>';
const fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M14.59 2.59c-.38-.38-.89-.59-1.42-.59H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM15 18H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2-6V3.5L18.5 9H14c-.55 0-1-.45-1-1z" fill="currentColor"></path></svg>';
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"></path></svg>';

const imageIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.9 13.98l2.1 2.53 3.1-3.99c.2-.26.6-.26.8.01l3.51 4.68c.25.33.01.8-.4.8H6.02c-.42 0-.65-.48-.39-.81L8.12 14c.19-.26.57-.27.78-.02z" fill="currentColor"></path> </svg>';
const videoIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" fill="currentColor"></path> </svg>';
const audioIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z" fill="currentColor"></path> </svg>';

const branchIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" class="branch-icon"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M13,14C9.64,14 8.54,15.35 8.18,16.24C9.25,16.7 10,17.76 10,19A3,3 0 0,1 7,22A3,3 0 0,1 4,19C4,17.69 4.83,16.58 6,16.17V7.83C4.83,7.42 4,6.31 4,5A3,3 0 0,1 7,2A3,3 0 0,1 10,5C10,6.31 9.17,7.42 8,7.83V13.12C8.88,12.47 10.16,12 12,12C14.67,12 15.56,10.66 15.85,9.77C14.77,9.32 14,8.25 14,7A3,3 0 0,1 17,4A3,3 0 0,1 20,7C20,8.34 19.12,9.5 17.91,9.86C17.65,11.29 16.68,14 13,14M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20A1,1 0 0,0 8,19A1,1 0 0,0 7,18M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4M17,6A1,1 0 0,0 16,7A1,1 0 0,0 17,8A1,1 0 0,0 18,7A1,1 0 0,0 17,6Z" fill="currentColor"></path></svg>';
const moreIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" class="bigger-icon"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"></path></svg>';
const plusIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" class="bigger-icon"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" fill="currentColor"></path></svg>';

const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="arrow" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" fill="currentColor"></path> </svg>';

const lockIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><g fill="none"><path d="M0 0h24v24H0V0z"/><path d="M0 0h24v24H0V0z" opacity=".87"/></g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" fill="currentColor"/></svg>';

const animLockIcon = `
<svg class="lock roundbutton" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g id="wrapper">
    <g id="shackle-wrapper" transform="matrix(1.33362,0,0,1.20093,-4.00339,-1.60746)">
      <path id="shackle" d="M9,8.834L9,6C9,4.34 10.34,3 12,3C13.66,3 15,4.34 15,6L15,8.834L9,8.834Z" fill="none"></path>
    </g>
    <path id="housing" d="M18.026 8H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10a2.006 2.006 0 0 0-1.974-2ZM18 19c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v8Z"></path>
    <path id="housing-fill" d="M18 19c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v8Zm-6-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"></path>
    <path id="plug" d="M12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"></path>
    <path id="bounding-box" fill="none" d="M0 0h24v24H0z"></path>
  </g>
</svg>
`;

const pushIcon = `
<svg class="push-svg" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.92 40.21">
  <g id="Group" transform="translate(-9.08 -8.23)">
    <path id="push" d="M24.69,26.23h1.68V31.5a1.06,1.06,0,0,0,1.05,1.06h4.22A1.07,1.07,0,0,0,32.7,31.5V26.23h1.67a1.06,1.06,0,0,0,.75-1.81l-4.84-4.84a1.06,1.06,0,0,0-1.49,0L24,24.42A1.06,1.06,0,0,0,24.69,26.23Zm-2.53,9.49a1.06,1.06,0,0,0,1.05,1.06H35.87a1.06,1.06,0,1,0,0-2.11H23.21A1,1,0,0,0,22.16,35.72Z"></path>
    <path id="check" d="M29.54,18.34a10,10,0,1,0,10,10A10,10,0,0,0,29.54,18.34ZM26.83,32.63,23.24,29a1,1,0,0,1,1.41-1.41l2.89,2.88,6.88-6.88A1,1,0,0,1,35.83,25l-7.59,7.59A1,1,0,0,1,26.83,32.63Z"></path>
  </g>
  <g id="Sparkles">
    <circle cx="20.81" cy="20.81" r="1.06" id="circle" stroke-width="0" stroke="rgb(23, 191, 99)"></circle>
    <g id="grp7" opacity="0">
      <circle id="oval1" cx="6.35" cy="8.47" r="1.41" fill="#9cd8c3"></circle>
      <circle id="oval2" cx="8.47" cy="5.64" r="1.41" fill="#8ce8c3"></circle>
    </g>
    <g id="grp6" opacity="0">
      <circle id="oval1" data-name="oval1" cx="1.41" cy="24.69" r="1.41" fill="#cc8ef5"></circle>
      <circle id="oval2" data-name="oval2" cx="2.12" cy="21.16" r="1.41" fill="#91d2fa"></circle>
    </g>
    <g id="grp3" opacity="0">
      <circle id="oval2" data-name="oval2" cx="38.09" cy="24.69" r="1.41" fill="#9cd8c3"></circle>
      <circle id="oval1" data-name="oval1" cx="39.51" cy="21.16" r="1.41" fill="#8ce8c3"></circle>
    </g>
    <g id="grp2" opacity="0">
      <circle id="oval2" data-name="oval2" cx="34.57" cy="8.47" r="1.41" fill="#cc8ef5"></circle>
      <circle id="oval1" data-name="oval1" cx="32.45" cy="5.64" r="1.41" fill="#cc8ef5"></circle>
    </g>
    <g id="grp5" opacity="0">
      <circle id="oval1" data-name="oval1" cx="14.11" cy="38.8" r="1.41" fill="#91d2fa"></circle>
      <circle id="oval2" data-name="oval2" cx="11.29" cy="36.68" r="1.41" fill="#91d2fa"></circle>
    </g>
    <g id="grp4" opacity="0">
      <circle id="oval1" data-name="oval1" cx="28.92" cy="38.8" r="1.41" fill="#f48ea7"></circle>
      <circle id="oval2" data-name="oval2" cx="26.1" cy="36.68" r="1.41" fill="#f48ea7"></circle>
    </g>
    <g id="grp1" opacity="0">
      <circle id="oval1" data-name="oval1" cx="18.69" cy="2.12" r="1.41" fill="#9fc7fa"></circle>
      <circle id="oval2" data-name="oval2" cx="22.22" cy="1.41" r="1.41" fill="#9fc7fa"></circle>
    </g>
  </g>
  <path id="bounding-box" d="M17.54,16.34h24v24h-24Z" transform="translate(-9.08 -8.23)" fill="none"></path>
</svg>
`;


const repoIntroScreen = `
<div class="intro">
  <div class="picture-wrapper faded">
    <svg viewBox="0 0 356 415" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" class="picture" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path d="M272.41 168.81c-40.867 0-73.996 33.129-73.996 74V479.6c0 40.867 33.129 73.996 73.996 73.996h14.797c8.176 0 14.801-6.625 14.801-14.801 0-8.172-6.625-14.797-14.801-14.797H272.41c-24.52 0-44.398-19.879-44.398-44.398 0-16.727 9.25-31.293 22.91-38.863 5.828-3 12.902-5.031 21.488-5.535H524v88.797h-29.598c-8.176 0-14.801 6.625-14.801 14.797 0 8.176 6.625 14.801 14.801 14.801h44.395c8.176 0 14.801-6.625 14.801-14.801v-117.06c.871-5.914 0-13.172 0-13.172v-195.35c0-24.52-19.875-44.398-44.398-44.398l-236.79-.006Z" fill="hsl(232deg 39% 14%)" transform="translate(-198.414 -168.81)"></path><path d="M331.6 479.6c0-8.176 6.629-14.801 14.801-14.801h88.797c8.172 0 14.801 6.625 14.801 14.801v88.797a14.797 14.797 0 0 1-7.816 13.047 14.808 14.808 0 0 1-15.195-.734L390.8 556.585l-36.188 24.125a14.804 14.804 0 0 1-23.012-12.313V479.6Z" fill="hsl(232deg 34% 22%)" transform="translate(-198.414 -168.81)"></path></svg>
  </div>
  <div class="subhead">
    <div class="title" style="opacity: .5">Create a repository</div>
  </div>
</div>
`;

const fileIntroScreen = `
<div class="intro">
  <div class="picture-wrapper faded">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="96" viewBox="0 0 72 96" width="72" class="picture"><path d="m72 29.3v60.3c0 2.24 0 3.36-.44 4.22-.38.74-1 1.36-1.74 1.74-.86.44-1.98.44-4.22.44h-59.20002c-2.24 0-3.36 0-4.22-.44-.74-.38-1.359997-1-1.739996-1.74-.44000025-.86-.44000006-1.98-.43999967-4.22l.00001455-83.2c.00000039-2.24.00000059-3.36.44000112-4.22.38-.74 1-1.36 1.74-1.74.86-.43999947 1.98-.43999927 4.22-.43999888l36.3.00000635c1.96.00000034 2.94.00000051 3.86.22000053.5.12.98.28 1.44.5v16.879992c0 2.24 0 3.36.44 4.22.38.74 1 1.36 1.74 1.74.86.44 1.98.44 4.22.44h16.88c.22.46.38.94.5 1.44.22.92.22 1.9.22 3.86z" fill="hsl(232deg 39% 14%)"></path><path d="m68.26 20.26c1.38 1.38 2.06 2.06 2.56 2.88.18.28.32.56.46.86h-16.88c-2.24 0-3.36 0-4.22-.44-.74-.38-1.36-1-1.74-1.74-.44-.86-.44-1.98-.44-4.22v-16.880029c.3.14.58.28.86.459999.82.5 1.5 1.18 2.88 2.56z" fill="hsl(232deg 34% 22%)"></path></svg>
  </div>
  <div class="subhead">
    <div class="title" style="opacity: .5">Create a file</div>
  </div>
</div>
`;


const repoNotFoundScreen = `
<div class="intro">
  <div class="picture-wrapper" style="margin-bottom: 31.5px;/* margin-bottom: 33.25px; */">
    <svg viewBox="0 0 356 415" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" class="picture" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path d="M272.41 168.81c-40.867 0-73.996 33.129-73.996 74V479.6c0 40.867 33.129 73.996 73.996 73.996h14.797c8.176 0 14.801-6.625 14.801-14.801 0-8.172-6.625-14.797-14.801-14.797H272.41c-24.52 0-44.398-19.879-44.398-44.398 0-16.727 9.25-31.293 22.91-38.863 5.828-3 12.902-5.031 21.488-5.535H524v88.797h-29.598c-8.176 0-14.801 6.625-14.801 14.797 0 8.176 6.625 14.801 14.801 14.801h44.395c8.176 0 14.801-6.625 14.801-14.801v-117.06c.871-5.914 0-13.172 0-13.172v-195.35c0-24.52-19.875-44.398-44.398-44.398l-236.79-.006Z" fill="hsl(223deg 92% 87%)" transform="translate(-198.414 -168.81)"></path><path d="M331.6 479.6c0-8.176 6.629-14.801 14.801-14.801h88.797c8.172 0 14.801 6.625 14.801 14.801v88.797a14.797 14.797 0 0 1-7.816 13.047 14.808 14.808 0 0 1-15.195-.734L390.8 556.585l-36.188 24.125a14.804 14.804 0 0 1-23.012-12.313V479.6Z" fill="hsl(223deg 85% 58%)" transform="translate(-198.414 -168.81)"></path></svg>
  </div>
  <div class="subhead">
    <div class="title" style="/* margin-bottom: 10.5px; */margin-bottom: 12.25px;">Hmm... we can't find that repo.</div>
    <div class="subtitle">If it's private, try double checking you're on the account with access.</div>
  </div>
  <div class="button secondary large-spacing-top login" style="/* margin-top: 38.5px; */margin-top: 45.5px;">Close</div>
</div>
`;

const pageErrorScreen = `
<div class="intro">
  <div class="picture-wrapper">
    <a style="white-space: nowrap;font-size: 58px;font-weight: 600;">🤔</a>
  </div>
  <div class="subhead">
    <div class="title">We couldn't load this page.</div>
  </div>
  <div class="button secondary medium-spacing-top login">Try again</div>
</div>
`;

const offlineScreen = `
<div class="intro">
  <div class="picture-wrapper">
    <svg viewBox="0 0 24 24" class="picture"><path d="M1.626 17.87c.125 0 .253-.03.37-.098.36-.205.485-.663.28-1.023-.355-.627-.544-1.343-.544-2.07 0-2.218 1.732-4.02 3.913-4.172.018.282.046.564.096.84.067.36.383.614.738.614.045 0 .09-.004.136-.012.407-.074.678-.465.604-.873-.062-.34-.094-.69-.094-1.04 0-3.204 2.606-5.81 5.81-5.81.58 0 1.15.085 1.702.253.394.123.814-.103.937-.498.12-.396-.103-.815-.5-.937-.69-.21-1.41-.318-2.14-.318-3.673 0-6.714 2.727-7.225 6.262-3.04.118-5.475 2.62-5.475 5.69 0 .986.256 1.958.74 2.81.138.243.39.38.653.38zm18.554-6.802c.03-.312.063-.78.063-1.032 0-.59-.07-1.177-.21-1.745-.1-.4-.503-.645-.907-.55-.402.1-.648.506-.55.908.11.45.167.92.167 1.388 0 .203-.03.615-.055.888-2.067.132-3.816 1.567-4.306 3.603-.097.402.15.808.555.904.397.094.808-.15.904-.554.352-1.46 1.647-2.48 3.15-2.48 1.788 0 3.242 1.455 3.242 3.242s-1.454 3.24-3.24 3.24H8.454c-.414 0-.75.336-.75.75s.336.75.75.75H18.99c2.615 0 4.742-2.126 4.742-4.74 0-2.2-1.514-4.038-3.55-4.57zm.878-8.848c-.293-.293-.768-.293-1.06 0l-19 19c-.294.293-.294.768 0 1.06.145.147.337.22.53.22s.383-.072.53-.22l19-19c.293-.293.293-.767 0-1.06z" fill="currentColor"></path></svg>
  </div>
  <div class="subhead">
    <div class="title">Looks like you're offline.</div>
  </div>
  <div class="button secondary medium-spacing-top login">Edit modified files</div>
  <div class="button teritary tiny-spacing-top login">Try again</div>
</div>
`;
