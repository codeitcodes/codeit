
const body = document.body,

      cd = document.querySelector('cd-el'),

      bottomWrapper = document.querySelector('.bottom-wrapper'),
      
      bottomFloat = bottomWrapper.querySelector('.bottom-float'),
      sidebarOpen = bottomFloat.querySelector('.sidebar-open'),
      floatLogo = sidebarOpen.querySelector('.logo'),
      pushWrapper = bottomFloat.querySelector('.push-wrapper'),
      
      liveButtonShare = bottomWrapper.querySelector('.live-button.share'),
      liveButtonArrow = bottomWrapper.querySelector('.live-button.arrow'),

      sidebarToggle = document.querySelector('.sidebar-toggle'),
      liveToggle = document.querySelector('.live-toggle'),

      sidebar = document.querySelector('.sidebar'),
      introWrapper = sidebar.querySelector('.intro-wrapper'),
      contentWrapper = sidebar.querySelector('.content-wrapper'),
      learnWrapper = sidebar.querySelector('.learn-wrapper'),

      loginButton = introWrapper.querySelector('.login'),

      loader = contentWrapper.querySelector('.loader'),
      header = contentWrapper.querySelector('.header'),

      titleScreen = header.querySelector('.titlescreen'),
      searchScreen = header.querySelector('.searchscreen'),

      sidebarTitle = titleScreen.querySelector('.title'),
      sidebarLogo = sidebarTitle.querySelector('.logo'),

      searchButton = titleScreen.querySelector('.search'),
      searchBack = searchScreen.querySelector('.back'),
      searchInput = searchScreen.querySelector('.searchinput'),
      searchClear = searchScreen.querySelector('.clear'),
      
      addButton = titleScreen.querySelector('.add'),
      
      sidebarBackground = document.querySelector('.sidebar-background'),
      
      fileWrapper = sidebar.querySelector('.files'),
      
      versionEl = learnWrapper.querySelector('.version'),
      learnTitle = learnWrapper.querySelector('.title'),
      learnShare = learnWrapper.querySelector('.share'),
      learnClose = learnWrapper.querySelector('.close'),
      
      liveView = document.querySelector('.live-view');


// version
const version = '1.9.0';
versionEl.innerText = version;


// dev build
let isDev = false;

if (window.location.href.includes('dev')) {
  
  isDev = true;
  learnTitle.innerHTML += '<sup>dev</sup>';
  
}



// sidebar loader
let loadInterval;

function startLoading() {
      
  sidebar.classList.add('loading');
  
  loader.style.width = '0%';
  loader.style.transition = 'none';
  loader.style.opacity = 1;

  onNextFrame(load);
  
  if (loadInterval) window.clearInterval(loadInterval);
  loadInterval = window.setInterval(load, 180);

}

function stopLoading() {
  
  sidebar.classList.remove('loading');
  
  window.clearInterval(loadInterval);
  loadInterval = false;

  loader.style.width = '100%';
  loader.style.opacity = 0;

}

function load() {

  let loadPercent = Number(loader.style.width.replace('%',''));

  loadPercent += 5;

  if (loadPercent < 100) {

    loader.style.transition = '';
    loader.style.width = loadPercent + '%';

  }

}



// device and platform queries

const isMobile = navigator.userAgent.match('Mobile') ?? false;
const isSafari = isMobile && navigator.userAgent.toLowerCase().indexOf('safari') != -1;

const isMac = navigator.platform.indexOf('Mac') > -1;
const isWindows = navigator.platform.indexOf('Win') > -1;

let isLandscape = window.matchMedia('(orientation: landscape)').matches;

let isOffline = !window.navigator.onLine;

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

window.addEventListener('resize', () => {

  isLandscape = window.matchMedia('(orientation: landscape)').matches;

});

window.addEventListener('online', () => { isOffline = false });
window.addEventListener('offline', () => { isOffline = true });


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


// MIME types (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)

const mimetypes = {
  png: 'image/png',
  jpeg: 'image/jpeg'
};

let getMimeType = (src) => {
  
  // get file extension
  const extension = splitFileName(src)[1].slice(1);
  
  return mimetypes[extension];
  
}


// localStorage

let getStorage = (item) => {

  return localStorage.getItem(item);

}

let setStorage = (item, value) => {

  return localStorage.setItem(item, value);

}


// Attributes

let getAttr = (element, item) => {

  return element.getAttribute(item);

}

let setAttr = (element, item, value) => {

  return element.setAttribute(item, value);

}


// asynchronous thread

let asyncThread = (callback, time) => {

  window.setTimeout(callback, time);

}

let onNextFrame = (callback) => {
  
  window.requestAnimationFrame(callback);

}


// copy
let copy = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}


// HTTP Request

let axios = {
  'get': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };
        xmlhttp.open('GET', url, true);
        if (token) xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  },
  'post': (url, data, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
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
          if (this.readyState == 4 && (this.status == 201 || this.status == 200)) {
            resolve(JSON.parse(this.responseText));
          }
        };
        xmlhttp.open('PUT', url, true);
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send(JSON.stringify(data));
      } catch(e) { reject(e) }
    });
  },
  'delete': (url, token) => {
    return new Promise((resolve, reject) => {
      try {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            resolve(JSON.parse(this.responseText));
          }
        };
        xmlhttp.open('DELETE', url, true);
        xmlhttp.setRequestHeader('Authorization', 'token ' + token);
        xmlhttp.send();
      } catch(e) { reject(e) }
    });
  }
};



// HTML Icons

