
learnFork.addEventListener('click', () => {
  
  window.location.href = 'https://github.com/barhatsor/codeit-app';
  
})

learnTutorial.addEventListener('click', () => {
  
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
