
const isMobile = navigator.userAgent.match('Mobile') || false;
const isMac = navigator.platform.indexOf('Mac') > -1;
const isSafari = navigator.standalone || false;

window.addEventListener('appinstalled', logAppInstalled);

// Log the installation
function logAppInstalled(evt) {
  console.log('Codeit installed succesfully.', evt);
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);

// Saves the event & shows install button.
function saveBeforeInstallPromptEvent(evt) {
  evt.preventDefault();
  deferredInstallPrompt = evt;
}

// Event handler for butInstall - Does the PWA installation.
function installPWA(evt) {
  deferredInstallPrompt.prompt();
  // Log user response to prompt.
  deferredInstallPrompt.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('Accepted the install prompt');
      } else {
        console.log('Dismissed the install prompt');
      }
      deferredInstallPrompt = null;
    });
}

document.querySelectorAll('.btn.install').forEach(button => {

  button.addEventListener('click', installPWA);

});


// Register service worker
if ('serviceWorker' in navigator) {

  window.addEventListener('load', () => {

    navigator.serviceWorker.register('/service-worker.js');

  });

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
    window.location.href = '/full';
  }

};

checkPWA();
document.addEventListener('visibilitychange', checkPWA);
