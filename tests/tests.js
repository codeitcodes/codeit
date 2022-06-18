
let tests = {
  
  'click': (el) => {
    
    const clickEvent = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': false
    });

    el.dispatchEvent(clickEvent);

  },
  
  'typeRandomText': (el, ending) => {
    el.textContent = generateSHA(9) + (ending ?? '');
  },
  
  'createNewFile': (type) => {
    
    tests.click(addButton);

    tests.typeRandomText(fileWrapper.querySelector('.file.focused .name'), type);

    tests.click(fileWrapper.querySelector('.file.focused .push-wrapper'));
    
  },
  
  'modifySelectedFile': () => {

    tests.typeRandomText(cd);
    cd.dispatchTypeEvent();
    
  },
  
  'pushSelectedFile': () => {

    tests.click(fileWrapper.querySelector('.file.selected.modified .push-wrapper'));

  },
  
  'pushDifferentFile': () => {

    tests.click(fileWrapper.querySelector('.file:not(.selected).modified .push-wrapper'));
  
  },
  
  'goBackInSidebar': () => {

    tests.click(sidebarTitle);
  
  },
  
  'toggleLiveView': () => {

    tests.click(liveToggle.querySelector('.arrow'));
  
  },
  
  'selectDifferentFile': () => {

    const nextFile = fileWrapper.querySelector('.file.selected').nextElementSibling;
    const prevFile = fileWrapper.querySelector('.file.selected').previousElementSibling;

    if (prevFile) click(prevFile);
    else if (nextFile) click(nextFile);
  
  },
  
  'createNewRepo': () => {
    
    tests.click(addButton);

    tests.typeRandomText(fileWrapper.querySelector('.repo.focused .name'));

    tests.click(fileWrapper.querySelector('.repo.focused .push-wrapper'));
    
  }
  
};
