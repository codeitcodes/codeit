
const body = document.body,

      cd = document.querySelector('cd-el'),

      bottomWrapper = document.querySelector('.bottom-wrapper'),
      
      bottomFloat = bottomWrapper.querySelector('.bottom-float'),
      sidebarOpen = bottomFloat.querySelector('.sidebar-open'),
      floatLogo = sidebarOpen.querySelector('.logo'),
      pushWrapper = bottomFloat.querySelector('.push-wrapper'),

      sidebarToggle = document.querySelector('.sidebar-toggle'),
      previewToggle = document.querySelector('.preview-toggle'),

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

      fileWrapper = sidebar.querySelector('.files'),
      
      versionEl = learnWrapper.querySelector('.version'),
      learnTitle = learnWrapper.querySelector('.title'),
      learnShare = learnWrapper.querySelector('.share'),
      learnClose = learnWrapper.querySelector('.close'),
      
      liveView = document.querySelector('.live-view');


// version
const version = '1.7.0';
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

  loader.style.width = '0%';
  loader.style.transition = 'none';
  loader.style.opacity = 1;

  window.setTimeout(load, 0);

  loadInterval = window.setInterval(load, 400);

}

function stopLoading() {

  window.clearInterval(loadInterval);

  loader.style.width = '100%';
  loader.style.opacity = 0;

}

function load() {

  let loadPercent = Number(loader.style.width.replace('%',''));

  loadPercent += 10;

  if (loadPercent != 100) {

    loader.style.transition = '';
    loader.style.width = loadPercent + '%';

  }

}



// device and platform queries

const isMobile = navigator.userAgent.match('Mobile') ?? false;
const isSafari = isMobile && navigator.userAgent.toLowerCase().indexOf('safari') != -1;

const isSafariApp = isSafari && navigator.standalone;

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

if (isSafariApp) {
  
  body.classList.add('safari-app');
  
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

const repoIcon = '<svg viewBox="0 0 16 16" class="icon" width="24" height="24" aria-hidden="true"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z" fill="currentColor"></path></svg>';
const fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M14.59 2.59c-.38-.38-.89-.59-1.42-.59H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8.83c0-.53-.21-1.04-.59-1.41l-4.82-4.83zM15 18H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm0-4H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2-6V3.5L18.5 9H14c-.55 0-1-.45-1-1z" fill="currentColor"></path> </svg>';
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z" fill="currentColor"></path> </svg>';

const arrowIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="arrow" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none"></path> <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" fill="currentColor"></path> </svg>';

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
