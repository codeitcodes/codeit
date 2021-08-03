/*
  github
*/

/* 
   
   codeit.js
   v2.3.4
   MIT License
   
   github.com/barhatsor/codeit
   
*/

// create a class for the codeit element
class CodeitElement extends HTMLElement {
  
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ['lang', 'edit'];
  }
  
  constructor() {

    // call super to get codeit element
    super();

    let cd = this;

    // add codeit CSS to head
    const css = `cd-el{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;color:#333;border-radius:10px;padding:10px;cursor:text;tab-size:2}cd-el ::selection{background:0 0}code[class*=language-],pre[class*=language-]{color:#fff;background:0 0;text-shadow:0 -.1em .2em #000;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}:not(pre)>code[class*=language-],pre[class*=language-]{background:#4c3f33}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto;border:.3em solid #7a6651;border-radius:.5em;box-shadow:1px 1px .5em #000 inset}:not(pre)>code[class*=language-]{padding:.15em .2em .05em;border-radius:.3em;border:.13em solid #7a6651;box-shadow:1px 1px .3em -.1em #000 inset;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#997f66}.token.punctuation{opacity:.7}.token.namespace{opacity:.7}.token.boolean,.token.constant,.token.number,.token.property,.token.symbol,.token.tag{color:#d1939e}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#bce051}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url,.token.variable{color:#f4b73d}.token.atrule,.token.attr-value,.token.keyword{color:#d1939e}.token.important,.token.regex{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}.token.deleted{color:red}`,
      head = document.head,
      style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
    
    // set default options
    cd.options = {
      tab: '\t',
      catchTab: true,
      preserveIdent: true,
      addClosing: true,
      history: true
    };

    // if edit property is true
    cd.edit = (cd.getAttribute('edit') == 'false') ? false : true;

    if (cd.edit) {

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
    cd.lang = getLang();

    // parse code
    cd.textContent = cd.textContent.replace(/^\n|\n$/g, '');

    // highlight codeit
    cd.highlight = (lang) => {
      
      // returns a highlighted HTML string
      const html = Prism.highlight(cd.textContent, Prism.languages[lang], lang);

      cd.innerHTML = html;

    }

    function debounce(func, time) {

      window.setTimeout(func, time);
      
    }
    

    // create a new instance of 'MutationObserver',
    // passing it a callback function

    const textContentObserver = new MutationObserver(function(mutationsList, observer) {

      cd.update();

    });
    
    const innerHTMLObserver = new MutationObserver(function(mutationsList, observer) {

      cd.update();

    });

    // call 'observe' on that MutationObserver instance,
    // passing it the element to observe, and the options object

    const textContentConfig = { characterData: false, attributes: false, childList: true, subtree: false };
    
    textContentObserver.observe(cd, textContentConfig);
    
    const innerHTMLConfig = { characterData: true, attributes: false, childList: false, subtree: true };

    innerHTMLObserver.observe(cd, innerHTMLConfig);


    cd.addEventListener('keydown', (event) => {

      if (cd.options.preserveIdent) handleNewLine(event);
      if (cd.options.catchTab) handleTabCharacters(event);
      if (cd.options.addClosing) handleSelfClosingCharacters(event);

    })
    
    
    // IDE-style behaviors
        
    function handleNewLine(event) {
      
      if (event.key === 'Enter') {
        
        const before = beforeCursor();
        const after = afterCursor();
        
        let [padding] = findPadding(before);
        let newLinePadding = padding;
        
        // if char before caret is "{" and char after is "}" indent new line
        let bracketOne = (before.slice(-1) === '{');
        let bracketTwo = (after.charAt(0) === '}');
        
        let newLineBracket = (after.charAt(0) === '\n' && after.charAt(1) === '}');
        
        if (bracketOne && (bracketTwo || newLineBracket)) {
          
          // indent new line
          newLinePadding += cd.options.tab;
          
          if (bracketTwo) {
          
            // get caret pos in text
            const pos = cd.getSelection();

            // move adjacent "}" down one line
            insert('\n' + padding);

            // restore pos in text
            cd.setSelection(pos.start);
            
          }
          
        }
        
        if (newLinePadding) {
          
          event.stopPropagation();
          event.preventDefault();
          
          insert('\n' + newLinePadding);
          
        }
        
      }
      
    }
    
    function handleTabCharacters(event) {
      
      if (event.key === 'Tab') {
        
        event.preventDefault();
        
        if (event.shiftKey) {
          
          const before = beforeCursor();
          
          // get padding of line
          let [padding, start] = findPadding(before);
          
          if (padding.length > 0) {
            
            // get caret pos in text
            let pos = cd.getSelection();
            
            // remove full length tab or just remaining padding
            const len = Math.min(cd.options.tab.length, padding.length);
            cd.setSelection(start + 1);
            document.execCommand('delete');
            pos.start -= len;
            
            // restore pos in text
            cd.setSelection(pos.start);
            
          }
          
        } else {
          
          // add tab
          insert(cd.options.tab);
          
        }
        
      }
      
    }
    
    function handleSelfClosingCharacters(event) {
      
      const open = `([{'"`;
      const close = `)]}'"`;
      
      const codeAfter = afterCursor();
      const codeBefore = beforeCursor();
      
      const escapeCharacter = codeBefore.substr(codeBefore.length - 1) === '\\';
      const charAfter = codeAfter.charAt(0);
      
      if (close.includes(event.key) && !escapeCharacter && charAfter === event.key) {
        
        // closing char already exists next to cursor,
        // move right
        
        const pos = cd.getSelection();
        
        event.preventDefault();
        pos.start = ++pos.end;
        
        cd.setSelection(pos.start);
        
      } else if (
        open.includes(event.key)
        && !escapeCharacter
        && (`"'`.includes(event.key) || ['', ' ', '\n'].includes(charAfter))
      ) {
        
        event.preventDefault();
        
        const pos = cd.getSelection();
        
        const wrapText = pos.start == pos.end ? '' : window.getSelection().toString();
        const text = event.key + wrapText + close[open.indexOf(event.key)];
        
        insert(text);
        pos.start++;
        pos.end++;
        
        cd.setSelection(pos.start);
        
      }
    }
    
    function beforeCursor() {
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);
      const r = document.createRange();
      r.selectNodeContents(cd);
      r.setEnd(r0.startContainer, r0.startOffset);
      return r.toString();
    }
    
    function afterCursor() {
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);
      const r = document.createRange();
      r.selectNodeContents(cd);
      r.setStart(r0.endContainer, r0.endOffset);
      return r.toString();
    }
    
    function findPadding(text) {
      
      // find beginning of previous line
      let i = text.length - 1;
      while (i >= 0 && text[i] !== '\n') i--;
      i++;
      
      // find padding of previous line
      let j = i;
      while (j < text.length && /[ \t]/.test(text[j])) j++;
      return [text.substring(i, j) || '', i, j];
      
    }
    
    cd.findPaddingThisLine = (text) => {
      
      // find beginning of this line
      let i = text.length - 1;
      while (i >= 0 && text[i] !== cd.options.tab) i--;
      i++;
      
      // find padding of previous line
      let j = i;
      while (j >= 0 && text[j] !== '\n') j--;
      j--;
      
      return [text.substring(i, j) || '', i, j];
      
    }
    
    function insert(text) {
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      document.execCommand('insertHTML', false, text);
    }
    
    
    cd.prev = '';
    
    cd.update = () => {

      if (cd.textContent !== '' && cd.textContent !== cd.prev) {
        
        debounceHighlight();
        
      }

      cd.prev = cd.textContent;

    }

    function debounceHighlight() {
      
      // highlight in async thread
      debounce(() => {
        
        // if codeit is focused
        if (document.activeElement == cd) {
          
          // get caret pos in text
          const pos = cd.getSelection();
          
          cd.lang = getLang();
          cd.highlight(cd.lang);
          
          // restore pos in text
          cd.setSelection(pos.start);

        } else { // no need to move caret, just highlight
          
          cd.lang = getLang();
          cd.highlight(cd.lang);
          
        }

      }, 30);

    }
    
    function getLang() {
      
      // highlight with specified lang
      if (cd.getAttribute('lang') != undefined && cd.getAttribute('lang') != '') {

        return cd.getAttribute('lang');

      } else {

        return 'plaintext';
        
      }
      
    }
    
    cd.setSelection = (startPos, endPos) => {
      
      let c;
      
      if (endPos) {
        
        // get caret node and offset
        c = getCaretNode(startPos, endPos);
      
      } else {
        
        // get caret node and offset
        c = getCaretNode(startPos);
        
      }

      // select
      const s = window.getSelection();
      s.setBaseAndExtent(c.startNode, c.startOffset, c.endNode, c.endOffset);
      
    }
    
    // get caret pos in text
    cd.getSelection = () => {
      
      function getCaretPos(targetNode, caretOffset) { 

        let overallLength = 0,
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
      
      const s = window.getSelection();
      
      // if selection is collapsed
      if (s.isCollapsed) {
        
        // get only start position of caret
        const startPos = getCaretPos(s.anchorNode, s.anchorOffset);
        
        return {
          start: startPos,
          end: startPos
        };
        
      } else {
        
        // get start and end positions of caret
        const startPos = getCaretPos(s.anchorNode, s.anchorOffset);
        const endPos = getCaretPos(s.focusNode, s.focusOffset);
        
        return {
          start: startPos,
          end: endPos
        };
        
      }

    }


    // go over all nodes until reaching the right number of characters
    function getCaretNode(startPos, endPos) {
      
      function getCaretTextNode(caretPosInText) {

        let overallLength = 0,
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

          const lastNodeLength = lastNode.nodeValue.length;

          return [
            lastNode,
            (lastNodeLength - (overallLength - caretPosInText))
          ];

        } else {

          return [
            cd,
            0
          ];

        }
        
      }
      
      // if start and end pos exist
      if (endPos && startPos !== endPos) {
        
        // get start and end nodes
        const [startNode, startOffset] = getCaretTextNode(startPos);
        const [endNode, endOffset] = getCaretTextNode(endPos);

        return {
          startNode: startNode,
          startOffset: startOffset,
          endNode: endNode,
          endOffset: endPos
        };
        
      } else {
        
        // get start nodes
        const [startNode, startOffset] = getCaretTextNode(startPos);

        return {
          startNode: startNode,
          startOffset: startOffset,
          endNode: startNode,
          endOffset: startOffset
        };
        
      }
      
    }

    cd.update();

  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    
    let cd = this;
    
    // if changed codeit lang
    if (name == 'lang' && oldValue !== newValue) {
      
      // force highlight
      cd.prev = '';
      cd.update();
      
    } else if (name == 'edit') { // if changed codeit edit property
      
      // get edit property
      cd.edit = (newValue == 'false') ? false : true;

      if (cd.edit) {

        // make codeit editable
        cd.setAttribute('contenteditable', 'plaintext-only');
        cd.setAttribute('spellcheck', 'false');
        cd.setAttribute('autocorrect', 'off');
        cd.setAttribute('autocomplete', 'off');
        cd.setAttribute('aria-autocomplete', 'list');
        cd.setAttribute('autocapitalize', 'off');
        cd.setAttribute('data-gramm', 'false');

      } else {
        
        // make codeit uneditable
        cd.setAttribute('contenteditable', 'false');
        
      }
      
    }

  }
  
}

// define the codeit element
window.customElements.define('cd-el', CodeitElement);
