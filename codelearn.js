'use strict';

window.addEventListener('DOMContentLoaded', () => {
  let displayMode = 'browser tab';
  if (navigator.standalone) {
    displayMode = 'standalone-ios';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  }
  // Log launch display mode
  console.log('DISPLAY_MODE_LAUNCH:', displayMode);
});

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
  learnInstall.classList.remove('disabled');
}


// Event handler for butInstall - Does the PWA installation.
function installPWA(evt) {
  deferredInstallPrompt.prompt();
  // Log user response to prompt.
  deferredInstallPrompt.userChoice
    .then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredInstallPrompt = null;
    });
}


learnInstall.addEventListener('click', installPWA);




learnFork.addEventListener('click', () => {
  
  window.location.href = 'https://github.com/barhatsor/codeit-app';
  
})

learnClose.addEventListener('click', () => {
  
  if (learnWrapper.classList.contains('close-sidebar')) {
    
    body.classList.remove('expanded');
    learnWrapper.classList.remove('close-sidebar');
    
    window.setTimeout(() => {
      
      sidebar.classList.remove('learn');
      
    }, 400);
    
  } else {
    
    sidebar.classList.remove('learn');
    
  }
  
})
