// Add required CSS to head
var css = 'cd{outline:0;user-select:text;-webkit-user-select:text;overflow-wrap:break-word;white-space:pre-wrap;font-family:monospace;text-rendering:optimizeLegibility;font-feature-settings:"kern";display:block;background:#f1f3f4;border-radius:5px;padding:5px}.hljs{display:block;background:#fff;padding:.5em;color:#333;overflow-x:auto}.hljs-comment,.hljs-meta{color:#969896}.hljs-emphasis,.hljs-quote,.hljs-strong,.hljs-template-variable,.hljs-variable{color:#df5000}.hljs-keyword,.hljs-selector-tag,.hljs-type{color:#d73a49}.hljs-attribute,.hljs-bullet,.hljs-literal,.hljs-symbol{color:#0086b3}.hljs-name,.hljs-section{color:#63a35c}.hljs-tag{color:#333}.hljs-attr,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-selector-pseudo,.hljs-title{color:#6f42c1}.hljs-addition{color:#55a532;background-color:#eaffea}.hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-link{text-decoration:underline}.hljs-number{color:#005cc5}.hljs-string{color:#032f62}',
    head = document.head,
    style = document.createElement('style');
head.appendChild(style);
style.appendChild(document.createTextNode(css));

// Get all Codeits
var codeits = document.querySelectorAll('cd');

codeits.forEach(cd => {
  
  if (cd.getAttribute('editable') != 'false') {
    cd.setAttribute('contenteditable', 'true');
  }
  cd.setAttribute('spellcheck', 'false');

  // parse codeit code
  let code = cd.innerHTML.replace(/^\n|\n$/g, '');
  cd.innerText = code;
  
  // create a new instance of 'MutationObserver' named 'observer', 
  // passing it a callback function
  let observer = new MutationObserver(function(mutationsList, observer) {
    
    let textChanged = true;
    
    // run on all mutations
    mutationsList.forEach(mutation => {

      // if mutation was a textNode mutation
      if (mutation.type === 'characterData') {

        // if the text didn't change, stop
        if (mutation.oldValue === cd.innerText) {
          textChanged = false;
        }

      } else if (mutation.type === 'childList') { // if mutation was a innerHTML mutation
        
        
        
      }
      
    });
    
    if (textChanged) {

      cd.update();
      
      console.log(mutationsList);
      
    }
        
  });

  // call 'observe' on that MutationObserver instance, 
  // passing it the element to observe, and the options object
  observer.observe(cd, {subtree: true, characterData: true, characterDataOldValue: true, childList: false, attributes: false});
  
  
  // node_walk: walk the element tree, stop when func(node) returns false
  function node_walk(node, func) {
    var result = func(node);
    for(node = node.firstChild; result !== false && node; node = node.nextSibling)
      result = node_walk(node, func);
    return result;
  };

  // getCaretPosition: return [start, end] as offsets to elem.textContent that
  //   correspond to the selected portion of text
  //   (if start == end, caret is at given position and no text is selected)
  function getCaretPosition(elem) {
    var sel = window.getSelection();
    var cum_length = [0, 0];

    if(sel.anchorNode == elem)
      cum_length = [sel.anchorOffset, sel.extentOffset];
    else {
      var nodes_to_find = [sel.anchorNode, sel.extentNode];
      if(!elem.contains(sel.anchorNode) || !elem.contains(sel.extentNode))
        return undefined;
      else {
        var found = [0,0];
        var i;
        node_walk(elem, function(node) {
          for(i = 0; i < 2; i++) {
            if(node == nodes_to_find[i]) {
              found[i] = true;
              if(found[i == 0 ? 1 : 0])
                return false; // all done
            }
          }

          if(node.textContent && !node.firstChild) {
            for(i = 0; i < 2; i++) {
              if(!found[i])
                cum_length[i] += node.textContent.length;
            }
          }
        });
        cum_length[0] += sel.anchorOffset;
        cum_length[1] += sel.extentOffset;
      }
    }
    if(cum_length[0] <= cum_length[1])
      return cum_length;
    return [cum_length[1], cum_length[0]];
  }

  function setCaret(el, pos) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el,pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }


  function getTextNodesIn(node, includeWhitespaceNodes) {
    var overallLength = 0, lastNode;

    function getTextNodes(node) {

      if (overallLength < caretPosInText) {
        lastNode = node;
        if (node.nodeType == 3) {
          if (node.nodeValue === ' ') {

            overallLength += 1;
            
          } else {
            
            overallLength += getLengthWithoutNewlines(node);
              
          }
        } else {
          for (var i = 0, len = node.childNodes.length; i < len; ++i) {
            getTextNodes(node.childNodes[i]);
          }
        }
      }
    }

    getTextNodes(node);

    if (lastNode) {
      
      var lastNodeLength = getLengthWithoutNewlines(lastNode);
      
      return [lastNode, (lastNodeLength - (overallLength - caretPosInText))];

    } else {

      return [cd, 0];

    }
  }
  
  function getLengthWithoutNewlines(node) {
    
    var nodeLength = node.length;

    var lastChar, thisChar, counter;
    for (var i = 0; i < node.nodeValue.length; i++) {

      thisChar = node.nodeValue[i];

      if (lastChar === '\\' && thisChar === 'n') {
        counter++;
      }

      lastChar = thisChar;

    }

    nodeLength -= counter;

    return nodeLength;
    
  }
  
  
  let caretPosInText = 0;
  
  cd.update = () => {
    
    let caretPos = getCaretPosition(cd);
    
    if (caretPos) {
      
      caretPosInText = caretPos[0];
      
      
      let highlightData = hljs.highlightAuto(cd.innerText);
      cd.classList = highlightData.language;
      cd.innerHTML = highlightData.value;
      
      
      let caretData = getTextNodesIn(cd);
      setCaret(caretData[0], caretData[1]);
      
    } else {
      
      let highlightData = hljs.highlightAuto(cd.innerText);
      cd.innerHTML = highlightData.value;
      
    }
    
  }
  
  cd.update();
  
});
