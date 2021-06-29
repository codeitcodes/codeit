// Add required CSS to head
var css = 'cd,codedit{display:inline-flex;position:relative;font-family:monospace;width:max-content;background:#f1f3f4;border-radius:5px;padding:5px}cd textarea,codedit textarea{background:0 0;color:transparent;position:relative;border:0;resize:none;font:inherit;outline:0;caret-color:#000;white-space:pre;overflow:hidden;  letter-spacing: inherit;line-height: inherit;padding:0;z-index:1}cd pre,codedit pre{top:0;margin:0;position:absolute;padding-top:inherit}cd code,codedit code{padding:0!important;background:0 0!important}.hljs{display:block;background:#fff;padding:.5em;color:#333;overflow-x:auto}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
    head = document.head,
    style = document.createElement('style');
head.appendChild(style);
style.appendChild(document.createTextNode(css));

// Get all Codeits
var codeits = document.querySelectorAll('codeit, cd');

codeits.forEach(codeit => {
  
  if (codeit.getAttribute('editable') != 'false') {
    codeit.setAttribute('contenteditable', 'true');
  }
  
  // set class to specified lang
  codeit.setAttribute('class', codeit.getAttribute('lang'));

  // parse codeit code
  let code = codeit.innerHTML.replace(/^\n|\n$/g, '');
  codeit.innerText = code;
  
  // create a new instance of 'MutationObserver' named 'observer', 
  // passing it a callback function
  let observer = new MutationObserver(function(mutationsList, observer) {
    console.log(mutationsList);
  });

  // call 'observe' on that MutationObserver instance, 
  // passing it the element to observe, and the options object
  observer.observe(codeit, {characterData: false, childList: true, attributes: false});

  function update() {
    input.style.height = 'auto';
    input.style.width = 'auto';
    input.style.height = input.scrollHeight+'px';
    input.style.width = input.scrollWidth+'px';
    
    fake.innerHTML = escapeHTML(input.value);
    
    // If lang not specified, clear class for autodetect
    if (!codedit.getAttribute('lang')) {
      fake.setAttribute('class', '');
    }

    hljs.highlightBlock(fake);
  }

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