const repoIcon = '<svg transform="scale(1.1665)" width="24" height="24" viewBox="0 0 28 28" fill="none" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M9.28906 23.1816H20.7236C21.1895 23.1816 21.5498 22.8213 21.5498 22.3555C21.5498 21.96 21.2773 21.6699 20.9434 21.5117C19.8623 21.0283 19.6514 19.5342 20.75 18.4883C21.1982 18.0928 21.541 17.6533 21.541 16.7656V7.03613C21.541 5.1377 20.5654 4.14453 18.6758 4.14453H9.30664C7.42578 4.14453 6.44141 5.12891 6.44141 7.03613V20.3164C6.44141 22.1973 7.42578 23.1816 9.28906 23.1816ZM18.5176 5.89355C19.3701 5.89355 19.792 6.3418 19.792 7.15039V16.4932C19.792 16.9238 19.5459 17.1611 19.1064 17.1611H10.4756V5.89355H18.5176ZM8.19043 17.4688V7.15039C8.19043 6.4209 8.5332 5.99023 9.22754 5.91113V17.1699C8.83203 17.2051 8.48926 17.3105 8.19043 17.4688ZM9.52637 21.5293C8.58594 21.5293 8.09375 20.9932 8.09375 20.167C8.09375 19.3672 8.65625 18.8135 9.58789 18.8135H18.3594C18.4561 18.8135 18.5527 18.8047 18.6406 18.7871C18.2012 19.7188 18.2539 20.7295 18.7285 21.5293H9.52637Z" fill="currentColor"></path></svg>';

//const fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M14.59 2.59c-.38-.38-.89-.59-1.42-.59H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM15 18H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2-6V3.5L18.5 9H14c-.55 0-1-.45-1-1z" fill="currentColor"></path> </svg>';
//const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z" fill="currentColor"></path> </svg>';

const fileIcon = '<svg transform="scale(1.1665)" width="24" height="24" viewBox="0 0 28 28" fill="none" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M9.31543 23.1816H18.6846C20.5742 23.1816 21.5498 22.1885 21.5498 20.29V12.3096C21.5498 11.0791 21.3916 10.5166 20.627 9.73438L16.0303 5.06738C15.2832 4.31152 14.668 4.13574 13.5605 4.13574H9.31543C7.43457 4.13574 6.4502 5.12891 6.4502 7.03613V20.29C6.4502 22.1885 7.43457 23.1816 9.31543 23.1816ZM9.46484 21.4238C8.62109 21.4238 8.19922 20.9844 8.19922 20.1758V7.1416C8.19922 6.3418 8.62109 5.89355 9.47363 5.89355H13.2002V10.6748C13.2002 11.9492 13.8242 12.5645 15.0898 12.5645H19.8008V20.1758C19.8008 20.9844 19.3789 21.4238 18.5264 21.4238H9.46484ZM15.2568 11.0264C14.8877 11.0264 14.7295 10.8682 14.7295 10.5078V6.12207L19.5635 11.0264H15.2568Z" fill="currentColor"></path></svg>';
const folderIcon = '<svg transform="scale(1.1665)" width="24" height="24" viewBox="0 0 28 28" fill="none" class="icon" xmlns="http://www.w3.org/2000/svg"><path d="M6.81055 21.7666H21.3916C23.0879 21.7666 24.0723 20.7822 24.0723 18.9014V9.85742C24.0723 7.97656 23.0791 6.99219 21.1807 6.99219H13.0332C12.4004 6.99219 12.0225 6.85156 11.5303 6.44727L11.0381 6.04297C10.4141 5.5332 9.95703 5.36621 9.03418 5.36621H6.54688C4.89453 5.36621 3.91895 6.33301 3.91895 8.1875V18.9014C3.91895 20.791 4.91211 21.7666 6.81055 21.7666ZM5.66797 8.33691C5.66797 7.53711 6.11621 7.11523 6.89844 7.11523H8.56836C9.19238 7.11523 9.56152 7.26465 10.0625 7.66895L10.5547 8.08203C11.1699 8.57422 11.6445 8.75 12.5674 8.75H21.0664C21.875 8.75 22.3232 9.17188 22.3232 10.0156V10.5342H5.66797V8.33691ZM6.9248 20.0176C6.11621 20.0176 5.66797 19.5957 5.66797 18.7432V12.0723H22.3232V18.752C22.3232 19.5957 21.875 20.0176 21.0664 20.0176H6.9248Z" fill="currentColor"></path></svg>';


const imageIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.9 13.98l2.1 2.53 3.1-3.99c.2-.26.6-.26.8.01l3.51 4.68c.25.33.01.8-.4.8H6.02c-.42 0-.65-.48-.39-.81L8.12 14c.19-.26.57-.27.78-.02z" fill="currentColor"></path> </svg>';
const videoIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7c0-.41.47-.65.8-.4l4.67 3.5c.27.2.27.6 0 .8l-4.67 3.5c-.33.25-.8.01-.8-.4z" fill="currentColor"></path> </svg>';
const audioIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z" fill="currentColor"></path> </svg>';

const arrowIcon = '<svg width="24" height="24" viewBox="0 0 28 28" fill="none" class="arrow" xmlns="http://www.w3.org/2000/svg"><path d="M19.6514 13.6543C19.6426 13.3467 19.5283 13.083 19.291 12.8457L12.4531 6.15723C12.251 5.96387 12.0137 5.8584 11.7236 5.8584C11.1348 5.8584 10.6777 6.31543 10.6777 6.9043C10.6777 7.18555 10.792 7.44922 10.9941 7.65137L17.1465 13.6543L10.9941 19.6572C10.792 19.8594 10.6777 20.1143 10.6777 20.4043C10.6777 20.9932 11.1348 21.4502 11.7236 21.4502C12.0049 21.4502 12.251 21.3447 12.4531 21.1514L19.291 14.4541C19.5371 14.2256 19.6514 13.9619 19.6514 13.6543Z" fill="currentColor"></path></svg>';

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
