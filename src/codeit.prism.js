/*
  github
*/

/* 
   
   codeit by @barhatsor
   v2.3.0
   MIT License
   
   github.com/barhatsor/codeit
   
*/

// create a class for the codeit element
class CodeitElement extends HTMLElement {

  constructor() {

    // call super to get codeit element
    super();

    let cd = this;

    // add codeit CSS to head
    const css = `cd-el{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;color:#333;border-radius:10px;padding:10px;cursor:text;tab-size:2}code[class*=language-],pre[class*=language-]{color:#fff;background:0 0;text-shadow:0 -.1em .2em #000;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}:not(pre)>code[class*=language-],pre[class*=language-]{background:#4c3f33}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto;border:.3em solid #7a6651;border-radius:.5em;box-shadow:1px 1px .5em #000 inset}:not(pre)>code[class*=language-]{padding:.15em .2em .05em;border-radius:.3em;border:.13em solid #7a6651;box-shadow:1px 1px .3em -.1em #000 inset;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#997f66}.token.punctuation{opacity:.7}.token.namespace{opacity:.7}.token.boolean,.token.constant,.token.number,.token.property,.token.symbol,.token.tag{color:#d1939e}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#bce051}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url,.token.variable{color:#f4b73d}.token.atrule,.token.attr-value,.token.keyword{color:#d1939e}.token.important,.token.regex{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}.token.deleted{color:red}`,
      head = document.head,
      style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));

    // if editable property is true
    cd.editable = (cd.getAttribute('editable') == 'false') ? false : true;

    if (cd.editable) {

      // make codeit editable
      cd.setAttribute('contenteditable', 'plaintext-only');
      cd.setAttribute('spellcheck', 'false');
      cd.setAttribute('autocorrect', 'off');
      cd.setAttribute('autocomplete', 'off');
      cd.setAttribute('aria-autocomplete', 'list');
      cd.setAttribute('autocapitalize', 'off');
      cd.setAttribute('data-gramm', 'false');

    }

    // highlight with specified lang
    cd.lang = (cd.getAttribute('lang') != undefined) ? cd.getAttribute('lang') : 'js';

    // parse code
    cd.textContent = cd.textContent.replace(/^\n|\n$/g, '');

    // highlight codeit
    cd.highlight = () => {

      // Returns a highlighted HTML string
      const html = Prism.highlight(cd.textContent, Prism.languages.javascript, 'javascript');

      cd.innerHTML = html;

    }

    function debounce(func, time) {

      window.setTimeout(func, time);
      
    }

    const escapeHTML = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // create a new instance of 'MutationObserver' named 'observer',
    // passing it a callback function

    let updatingHighlight = false;

    let textContentObserver = new MutationObserver(function(mutationsList, observer) {

      // run on all mutations
      mutationsList.forEach(mutation => {

      });

      cd.update();

      console.log('textContent', mutationsList);

    });


    let innerHTMLObserver = new MutationObserver(function(mutationsList, observer) {

      // run on all mutations
      mutationsList.forEach(mutation => {

      });

      cd.update();
      
      console.log('innerHTML', mutationsList);

    });



    // call 'observe' on that MutationObserver instance,
    // passing it the element to observe, and the options object

    var textContentConfig = {
      characterData: false,
      attributes: false,
      childList: true,
      subtree: false
    };
    
    textContentObserver.observe(cd, textContentConfig);

    var innerHTMLConfig = {
      characterData: true,
      attributes: false,
      childList: false,
      subtree: true
    };
    
    innerHTMLObserver.observe(cd, innerHTMLConfig);


    cd.addEventListener('keydown', (event) => {

      //handleNewline(event);

    })

    function getCaretPosInInnerText() {

      var sel = window.getSelection();

      var targetNode = sel.anchorNode; // node of caret
      var caretOffset = sel.anchorOffset; // offset in node

      var overallLength = 0,
          foundNode = false;

      function getTextNodes(node) {

        if (!foundNode) {

          // if reached target node
          if (node != targetNode) {

            // if node type is text
            if (node.nodeType == 3) {
              
              overallLength += node.nodeValue.length;

            } else { // if it's an empty node, this means there's more nodes underneath
              
              // go over his brother leaves
              for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                
                // call recursive call on node's children
                getTextNodes(node.childNodes[i]);

              }
              
            }
          } else {
            
            foundNode = true;
            
            // if not found text node, return
            if (node.nodeType != 3) {
              return false;
            }
            
          }
        }
      }

      // init recursive call
      getTextNodes(cd);

      return overallLength + caretOffset;

    }


    // go over all nodes until reaching the right number of characters
    function getCaretPosAndNode(caretPosInText) {

      var overallLength = 0,
          lastNode;

      function getTextNodes(node) {

        // if not reached the target text
        if (overallLength <= caretPosInText) {

          lastNode = node;

          // if node type is text
          if (node.nodeType == 3) {

            overallLength += node.nodeValue.length;

          } else { // if it's an empty node, this means there's more nodes underneath

            // go over his brother leaves
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
              
              // call recursive call on node's children
              getTextNodes(node.childNodes[i]);

            }
          }
        }
      }
      
      // init recursive call
      getTextNodes(cd);
      
      if (lastNode) {

        let lastNodeLength = lastNode.nodeValue.length;
        
        return {
          startNode: lastNode,
          startOffset: (lastNodeLength - (overallLength - caretPosInText))
        };

      } else {

        return {
          startNode: cd,
          startOffset: 0
        };

      }
    }


    let caretPosInText = 0;
    let prev;

    cd.update = () => {

      if (cd.textContent !== prev) {

        debounceHighlight();

      }

      prev = cd.textContent;

    }

    function debounceHighlight() {
      
      // highlight in async thread
      debounce(() => {
        
        // if codeit is focused
        if (document.activeElement == cd) {
          
          // get caret pos in text
          let caretPosInText = getCaretPosInText(cd);
          
          cd.highlight();
          
          // select pos in text
          cd.select(caretPosInText);

        } else { // no need to select, just highlight
          
          cd.highlight();
          
        }

      }, 30);

    }
    
    cd.select = (caretPosInText) => {
            
      // get caret node and offset
      let c = getCaretPosAndNode(caretPosInText);

      // select
      let s = window.getSelection();
      s.setBaseAndExtent(c.startNode, c.startOffset, c.startNode, c.startOffset);
      
    }

    cd.update();

  }

}

// define the codeit element
window.customElements.define('cd-el', CodeitElement);
