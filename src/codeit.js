/*
  github
*/

/* 
   
   codeit.js
   v2.4.4
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
    const css = `cd-el{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;overflow:auto;font-size:14px;line-height:1.5;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;color:#333;border-radius:10px;padding:10px;cursor:text;tab-size:2}code[class*=language-],pre[class*=language-]{color:#000;background:0 0;font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:2;-o-tab-size:2;tab-size:2;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{background:#b3d4fc}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{background:#b3d4fc}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#f5f2f0}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#708090}.token.punctuation{color:#999}.token.namespace{opacity:.7}.token.boolean,.token.constant,.token.deleted,.token.number,.token.property,.token.symbol,.token.tag{color:#905}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#690}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url{color:#9a6e3a}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.class-name,.token.function{color:#dd4a68}.token.important,.token.regex,.token.variable{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}`,
          head = document.head,
          style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
    
    // set default options
    cd.options = {
      tab: '  ',
      
      catchTab: true,
      preserveIdent: true,
      addClosing: true,
      
      openBrackets: ['(', '[', '{'],
      closeBrackets: [')', ']', '}'],
      
      quot: [`'`, `"`, '`'],
      
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

    // highlight codeit
    cd.highlight = (lang) => {
      
      // change codeit class to given language
      const prefix = 'language-';
      const classes = cd.className.split(' ').filter(c => !c.startsWith(prefix));
      cd.className = classes.join(' ').trim();
      
      if (lang != null) cd.classList.add('language-' + lang);
      else cd.classList.add('language-plain');
      
      // highlight element
      Prism.highlightElement(cd);

    }
    
    cd.history = [];
    
    let at = -1;
    let recording = false;
    
    function shouldRecord(event) {
      
      return !isUndo(event) && !isRedo(event)
        && event.key !== 'Meta'
        && event.key !== 'Control'
        && event.key !== 'Alt'
        && !event.key.startsWith('Arrow');
      
    }
    
    function debounceRecordHistory() {
      
      // if change originated from 
      if (recording) {
        
        recording = false;
        return;
        
      }
      
      debounce(() => {
        
        recordHistory();
        recording = false;
      
      }, 300);
      
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
      
      if (cd.options.addClosing) handleDelClosingCharacters(event);
      
      if (cd.options.preserveIdent) handleDelNewLine(event);
      
      if (cd.options.catchTab) handleTabCharacters(event);
      
      if (cd.options.addClosing) handleSelfClosingCharacters(event);
      
      if (cd.options.history) {
        handleUndoRedo(event);
        if (shouldRecord(event) && !recording) {
          recordHistory();
          recording = true;
        }
      }
      
    })
    
    
    // IDE-style behaviors
        
    function handleNewLine(event) {
      
      if (event.key === 'Enter') {
        
        const before = beforeCursor();
        const after = afterCursor();

        let [padding] = getPadding(before);
        let newLinePadding = padding;
        
        const charBefore = before.slice(-1);
        const charAfter = after.charAt(0);
        
        // if char before caret is opening bracket
        // and char after is closing bracket indent new line
        let bracketOne = (cd.options.openBrackets.includes(charBefore));
        let bracketTwo = (charAfter ===
                          cd.options.closeBrackets[ cd.options.openBrackets.indexOf( charBefore ) ]);
        
        let newLineBracket = (charAfter === '\n'
                              && cd.options.closeBrackets.includes( after.charAt(1) ));
        
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
    
    function handleDelNewLine(event) {
      
      if (event.key === 'Backspace' || event.key === 'Delete') {
        
        const before = beforeCursor();
        
        let [padding, start] = getPadding(before);
        
        if (padding.length > 0) {
          
          // get caret pos in text
          let pos = cd.getSelection();

          // if selection is empty and caret is next to tabs
          if (pos.start === pos.end && start === pos.start) {
            
            for (let i = 0; i < padding.length; i++) document.execCommand('delete');
            
          }
          
        }
      
      }
      
    }
    
    function handleTabCharacters(event) {
      
      if (event.key === 'Tab') {
        
        event.preventDefault();
        
        if (event.shiftKey) {
          
          const before = beforeCursor();
          
          // get padding of line
          let [padding, start] = getPadding(before);
          
          // get caret pos in text
          let pos = cd.getSelection();
          
          if (padding.length > 0) {

            const tabLength = cd.options.tab.length;
          
            // remove full length tab
            
            cd.setSelection(start + tabLength);
            
            for (let i = 0; i < tabLength; i++) document.execCommand('delete');
            
            pos.start -= tabLength;
            
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
      
      const open = cd.options.openBrackets.join('') + cd.options.quot.join('');
      const close = cd.options.closeBrackets.join('') + cd.options.quot.join('');
      
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
        && (cd.options.quot.includes(event.key)
            || ['', ' ', '\n'].includes(charAfter))
      ) {
        
        event.preventDefault();
        
        const pos = cd.getSelection();
        
        const wrapText = pos.start == pos.end ? '' : window.getSelection().toString();
        const text = event.key + wrapText + close[open.indexOf(event.key)];
        
        insert(text);
        pos.start++;
        pos.end++;
        
        cd.setSelection(pos.end);
        
      }
    }
    
    function handleDelClosingCharacters(event) {
      
      if (event.key === 'Backspace' || event.key === 'Delete') {
        
        const open = cd.options.openBrackets.join('') + cd.options.quot.join('');
        const close = cd.options.closeBrackets.join('') + cd.options.quot.join('');

        const codeAfter = afterCursor();
        const codeBefore = beforeCursor();
        
        const charBefore = codeBefore.slice(-1);
        const charAfter = codeAfter.charAt(0);
        
        // if deleting self closing characters
        const closeCharAdjacent = (
          close.includes(charAfter)
          && charBefore === open[close.indexOf(charAfter)]
        );
        
        // if deleting brackets with whitespace in between
        const closeCharWhitespace = (
          [' ', '\n'].includes(charAfter)
          && cd.options.closeBrackets.includes(codeAfter.charAt(1))
          && charBefore === open[close.indexOf(codeAfter.charAt(1))]
        );
        
        // get caret pos in text
        const pos = cd.getSelection();
        
        if ((closeCharAdjacent || closeCharWhitespace)
            && pos.start === pos.end) {
          
          // delete chars after
          if (closeCharWhitespace) {
            
            cd.setSelection(pos.start + 2);
            document.execCommand('delete');
            
          } else { // delete char after
            
            cd.setSelection(pos.start + 1);
            
          }
          
          document.execCommand('delete');
          
        }
        
      }
      
    }
    
    function handleUndoRedo(event) {
      
      if (isUndo(event)) {
        
        event.preventDefault();
        
        at--;
        const record = cd.history[at];
                
        if (record) {
          
          cd.innerHTML = record.html;
          cd.setSelection(record.pos.start);
          
        }
        
        if (at < 0) at = 0;
        
      }
      
      if (isRedo(event)) {
        
        event.preventDefault();
        
        at++;
        const record = cd.history[at];
        
        if (record) {
          
          cd.innerHTML = record.html;
          cd.setSelection(record.pos);
          
        }
        
        if (at >= cd.history.length) at--;
        
      }
    }

    function recordHistory() {
      
      // if codeit not focused
      if (document.activeElement != cd) return;

      const html = cd.innerHTML;
      
      // get caret pos in text
      const pos = cd.getSelection();

      const lastRecord = cd.history[at];
      
      if (lastRecord) {
        
        if (lastRecord.html === html
          && lastRecord.pos.start === pos.start
          && lastRecord.pos.end === pos.end) return;
        
      }

      at++;
      cd.history[at] = {html, pos};
      cd.history.splice(at + 1);

      const maxHistory = 300;
      if (at > maxHistory) {
        
        at = maxHistory;
        cd.history.splice(0, 1);
        
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
    
    function getPadding(text) {
      
      const tabLength = cd.options.tab.length;
      
      // find beginning of previous line
      let i = text.length - 1;
      while (i >= 0 && text[i] !== '\n') i--;
      i++;
      
      // find padding of previous line
      let thisLine = text.substr(i);
      let linePadding = '';
      while (thisLine.length > 0 && isTab(thisLine.substr(0, tabLength))) {
        
        thisLine = thisLine.slice(tabLength, -1);
        linePadding += cd.options.tab;
        
      }
      
      return [linePadding, i];
      
    }
    
    function isTab(str) {
      
      return str === cd.options.tab;
      
    }
    
    function isCtrl(event) {
      return event.metaKey || event.ctrlKey;
    }

    function isUndo(event) {
      return isCtrl(event) && !event.shiftKey && event.code === 'KeyZ';
    }

    function isRedo(event) {
      return isCtrl(event) && event.shiftKey && event.code === 'KeyZ';
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
        
        // if codeit is focused
        if (document.activeElement == cd) {
          
          debounceRecordHistory();
          
        }

      }

      cd.prev = cd.textContent;

    }

    function debounceHighlight() {
      
      // highlight in async thread
      debounce(() => {
        
        // get caret pos in text
        const pos = cd.getSelection();

        // highlight codeit
        cd.highlight(cd.lang);

        // restore pos in text
        cd.setSelection(pos.start);

      }, 30);

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
      
      // collapse empty text nodes
      cd.normalize();
      
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
        
        // if text node exists
        if (lastNode && lastNode.nodeValue) {

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
console.log('%ccodeit.js 2.4.4', 'font-style: italic; color: gray');
