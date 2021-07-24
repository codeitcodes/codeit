
learnFork.addEventListener('click', () => {
  
  window.location.href = 'https://github.com/barhatsor/codeit-app';
  
})

learnTutorial.addEventListener('click', () => {
  
  window.location.href = 'https://github.com/barhatsor/codeit-app';
  
})

learnClose.addEventListener('click', () => {
  
  sidebar.classList.remove('learn');
  
  if (learnWrapper.classList.contains('close-sidebar')) {
    
    body.classList.remove('expanded');
    
    window.setTimeout(() => {
      
      learnWrapper.classList.remove('close-sidebar');
      
    }, 400);
    
  }
  
})
