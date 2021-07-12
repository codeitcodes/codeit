
function loadCodeFromStorage() {
  
  // if code in storage
  if (getStorage('code')) {
    
    // set codeit to code
    cd.setValue(getStorage('code'));
    
    // set caret pos in code
    cd.textarea.setSelectionRange(getStorage('caret'), getStorage('caret'));
    cd.textarea.focus();
        
  }
  
  // if sidebar is open
  if (getStorage('sidebar') == 'true') {
    
    // do a silent transition
    body.classList.add('transitioning');
    body.classList.add('expanded');

    window.setTimeout(() => {

      body.classList.remove('transitioning');

    }, 400);

  }
  
}

window.onbeforeunload = () => {
  
  // set localStorage values
  setStorage('code', cd.textarea.value);
  setStorage('caret', cd.textarea.selectionStart);
  setStorage('sidebar', body.classList.contains('expanded'));
  
};
