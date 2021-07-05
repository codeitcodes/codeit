/*
  github
*/

/* 
   
   codeit by @barhatsor
   MIT License
   
   github.com/barhatsor/codeit
   
*/

//(() => {
  
  // add codeit CSS to head
  var css = 'cd{display:inline-flex;position:relative;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";background:#f1f3f4;color:#333;border-radius:5px;padding:5px}cd textarea{background:0 0;color:transparent;position:absolute;top:0;left:0;border:0;resize:none;font:inherit;letter-spacing:inherit;line-height:inherit;outline:0;caret-color:#000;white-space:pre;overflow:hidden;padding:inherit;box-sizing:border-box;z-index:1}cd pre{margin:0;font:inherit;letter-spacing:inherit;line-height:inherit}cd code{color:#333}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
      head = document.head,
      style = document.createElement('style');
  head.appendChild(style);
  style.appendChild(document.createTextNode(css));

  // get all Codeits
  var codeits = document.querySelectorAll('cd');

  codeits.forEach(cd => {

    // create codeit elements
    var textarea = document.createElement('textarea');

    var pre = document.createElement('pre');
    var code = document.createElement('code');

    // style codeit textarea
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('rows', 1);

    // highlight with specified lang
    code.classList = cd.getAttribute('lang') ? cd.getAttribute('lang') : 'hljs';

    // parse code
    cd.parsedCode = decodeHTML(cd.innerHTML).replace(/^\n|\n$/g, '');

    // clear codeit
    cd.innerHTML = '';

    // append codeit elements to DOM
    textarea = cd.appendChild(textarea);
    pre = cd.appendChild(pre);
    code = pre.appendChild(code);

    // set codeit textarea value to code
    textarea.value = cd.parsedCode;

    // if codeit is uneditable, hide input
    if (cd.getAttribute('editable') == 'false') {
      textarea.style.display = 'none';
    }

    // init codeit behavior
    new Behave({
      textarea: textarea,
      replaceTab: true,
      softTabs: true,
      tabSize: 2,
      autoOpen: true,
      overwrite: true,
      autoStrip: true,
      autoIndent: true
    });

    // update codeit

    cd.setValue = (code) => {

      textarea.value = code;
      cd.update();

    }

    update = () => {

      code.innerHTML = escapeHTML(textarea.value);

      textarea.style.width = cd.scrollWidth + 'px';
      textarea.style.height = cd.scrollHeight + 'px';

      // if codeit lang not specified, autodetect code lang
      if (!cd.getAttribute('lang')) {
        code.classList = 'hljs';
      }

      hljs.highlightElement(code);

    }
    
   // update textarea
   var observe;
   if (window.attachEvent) {
     observe = (event, handler) => {
       code.attachEvent('on' + event, handler);
     };
   } else {
     observe = (event, handler) => {
       code.addEventListener(event, handler, false);
     };
   }
    
    observe('input', update);
    observe('cut', update);
    observe('paste', update);
    observe('drop', update);
    observe('keydown', update);

    update();

  });
  
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
  
//})();
