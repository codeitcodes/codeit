/*

   codeit.js
   v3.0.8
   MIT License

   https://codeit.codes

*/


// create a class for the codeit element
class CodeitElement extends HTMLElement {

  // specify observed attributes so
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
      cd.setAttribute('enterkeyhint', 'enter');

    }

    // create codeit custom events
    const typeEvent = new CustomEvent('type');
    const caretMoveEvent = new CustomEvent('caretmove');


    // highlight codeit
    cd.highlight = async (lang) => {

      // change codeit class to given language
      const prefix = 'language-';
      const classes = cd.className.split(' ').filter(c => !c.startsWith(prefix));
      cd.className = classes.join(' ').trim();

      if (lang != null) cd.classList.add('language-' + lang);
      else cd.classList.add('language-plain');
      
      const textToHighlight = cd.textContent;
      
      if (textToHighlight && textToHighlight !== '' && textToHighlight !== '\n'
          && lang !== 'none' && lang !== 'plain') {
        
        let langLoaded = true;
        
        // if language isn't loaded
        if (!isLangLoaded(lang)) {
          
          // load language
          await new Promise(resolve => {
            
            try {
              
              Prism.plugins.autoloader.loadLanguages(lang, resolve, () => {

                langLoaded = false;
                resolve();

              });
              
            } catch(e) {
              
              langLoaded = false;
              resolve();
              
            }
            
          });
          
        }
        
        
        if (langLoaded) {
          
          const highlightHTML = Prism.highlight(textToHighlight,
                                                Prism.languages[lang],
                                                lang);

          cd.innerHTML = highlightHTML;

          Prism.hooks.run('complete', { element: cd });
          
        }
        
      }

    }
    
    // returns whether the given language is currently loaded.
    function isLangLoaded(lang) {
      
      if (lang in Prism.languages) {
        // the given language is already loaded
        return true;
      }
      
    }

    let highlightTimeout;
    function debounceHighlight() {

      if (cd.textContent && cd.textContent !== '') {

        // if text is big, highlight cursor node first,
        // then highlight rest of codeit when finished typing
        if (cd.textContent.length > 5000 &&
            document.activeElement === cd) {

          // get caret pos in text
          const pos = cd.getSelection();

          // highlight cursor node
          highlightCursorNode();

          // restore pos in text
          cd.setSelection(pos.start, pos.end);


          // clear highlight timeout
          if (highlightTimeout) window.clearTimeout(highlightTimeout);

          // set new timeout
          highlightTimeout = window.setTimeout(() => {

            // get caret pos in text
            const pos = cd.getSelection();

            // highlight codeit
            cd.highlight(cd.lang);

            // restore pos in text
            cd.setSelection(pos.start, pos.end);

          }, 420);

        } else if (document.activeElement === cd) {
          
          // get caret pos in text
          const pos = cd.getSelection();

          cd.highlight(cd.lang);

          // restore pos in text
          cd.setSelection(pos.start, pos.end);

        } else {
          
          cd.highlight(cd.lang);
          
        }
      
      } else {
        
        cd.textContent = '\n';
        
      }

    }

    // highlight cursor node
    function highlightCursorNode() {

      const cursor = cd.dropper.cursor();

      let elToHighlight = cursor.startContainer;
      let textToHighlight;
      
      if (elToHighlight !== cd) {

        if (!String(elToHighlight.parentElement.classList).includes('language-')) {

          elToHighlight = elToHighlight.parentElement;
          textToHighlight = elToHighlight.textContent;

        } else {

          textToHighlight = elToHighlight.nodeValue;

        }

        if (textToHighlight !== '') {

          let highlightLang = Prism.util.getLanguage(elToHighlight);
          
          if (highlightLang === 'none') highlightLang = 'plain';
          
          
          let highlightHTML = Prism.highlight(textToHighlight,
                                              Prism.languages[highlightLang],
                                              highlightLang);

          const frag = createHTMLFrag(highlightHTML);

          elToHighlight.replaceWith(frag);
          
        }
        
      } else {
        
        cd.highlight(cd.lang);
        
      }

    }

    function createHTMLFrag(htmlStr) {

      var frag = document.createDocumentFragment(),
        temp = document.createElement('div');

      temp.innerHTML = htmlStr;

      while (temp.firstChild) {

        frag.appendChild(temp.firstChild);

      }

      return frag;

    }


    cd.history = [];

    let at = -1;
    let recording = false;

    function shouldRecord(event) {

      return !isUndo(event) && !isRedo(event)

        && event.key !== 'Meta'
        && event.key !== 'Control'
        && event.key !== 'Alt'
        && event.key !== 'Shift'
        && event.key !== 'CapsLock'
        && event.key !== 'Escape'

        && !event.key.startsWith('Arrow')
        && !isCtrl(event);

    }

    cd.on = (events, callback, passive) => {

      events.split(' ').forEach(evt => {

        cd.addEventListener(evt, callback, passive);

      });

    }

    function onNextFrame(func) {

      window.requestAnimationFrame(func);

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


    cd.on('keydown', (event) => {

      // get current selection
      const s = window.getSelection();

      // if selection is empty
      if (s.isCollapsed) {

        if (cd.options.preserveIdent) handleNewLine(event);

        if (cd.options.addClosing) handleDelClosingCharacters(event);

        if (cd.options.preserveIdent) handleDelNewLine(event);

        if (cd.options.preserveIdent) alignBracket(event);

      }

      if (cd.options.catchTab) handleTabCharacters(event);
      
      if (cd.options.addClosing) handleSelfClosingCharacters(event);
      
      if (cd.options.history) {

        handleUndoRedo(event);

        if (shouldRecord(event) && !recording) {

          recordHistory();
          recording = true;

        }

      }
      
      overrideDeleteText(event);

    });

    cd.on('keyup', (event) => {

      if (shouldRecord(event) && recording) {

        onNextFrame(recordHistory);
        recording = false;

      }

    });

        
    cd.on('keydown mousedown mouseup touchstart touchend focus blur',
      () => { onNextFrame(checkCaretPosEvent) }, false);
    
    
    cd.on('cut', (e) => {
      
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      selection.deleteFromDocument();
      
      const text = window.getSelection().toString();
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();

      cd.dispatchEvent(typeEvent);
      
    });
    
    cd.on('copy', (e) => {
      
      const text = window.getSelection().toString();
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
      
    });
    
    cd.on('paste', (e) => {
      
      let paste = e.clipboardData.getData('text');
      
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      
      if (hashCode(paste) === hashCode(cd.textContent)) {

        selection.getRangeAt(0).collapse();
        
      } else {
      
        selection.deleteFromDocument();
        
        cd.insert(paste);
        
        cd.dispatchEvent(typeEvent);
        
      }
      
      e.preventDefault();
      
    });
    
    
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

        let newLineBracket = (charBefore === '{' &&
                              [closingBracketNextToCursor(after)] );

        if (bracketOne && (bracketTwo || newLineBracket)) {

          // indent new line
          newLinePadding += cd.options.tab;

          if (bracketTwo) {

            // get caret pos in text
            const pos = cd.getSelection();

            // move adjacent "}" down one line
            cd.insert('\n' + padding, { moveToEnd: false });

          }

        }

        if (cd.lang === 'python' && charBefore === ':') {

          // indent new line
          newLinePadding += cd.options.tab;

        }

        if (newLinePadding) {

          event.stopPropagation();
          event.preventDefault();

          cd.insert('\n' + newLinePadding);

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
          if (pos.start === pos.end && (start + padding.length) === pos.start) {

            for (let i = 0; i < padding.length; i++) cd.deleteCurrentSelection();

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

            for (let i = 0; i < tabLength; i++) cd.deleteCurrentSelection();

            pos.start -= tabLength;
            pos.end -= tabLength;

            // restore pos in text
            cd.setSelection(pos.start, pos.end);

          }

        } else {
          
          // get current selection
          const s = window.getSelection();

          let selContents = s.toString();
          
          // if selection exists
          if (!s.isCollapsed) {
            
            if (selContents.includes('\n')) {
              
              // tab lines in selection
              selContents = selContents.split('\n').join('\n' + cd.options.tab);
              
              // insert tabbed selection
              cd.deleteCurrentSelection();
              cd.insert(selContents);
              
            } else {
              
              // tab selection
              const sel = cd.getSelection();
              
              cd.setSelection(Math.min(sel.start, sel.end));
              
              // insert tab at start of selection
              cd.insert(cd.options.tab);
              
              // reselect text
              
              sel.start += cd.options.tab.length;
              sel.end += cd.options.tab.length;
              
              cd.setSelection(sel.start, sel.end);
              
            }
            
          } else {
            
            // insert tab on current line
            cd.insert(cd.options.tab);
            
          }

        }

      }

    }

    function handleSelfClosingCharacters(event) {

      const cursor = cd.dropper.cursor();
      const inStringOrComment = (cursor.in('string') || cursor.in('comment'));

      // if cursor is not in string or comment
      if (!inStringOrComment) {

        // join brackets and quotation marks
        // to get chars to autocomplete
        const open = cd.options.openBrackets.join('') + cd.options.quot.join('');
        const close = cd.options.closeBrackets.join('') + cd.options.quot.join('');

        // get code before and after cursor
        const codeAfter = afterCursor();
        const codeBefore = beforeCursor();

        const charBefore = codeBefore.slice(-1);
        const charAfter = codeAfter.charAt(0);

        // check if typed an opening or closing char
        const typedOpeningChar = open.includes(event.key);
        const typedClosingChar = close.includes(event.key);

        // closing char is next to cursor if
        // the chars before and after the cursor are
        // matching opening and closing chars
        const closingCharNextToCursor = (charBefore === open[close.indexOf(event.key)]
                                         && charAfter === event.key);

        // if typed opening char
        if (typedOpeningChar) {

          // if selection exists
          if (!cursor.collapsed) {

            // prevent default behavior
            event.preventDefault();

            // get the text to wrap
            const textToWrap = window.getSelection().toString();

            // wrap the text with matching opening and closing chars
            const wrappedText = event.key + textToWrap + close[open.indexOf(event.key)];

            // delete current selection
            cd.deleteCurrentSelection();

            // insert wrapped text
            cd.insert(wrappedText, { moveToEnd: false });
            
            // get caret pos in text
            const pos = cd.getSelection();
            
            // restore pos in text
            cd.setSelection(pos.start, (pos.start + wrappedText.length));

          } else {
            
            // get caret pos in text
            const pos = cd.getSelection();

            // if cursor is on last line
            if (pos.start === cd.textContent.length) {
              
              // insert newline
              cd.insert((close[open.indexOf(event.key)] + '\n'), { moveToEnd: false });
              
            } else {

              // insert matching closing char
              cd.insert(close[open.indexOf(event.key)], { moveToEnd: false });
              
            }

          }

        }

        // if typed closing char but closing char
        // is already next to cursor
        if (typedClosingChar && closingCharNextToCursor) {

          // prevent default behavior
          event.preventDefault();

          // get caret pos in text
          const pos = cd.getSelection();

          // move caret one char right
          pos.start++;
          cd.setSelection(pos.start);

        }

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

        let closeCharAdjacent = false;

        let closeCharWhitespace = false;
        let closeCharPadding = 0;

        // if the char before is not an opening bracket
        if (charBefore !== '{') {

          // check if a closing char is nearby
          closeCharAdjacent = (
            close.includes(charAfter)
            && charBefore === open[close.indexOf(charAfter)]
          );

        } else { // if the char before is an opening bracket

          // check if a closing bracket is nearby
          [closeCharWhitespace, closeCharPadding] = closingBracketNextToCursor(codeAfter);

        }

        // get caret pos in text
        const pos = cd.getSelection();

        if ((closeCharAdjacent || closeCharWhitespace)
            && pos.start === pos.end) {

          // delete chars after
          if (closeCharWhitespace) {

            cd.setSelection(pos.start, pos.start + closeCharPadding);

          } else { // delete char after

            cd.setSelection(pos.start + 1);

          }

          cd.deleteCurrentSelection();

        }

      }

    }

    // check if next line contains bracket
    function closingBracketNextToCursor(text) {

      // check if this line contains closing bracket
      let i = 0;
      while (i < text.length && text[i] !== '\n' && text[i] !== '}') {

        // if there's text between the brackets, return false
        if (text[i] !== ' ' && text[i] !== '\t') return [false, 0];

        i++;

      }

      // if this line contains closing bracket, return its location
      if (text[i] === '}') return [true, i+1];

      // find beginning of next line
      while (i < text.length && text[i] !== '\n') i++;
      i++;

      // check if next line contains bracket
      while (i < text.length && text[i] !== '\n' && text[i] !== '}') i++;

      return [(text[i] === '}'), i+1];

    }

    function alignBracket(event) {

      // if typed a closing bracket
      if (event.key === '}') {

        const textBefore = beforeCursor();

        // if bracket pair is a one-liner, return
        if (isOneLiner(textBefore)) return;

        // run on all text to cursor, and find the matching padding
        let bracketArr = [];
        let i = 0;

        while (textBefore.length > 0 && (i < textBefore.length)) {

          if (textBefore[i] == '{') {

            const bracketRange = cd.dropper.atTextPos(i);

            if (bracketRange.in('punctuation')) {

              const textBeforeBracket = textBefore.substr(0, i);

              const [padding] = getPadding(textBeforeBracket);

              bracketArr.push(padding);

            }

            bracketRange.detach();

          } else if (textBefore[i] == '}') {

            const bracketRange = cd.dropper.atTextPos(i);

            if (bracketRange.in('punctuation')) {

              bracketArr.pop();

            }

            bracketRange.detach();

          }

          i++;

        }

        if (bracketArr.length > 0) {

          const newPadding = bracketArr[bracketArr.length-1];

          const [oldPadding, startPos] = getPadding(textBefore);

          // remove old padding
          cd.setSelection(startPos, startPos + oldPadding.length);
          cd.deleteCurrentSelection();

          // insert new padding
          cd.insert(newPadding);

        }

      }

    }

    // check if there's text
    // on the same line as closing bracket
    function isOneLiner(text) {

      // go back text and stop when encountered
      // a char that isn't a space or a tab
      let i = text.length - 1;
      while (i >= 0 && (text[i] === ' ' || text[i] === '\t')) i--;

      return (text[i] !== '\n' || text[text.length - 1] === '\n');

    }

    cd.dropper = {};

    // check if a range is in an element
    // with a given class
    cd.dropper.isIn = (className, range) => {

      const container = range.startContainer;
      
      if (container.parentElement
          .classList.contains(className)) {
        
        return true;
        
      }
      
      return false;

    }

    // drop range at position in text
    cd.dropper.atTextPos = (startPos) => {

      // get cursor node and offset
      const cursor = getCaretNode(startPos);

      // send new range to node and offset
      const newRange = document.createRange();
      newRange.setStart(cursor.startNode, cursor.startOffset);
      newRange.setEnd(cursor.endNode, cursor.endOffset);

      newRange.in = (className) => {

        return cd.dropper.isIn(className, newRange);

      }

      newRange.getParent = () => {

        return newRange.startContainer.parentElement;

      }

      return newRange;

    }

    // get current range
    cd.dropper.cursor = () => {

      // get current selection
      const s = window.getSelection();

      // if selection exists
      if (s.rangeCount > 0) {

        let currRange = s.getRangeAt(0);

        currRange.in = (className) => {

          return cd.dropper.isIn(className, currRange);

        }

        currRange.getParent = () => {

          return currRange.startContainer.parentElement;

        }

        return currRange;

      }

    }

    let prevCaretPos = {};
    function checkCaretPosEvent() {

      if (document.activeElement === cd) {

        const newCaretPos = cd.getSelection();

        // if caret pos has changed
        if ((prevCaretPos.start &&
             prevCaretPos.start !== newCaretPos.start)
            || (prevCaretPos.end &&
                prevCaretPos.end !== newCaretPos.end)) {

          // dispatch custom event
          cd.dispatchEvent(caretMoveEvent);

        }

        prevCaretPos = newCaretPos;

      } else {

        // dispatch custom event
        cd.dispatchEvent(caretMoveEvent);

      }

    }

    function handleUndoRedo(event) {

      if (isUndo(event)) {

        event.preventDefault();

        at--;
        const record = cd.history[at];

        if (record) {

          cd.innerHTML = record.html;
          cd.setSelection(record.pos.start, record.pos.end);
          
          cd.dispatchEvent(typeEvent);

        }

        if (at < 0) at = 0;

      }

      if (isRedo(event)) {

        event.preventDefault();

        at++;
        const record = cd.history[at];

        if (record) {

          cd.innerHTML = record.html;
          cd.setSelection(record.pos.start, record.pos.end);
          
          cd.dispatchEvent(typeEvent);

        }

        if (at >= cd.history.length) at--;

      }
    }

    function recordHistory() {

      // if codeit not focused
      if (document.activeElement !== cd) return;

      const html = cd.innerHTML;

      // get caret pos in text
      const pos = cd.getSelection();

      const lastRecord = cd.history[at];

      if (lastRecord) {

        if (lastRecord.html === html
          && lastRecord.pos.start === pos.start
          && lastRecord.pos.end === pos.end) return;

      }

      // dispatch custom event
      cd.dispatchEvent(typeEvent);

      at++;
      cd.history[at] = {html, pos};
      cd.history.splice(at + 1);

      const maxHistory = 300;
      if (at > maxHistory) {

        at = maxHistory;
        cd.history.splice(0, 1);

      }

    }

    cd.dispatchTypeEvent = () => {

      // dispatch custom event
      cd.dispatchEvent(typeEvent);

    }
    
    cd.dispatchCaretMoveEvent = () => {

      // dispatch custom event
      cd.dispatchEvent(caretMoveEvent);

    }

    function overrideDeleteText(event) {

      if (event.key === 'Backspace' || event.key === 'Delete') {

        event.preventDefault();

        // when deleting in large files,
        // the browser reparses the element tree and slows down
        // override with range.deleteContents() fixes the problem
        cd.deleteCurrentSelection();

      }

    }

    cd.deleteCurrentSelection = () => {

      // get current selection
      const s = window.getSelection();
      let r0 = s.getRangeAt(0);

      // get selection in text content
      let textSel = cd.getSelection();

      // if selection is empty, select the char before
      if (r0.collapsed) {

        cd.setSelection(textSel.start-1, textSel.end);

        // get current range
        r0 = s.getRangeAt(0);

      }

      // get selection length
      let selectionLength = r0.toString().length;
      
      // if deleting last line of code
      let deletingLastLine;
      
      if ((textSel.end === cd.textContent.length || textSel.start === cd.textContent.length)
          && r0.toString() !== '\n'
          && cd.textContent.slice((-selectionLength - 1), -selectionLength) === '\n') {
        
        deletingLastLine = true;
        
      }
      
      // delete current range contents
      // (also deletes the range itself)
      r0.deleteContents();
      
      if (deletingLastLine) {
        
        // add newline
        cd.insert('\n', { moveToEnd: false });
        
        // add newline length to caret position
        textSel.start = Math.max(textSel.start, textSel.end) + 1;
        
        // create a new range at start of original
        cd.setSelection(textSel.start);
        
      } else {

        // remove the length of the selection from caret position
        textSel.start = Math.max(textSel.start, textSel.end) - selectionLength;

        // create a new range at start of original
        cd.setSelection(textSel.start);
        
      }

    }

    cd.insert = (text, options) => {

      // get current selection
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);

      // clone current range
      const newRange = r0.cloneRange();

      // insert text node at start of range
      const textEl = document.createTextNode(text);
      newRange.insertNode(textEl);

      // delete range
      newRange.detach();


      let moveToEnd = true;
      if (options) moveToEnd = options.moveToEnd;

      // if moving caret to end of inserted text
      if (moveToEnd) {

        // get caret pos in text
        let pos = cd.getSelection();

        // move caret to end of inserted text
        pos.start += text.length;
        pos.end += text.length;

        // change pos in text
        cd.setSelection(pos.start, pos.end);

      }

    }

    function beforeCursor() {

      // get current selection
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);

      // create range from cursor to beginning of text
      const newRange = document.createRange();
      newRange.selectNodeContents(cd);
      newRange.setEnd(r0.startContainer, r0.startOffset);

      // save range text and delete it
      const text = newRange.toString();
      newRange.detach();

      return text;

    }

    function afterCursor() {

      // get current selection
      const s = window.getSelection();
      const r0 = s.getRangeAt(0);

      // create range from cursor to beginning of text
      const newRange = document.createRange();
      newRange.selectNodeContents(cd);
      newRange.setStart(r0.endContainer, r0.endOffset);

      // save range text and delete it
      const text = newRange.toString();
      newRange.detach();

      return text;

    }

    // calculate padding of current line
    function getPadding(text) {

      const tabLength = cd.options.tab.length;

      // find beginning of current line
      let i = text.length - 1;
      while (i >= 0 && text[i] !== '\n') i--;
      i++;

      // find padding of current line
      let thisLine = text.substr(i);
      let linePadding = '';
      while (thisLine.length > 0 && isTab(thisLine.substr(0, tabLength))) {

        thisLine = thisLine.slice(tabLength);
        linePadding += cd.options.tab;

      }

      return [linePadding, i];

    }
    
    function getPrevLinePadding(text) {
      
      let i = text.length - 1;
      
      // find beginning of prev line
      while (i >= 0 && text[i] !== '\n') i--;
      i--;
      
      const prevLine = text.slice(0, i);
      
      if (prevLine) {
        
        return getPadding(prevLine);
        
      }
      
    }
    
    function hashCode(string) {
      var hash = 0, i, chr;
      if (string.length === 0) return hash;
      for (i = 0; i < string.length; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // convert to 32bit integer
      }
      return hash;
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


    cd.prev = '';

    cd.update = () => {

      if (cd.textContent === '') cd.textContent = '\n';

      // compare current code with previous code
      if (hashCode(cd.textContent) !== hashCode(cd.prev)) {
        
        // if the code is different, highlight it
        debounceHighlight();

      }

      cd.prev = cd.textContent;

    }


    cd.setSelection = (startPos, endPos) => {

      let c;

      // if start pos is bigger than codeit length,
      // set start pos to codeit length
      if (startPos > cd.textContent.length) startPos = cd.textContent.length;

      if (endPos) {

        // if end pos is bigger than codeit length,
        // set end pos to codeit length
        if (endPos > cd.textContent.length) endPos = cd.textContent.length;

        // get caret node and offset
        c = getCaretNode(startPos, endPos);

      } else {

        // get caret node and offset
        c = getCaretNode(startPos);

      }


      // select
      const s = window.getSelection();

      let startNode = c.startNode;
      let startOffset = c.startOffset;
      let endNode = c.endNode;
      let endOffset = c.endOffset;

      if (c.startNode.nodeValue == '' || c.endNode.nodeValue == '') {

        // if the start and end caret nodes
        // are both the same empty node
        if (c.startNode.isEqualNode(c.endNode) && c.startNode.previousSibling) {

          // set caret node to previous node
          startNode = c.startNode.previousSibling;
          startOffset = c.startNode.previousSibling.textContent.length;
          endNode = c.startNode.previousSibling;
          endOffset = c.startNode.previousSibling.textContent.length;

        }

      }

      s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);

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

        if (caretPosInText === cd.textContent.length) {
          
          function getLastNode(parentNode) {
            
            // if parent has child nodes
            if (parentNode.childNodes.length > 0) {
              
              const lastNode = parentNode.childNodes[parentNode.childNodes.length-1];

              // if found a text node
              if (lastNode.nodeType === 3) {

                // return
                return lastNode;

              } else { // continue recursive call

                return getLastNode(lastNode);

              }
              
            } else {
              
              // return
              return parentNode;
              
            }
            
          }
          
          // get end node
          const endNode = getLastNode(cd);
          const endOffset = (endNode.nodeValue || endNode.textContent).length;
          
          return [endNode, endOffset];
          
        }
        
        
        let overallLength = 0,
            lastNode;

        function getTextNodes(node) {

          // if not reached the target text
          if (overallLength <= caretPosInText) {

            // if node type is text
            if (node.nodeType == 3) {

              overallLength += node.nodeValue.length;

              lastNode = node;

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

        } else if (caretPosInText !== cd.textContent.length) {

          // if caret is in the middle of text,
          // start looking for adjacent nodes
          if (caretPosInText > 0) {

            return getCaretTextNode(startPos-1);

          } else {

            // if caret is at start of text,
            // return first node
            
            if (cd.childNodes[1]) {
            
              return [cd.childNodes[1], 0];
              
            } else if (cd.childNodes[0] && cd.childNodes[0].ariaHidden !== 'true') {
              
              return [cd.childNodes[0], 0];
                 
            } else {
              
              return [cd, 0];
              
            }

          }

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
          endOffset: endOffset
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
        cd.setAttribute('enterkeyhint', 'enter');

      } else {

        // make codeit uneditable
        cd.setAttribute('contenteditable', 'false');

      }

    }

  }

}

// define the codeit element
window.customElements.define('cd-el', CodeitElement);
