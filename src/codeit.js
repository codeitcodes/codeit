/*
  github
*/

/* 
   
   codeit by @barhatsor
   v2.2.2
   MIT License
   
   github.com/barhatsor/codeit
   
*/

// create a class for the codeit element
class CodeitElement extends HTMLElement {
  
  constructor() {
    
    // always call super first in constructor
    super();
    
    let cd = this;
    
    // create a shadow root
    let shadow = this.attachShadow({mode: 'open'});
    
    // add codeit CSS to shadow head
    const css = 'cd{display:inline-flex;position:relative;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";background:#f1f3f4;color:#333;border-radius:5px;padding:5px;cursor:text}cd textarea{background:0 0;color:transparent;position:absolute;border:0;resize:none;font:inherit;letter-spacing:inherit;line-height:inherit;outline:0;caret-color:#000;white-space:pre;display:inline-table;padding:0;min-width:1px;box-sizing:border-box;z-index:1}cd pre{margin:0;font:inherit;letter-spacing:inherit;line-height:inherit;height:max-content;width:max-content}cd code{display:inline-block;color:#333}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
          head = shadow.head,
          style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
    
    // create codeit elements
    cd.textarea = document.createElement('textarea');

    cd.pre = document.createElement('pre');
    cd.code = document.createElement('code');
    
    // style codeit textarea
    cd.textarea.setAttribute('spellcheck', 'false');
    cd.textarea.setAttribute('autocorrect', 'off');
    cd.textarea.setAttribute('autocomplete', 'off');
    cd.textarea.setAttribute('aria-autocomplete', 'list');
    cd.textarea.setAttribute('autocapitalize', 'off');
    
    cd.textarea.setAttribute('rows', 1);

    // highlight with specified lang
    cd.code.classList = (cd.getAttribute('lang') != undefined) ? cd.getAttribute('lang') : 'hljs';

    // parse code
    cd.parsedCode = cd.innerText.replace(/^\n|\n$/g, '');

    // clear codeit
    cd.innerHTML = '';

    // append codeit elements to DOM
    cd.appendChild(cd.textarea);
    cd.appendChild(cd.pre);
    cd.pre.appendChild(cd.code);

    // set codeit textarea value to code
    cd.textarea.value = cd.parsedCode;

    // init codeit behavior
    new Behave({
      textarea: cd.textarea,
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

      cd.textarea.value = code;
      cd.update();

    }
    
    cd.update = () => {

      cd.code.innerHTML = escapeHTML(cd.textarea.value);
      
      // resize textarea
      cd.textarea.style.width = cd.pre.clientWidth + 'px';
      cd.textarea.style.height = cd.pre.clientHeight + 'px';
      
      // if codeit lang not specified, autodetect code lang
      if (cd.getAttribute('lang') == undefined) {
        cd.code.classList = 'hljs';
      }

      hljs.highlightElement(cd.code);

    }
    
    const escapeHTML = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    cd.textarea.addEventListener('input', cd.update);
    cd.textarea.addEventListener('keydown', cd.update);
    
    BehaveHooks.add('openChar:after', cd.update);
    
    BehaveHooks.add('enter:after', (data) => {
      
      setTimeout(() => {
        
        // if pressed enter on one of last three lines, scroll down
        const firstLine = (data.lines.current == data.lines.total),
              secondLine = (data.lines.current == (data.lines.total - 1)),
              thirdLine = (data.lines.current == (data.lines.total - 2));
        
        if (firstLine || secondLine || thirdLine) {
          cd.scrollTop = cd.scrollHeight;
        }
        
      }, 0);
      
    });
    
    // focus codeit when clicked
    if (cd.getAttribute('editable') != 'false') {
      
      cd.addEventListener('click', () => {

        cd.textarea.focus();

      });
      
    }
    
    cd.update();
    
  }
  
}

// define the codeit element
window.customElements.define('cd-el', CodeitElement);
