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
    
    // create a shadow root
    let shadow = this.attachShadow({mode: 'open'});
    
    // add codeit CSS to shadow head
    const css = 'cd{display:inline-flex;position:relative;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";background:#f1f3f4;color:#333;border-radius:5px;padding:5px;cursor:text}cd textarea{background:0 0;color:transparent;position:absolute;border:0;resize:none;font:inherit;letter-spacing:inherit;line-height:inherit;outline:0;caret-color:#000;white-space:pre;display:inline-table;padding:0;min-width:1px;box-sizing:border-box;z-index:1}cd pre{margin:0;font:inherit;letter-spacing:inherit;line-height:inherit;height:max-content;width:max-content}cd code{display:inline-block;color:#333}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
          style = document.createElement('style');
    
    shadow.appendChild(style);
    style.appendChild(document.createTextNode(css));
    
    // create codeit elements
    this.textarea = document.createElement('textarea');

    this.pre = document.createElement('pre');
    this.code = document.createElement('code');
    
    // style codeit textarea
    this.textarea.setAttribute('spellcheck', 'false');
    this.textarea.setAttribute('autocorrect', 'off');
    this.textarea.setAttribute('autocomplete', 'off');
    this.textarea.setAttribute('aria-autocomplete', 'list');
    this.textarea.setAttribute('autocapitalize', 'off');
    
    this.textarea.setAttribute('rows', 1);

    // highlight with specified lang
    this.code.classList = (this.getAttribute('lang') != undefined) ? this.getAttribute('lang') : 'hljs';

    // parse code
    this.parsedCode = this.innerText.replace(/^\n|\n$/g, '');

    // clear codeit
    this.innerHTML = '';

    // append codeit elements to DOM
    this.appendChild(this.textarea);
    this.appendChild(this.pre);
    this.pre.appendChild(this.code);

    // set codeit textarea value to code
    this.textarea.value = this.parsedCode;

    // init codeit behavior
    new Behave({
      textarea: this.textarea,
      replaceTab: true,
      softTabs: true,
      tabSize: 2,
      autoOpen: true,
      overwrite: true,
      autoStrip: true,
      autoIndent: true
    });

    // update codeit
    
    this.setValue = (code) => {

      this.textarea.value = code;
      this.update();

    }
    
    this.update = () => {

      this.code.innerHTML = escapeHTML(this.textarea.value);
      
      // resize textarea
      this.textarea.style.width = this.pre.clientWidth + 'px';
      this.textarea.style.height = this.pre.clientHeight + 'px';
      
      // if codeit lang not specified, autodetect code lang
      if (this.getAttribute('lang') == undefined) {
        this.code.classList = 'hljs';
      }

      hljs.highlightElement(this.code);

    }
    
    const escapeHTML = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    this.textarea.addEventListener('input', this.update);
    this.textarea.addEventListener('keydown', this.update);
    
    BehaveHooks.add('openChar:after', this.update);
    
    BehaveHooks.add('enter:after', (data) => {
      
      setTimeout(() => {
        
        // if pressed enter on one of last three lines, scroll down
        const firstLine = (data.lines.current == data.lines.total),
              secondLine = (data.lines.current == (data.lines.total - 1)),
              thirdLine = (data.lines.current == (data.lines.total - 2));
        
        if (firstLine || secondLine || thirdLine) {
          this.scrollTop = this.scrollHeight;
        }
        
      }, 0);
      
    });
    
    // focus codeit when clicked
    if (this.getAttribute('editable') != 'false') {
      
      this.addEventListener('click', () => {

        this.textarea.focus();

      });
      
    }
    
    this.update();
    
  }
  
}

// define the codeit element
window.customElements.define('cd-el', CodeitElement);
