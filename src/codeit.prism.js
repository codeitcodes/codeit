/*
  github
*/

/* 
   
   codeit by @barhatsor
   v2.2.5
   MIT License
   
   github.com/barhatsor/codeit
   
*/

// create a class for the codeit element
class CodeitElement extends HTMLElement {
  
  constructor() {
    
    // always call super first in constructor
    super();
    
    let cd = this;
    
    // add codeit CSS to head
    const css = `cd-el{display:inline-flex;position:relative;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";background:#f1f3f4;color:#333;border-radius:5px;padding:5px;cursor:text}cd-el textarea{background:0 0;color:transparent;position:absolute;border:0;resize:none;font:inherit;letter-spacing:inherit;line-height:inherit;outline:0;caret-color:#000;white-space:pre;display:inline-table;padding:0;min-width:1px;box-sizing:border-box;z-index:1}cd-el pre{margin:0;font:inherit;height:max-content;width:max-content}cd-el code{font:inherit}code[class*=language-],pre[class*=language-]{color:#fff;background:0 0;text-shadow:0 -.1em .2em #000;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}:not(pre)>code[class*=language-],pre[class*=language-]{background:#4c3f33}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto;border:.3em solid #7a6651;border-radius:.5em;box-shadow:1px 1px .5em #000 inset}:not(pre)>code[class*=language-]{padding:.15em .2em .05em;border-radius:.3em;border:.13em solid #7a6651;box-shadow:1px 1px .3em -.1em #000 inset;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#997f66}.token.punctuation{opacity:.7}.token.namespace{opacity:.7}.token.boolean,.token.constant,.token.number,.token.property,.token.symbol,.token.tag{color:#d1939e}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#bce051}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url,.token.variable{color:#f4b73d}.token.atrule,.token.attr-value,.token.keyword{color:#d1939e}.token.important,.token.regex{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}.token.deleted{color:red}`,
          head = document.head,
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
    cd.code.classList = (cd.getAttribute('lang') != undefined) ? cd.getAttribute('lang') : 'js';

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
      
      cd.code.innerHTML = cd.textarea.value;
      
      // resize textarea
      cd.textarea.style.width = cd.pre.clientWidth + 'px';
      cd.textarea.style.height = cd.pre.clientHeight + 'px';
      
      // Returns a highlighted HTML string
      const html = Prism.highlight(cd.textarea.value, Prism.languages.javascript, 'javascript');
      
      cd.code.innerHTML = html;

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
