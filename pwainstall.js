'use strict';

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
        console.log('Accepted the install prompt');
      } else {
        console.log('Dismissed the install prompt');
      }
      deferredInstallPrompt = null;
    });
}


learnInstall.addEventListener('click', installPWA);




learnFork.addEventListener('click', () => {
  
  window.location.href = 'https://github.com/barhatsor/codeit';
  
})

learnClose.addEventListener('click', () => {
  
  if (learnWrapper.classList.contains('close-sidebar')) {
    
    toggleSidebar(false);
    learnWrapper.classList.remove('close-sidebar');
    
    saveSidebarStateLS();
    
    window.setTimeout(() => {
      
      sidebar.classList.remove('learn');
      
    }, 400);
    
  } else {
    
    sidebar.classList.remove('learn');
    
  }
  
})
