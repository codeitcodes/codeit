// Add required CSS to head
var css = 'cd{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;border-radius:5px;padding:5px}.hljs{display:block;background:#fff;padding:.5em;color:#333;overflow-x:auto}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
    head = document.head,
    style = document.createElement('style');
head.appendChild(style);
style.appendChild(document.createTextNode(css));

// Get all Codeits
var codeits = document.querySelectorAll('cd');

codeits.forEach(codeit => {
  
  if (codeit.getAttribute('editable') != 'false') {
    codeit.setAttribute('contenteditable', 'true');
  }
  codeit.setAttribute('spellcheck', 'false');

  // parse codeit code
  let code = codeit.innerHTML.replace(/^\n|\n$/g, '');
  codeit.innerText = code;
  
  // set class to specified lang
  let lang = codeit.getAttribute('lang');
  if (!lang) lang = 'language-' + hljs.highlightAuto(codeit.innerText).language;
  
  codeit.classList = lang;
  
  // create a new instance of 'MutationObserver' named 'observer', 
  // passing it a callback function
  let observer = new MutationObserver(function(mutationsList, observer) {
    
    let textChanged = true;
    
    // run on all mutations
    mutationsList.forEach(mutation => {

      // if mutation was a textNode mutation
      if (mutation.type === 'characterData') {

        // if the text didn't change, stop
        if (mutation.oldValue === codeit.innerText) {
          textChanged = false;
        }

      } else if (mutation.type === 'childList') { // if mutation was a innerHTML mutation
        
        if (removedNodes) {
        
          // if the text didn't change, stop
          if (mutation.removedNodes[0].textContent === mutation.addedNodes[0].textContent) {
            textChanged = false;
          }
          
        } else {
          textChanged = false;
        }

      } else { // if mutation was an attribute mutation
        
        // if this is the only mutation, stop
        if (mutationsList.length === 1) {
          textChanged = false;
        }
        
      }
      
    });
    
    if (textChanged) {
      
      // if lang not specified, try autodetect
      if (!codeit.getAttribute('lang')) {

        lang = 'language-' + hljs.highlightAuto(codeit.innerText).language;
        codeit.classList = lang;

      }

      Prism.highlightElement(codeit);
      
      console.log(mutationsList);
      
    }
        
  });

  // call 'observe' on that MutationObserver instance, 
  // passing it the element to observe, and the options object
  observer.observe(codeit, {subtree: true, characterData: true, characterDataOldValue: true, childList: true, attributes: true});

  Prism.highlightElement(codeit);

});

// Utilty functions
function escapeHTML(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeHTML(input){
  var e = document.createElement('textarea');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}
