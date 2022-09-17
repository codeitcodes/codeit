
const isMobile = navigator.userAgent.match('Mobile') || false;
const isMac = navigator.platform.indexOf('Mac') > -1;
const isSafari = navigator.userAgent.toLowerCase().indexOf('safari') != -1;

const isDev = (window.location.hostname === 'dev.codeit.codes');

function installButtonClicked() {
  
  // save installation in local storage
  localStorage.setItem('installed', 'true');
    
  window.location.replace(window.location.origin + '/full');

}

document.querySelectorAll('.btn.install').forEach(button => {

  button.addEventListener('click', installButtonClicked);
  
  button.classList.remove('loading');
  button.classList.add('installed');
  
  if (!checkLocalStorage()) {
    
    button.classList.add('cookies');
    
  } else {
  
    if (localStorage.getItem('installed')) {
      
      if ((new URL(window.location.href).search) !== '?p') {
        
        window.location.replace(window.location.origin + '/full');
        
      }
      
    }
    
  }

});

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


// register service worker
navigator.serviceWorker.register('/service-worker.js');


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

