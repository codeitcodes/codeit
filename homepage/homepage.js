



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


window.addEventListener('appinstalled', logAppInstalled);

// Log the installation
function logAppInstalled(evt) {
  
  console.log('Codeit installed succesfully.', evt);
  
  document.querySelectorAll('.btn.install').forEach(button => {
    
    button.classList.remove('loading');
    button.classList.add('installed');
    
    // save installation in local storage
    localStorage.setItem('installed', 'true');
    
    if (!isMobile) {
      window.location.replace(window.location.origin + '/full');
    }
    
  });
  
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);

// Saves the event & shows install button.
function saveBeforeInstallPromptEvent(evt) {
  
  evt.preventDefault();
  
  document.querySelectorAll('.btn.install').forEach(button => {
    
    button.classList.remove('loading');
    
  });
  
  deferredInstallPrompt = evt;
  
}

// Event handler for butInstall - Does the PWA installation.
function installPWA(evt) {
  
  // if codeit isn't already installed
  if (!localStorage.getItem('installed')) {

    // if able to install codeit
    if (deferredInstallPrompt) {

      deferredInstallPrompt.prompt();

      // Log user response to prompt.
      deferredInstallPrompt.userChoice
        .then((choice) => {
          if (choice.outcome === 'accepted') {

            console.log('Accepted the install prompt');

            document.querySelectorAll('.btn.install').forEach(button => {

              button.classList.add('loading');

            });

          } else {

            console.log('Dismissed the install prompt');

          }

          deferredInstallPrompt = null;

        });

    } else { // open in the browser

      window.location.replace(window.location.origin + '/full');
      
      // save installation in local storage
      localStorage.setItem('installed', 'true');

    }
    
  } else { // open in the browser
    
    window.location.href = (window.location.origin + '/full');
    
    // save installation in local storage
    localStorage.setItem('installed', 'true');
    
  }
  
}

function checkLocalStorage() {
  
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
  
}

document.querySelectorAll('.btn.install').forEach(button => {

  button.addEventListener('click', installPWA);
  
  button.classList.remove('loading');
  
  if (!checkLocalStorage()) {
    
    button.classList.add('installed');
    button.classList.add('cookies');
    
  } else {
  
    //if (localStorage.getItem('installed')) {

      //button.classList.add('installed');
      
    //}
    
  }

});


// Register service worker
if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register('/service-worker.js');

}

function checkPWA() {

  let displayMode = 'browser tab';

  if (navigator.standalone) {
    
    displayMode = 'standalone-ios';
    
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    
    displayMode = 'standalone';
    
  }

  if (displayMode != 'browser tab') {
    
    window.location.replace(window.location.origin + '/full');
    
  }

};
/*
document.addEventListener('visibilitychange', () => { window.setTimeout(checkPWA, 2000) });
checkPWA();*/


// add scroll event listeners

const screenHeight = window.innerHeight;

const featurePoints = document.querySelectorAll('#features .ftPoint');

const startPointAnimation = screenHeight / 3;
const pointStaggerInterval = 34 + (7 * 5);

function checkScrollAnimations() {
  
  // window scroll position
  const scrolled = window.scrollY || window.pageYOffset;  
  
  // add staggered feature points animation
  featurePoints.forEach((point, index) => {
    
    const pointAnimation = startPointAnimation + (pointStaggerInterval * index);
    
    if (scrolled >= pointAnimation) {
      point.classList.add('visible');
    } else {
      point.classList.remove('visible');
    }
    
  });
  
}


window.addEventListener('scroll', checkScrollAnimations);
checkScrollAnimations();
