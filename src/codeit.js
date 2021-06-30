// Add required CSS to head
var css = 'cd{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;border-radius:5px;padding:5px}.hljs{display:block;background:#fff;padding:.5em;color:#333;overflow-x:auto}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
    head = document.head,
    style = document.createElement('style');
head.appendChild(style);
style.appendChild(document.createTextNode(css));

// Get all Codeits
var codeits = document.querySelectorAll('cd');

codeits.forEach(cd => {
  
  if (cd.getAttribute('editable') != 'false') {
    cd.setAttribute('contenteditable', 'true');
  }
  cd.setAttribute('spellcheck', 'false');

  // parse codeit code
  let code = cd.innerHTML.replace(/^\n|\n$/g, '');
  cd.innerText = code;
  
  // create a new instance of 'MutationObserver' named 'observer', 
  // passing it a callback function
  let observer = new MutationObserver(function(mutationsList, observer) {
    
    let textChanged = true;
    
    // run on all mutations
    mutationsList.forEach(mutation => {

      // if mutation was a textNode mutation
      if (mutation.type === 'characterData') {

        // if the text didn't change, stop
        if (mutation.oldValue === cd.innerText) {
          textChanged = false;
        }

      } else if (mutation.type === 'childList') { // if mutation was a innerHTML mutation
        
        
        
      }
      
    });
    
    if (textChanged) {

      cd.update();
      
      console.log(mutationsList);
      
    }
        
  });

  // call 'observe' on that MutationObserver instance, 
  // passing it the element to observe, and the options object
  observer.observe(cd, {subtree: true, characterData: true, characterDataOldValue: true, childList: false, attributes: false});
  
  
  
  function getCaretData(elem) {
    var sel = window.getSelection();
    return [sel.anchorNode, sel.anchorOffset];
  }

  function setCaret(el, pos) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el,pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }


  let indexStack = [];

  function checkParent(elem) {

    let parent = elem.parentNode;
    let parentChildren = Array.from(parent.childNodes);

    let elemIndex = parentChildren.indexOf(elem);

    indexStack.unshift(elemIndex);

    if (parent !== cd) {

      checkParent(parent);

    } else {

      return;

    }

  }

  let stackPos = 0;
  let elemToSelect;

  function getChild(parent, index) {

    let child = parent.childNodes[index];

    if (stackPos < indexStack.length-1) {

      stackPos++;

      getChild(child, indexStack[stackPos]);

    } else {
      
      elemToSelect = child;
      
      return;
      
    }

  }
  
  
  
  cd.update = () => {
    
    let caretData = getCaretData(cd);
    
    let selectedElem = caretData[0];
    let caretPos = caretData[1];
    
    
    indexStack = [];
    checkParent(selectedElem);
    
    
    let highlightData = hljs.highlightAuto(cd.innerText);
    cd.innerHTML = highlightData.value;
    
    
    stackPos = 0;
    getChild(cd, indexStack[stackPos]);
    
    
    setCaret(elemToSelect, caretPos);
    
  }
  
  cd.update();
  
});
