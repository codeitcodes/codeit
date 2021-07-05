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

  let updatingHighlight = false;

  let textContentObserver = new MutationObserver(function(mutationsList, observer) {

    // run on all mutations
    mutationsList.forEach(mutation => {

      /*console.log(mutation.type);

      // if mutation was a textNode mutation
      if (mutation.type == 'characterData') {

        // if the text didn't change, stop
        if (mutation.oldValue == cd.innerText) {
          textChanged = false;
          console.log('Text: ' + mutation.oldValue, cd.innerText);
        }

      } else if (mutation.type == 'childList') { // if mutation was a innerHTML mutation

        // if mutation was from highlighting, stop
        if (updatingHighlight == true) {
          updatingHighlight = false;
          textChanged = false;
        } else {
          updatingHighlight = true;
          textChanged = true;
        }

      }*/

    });

    if (updatingHighlight == false) {

      //console.log('Updating Codeit from textContent', mutationsList);
      updatingHighlight = true;
      cd.update();

    } else {

      //console.log('Ignoring update from highlight');
      updatingHighlight = false;

    }

    //console.log('textContent', mutationsList);

  });


  let innerHTMLObserver = new MutationObserver(function(mutationsList, observer) {

    // run on all mutations
    mutationsList.forEach(mutation => {

      /*console.log(mutation.type);

      // if mutation was a textNode mutation
      if (mutation.type == 'characterData') {

        // if the text didn't change, stop
        if (mutation.oldValue == cd.innerText) {
          textChanged = false;
          console.log('Text: ' + mutation.oldValue, cd.innerText);
        }

      } else if (mutation.type == 'childList') { // if mutation was a innerHTML mutation

        // if mutation was from highlighting, stop
        if (updatingHighlight == true) {
          updatingHighlight = false;
          textChanged = false;
        } else {
          updatingHighlight = true;
          textChanged = true;
        }

      }*/

    });

    //console.log('Updating Codeit from innerHTML', mutationsList);
    updatingHighlight = true;
    cd.update();
    //console.log('innerHTML', mutationsList);

  });



  // call 'observe' on that MutationObserver instance,
  // passing it the element to observe, and the options object

  var textContentConfig = { characterData: false, attributes: false, childList: true, subtree: false };
  textContentObserver.observe(cd, textContentConfig);

  var innerHTMLConfig = { characterData: true, attributes: false, childList: false, subtree: true };
  innerHTMLObserver.observe(cd, innerHTMLConfig);


  var pressedEnter = false;

  cd.addEventListener('keydown', (e) => {

    // trap the return key being pressed
    if (e.keyCode == 13) {

      console.log('return');

      //var sel = window.getSelection();
      //var targetNode = sel.anchorNode;

      if (pressedEnter == false) {
        // codeit.innerHTML.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '\n' + '$2');
        cd.insertAdjacentHTML('beforeend', '\n\r');
        pressedEnter = true;
      } else {
        cd.insertAdjacentHTML('beforeend', '\n');
        pressedEnter = false;
      }

      cd.update();

      // prevent the default behaviour of return key pressed
      e.preventDefault();
      return false;

    } else {

      pressedEnter = false;

    }

  })


  cd.addEventListener('keyup', (e) => {

    // trap the return key being pressed
    if (e.keyCode == 13) {
      console.log('return');

      //var sel = window.getSelection();
      //var targetNode = sel.anchorNode;

      // prevent the default behaviour of return key pressed
      e.preventDefault();
      return false;
    }

  })


  var nodePath = [];

  function getCaretPosInInnerText(el) {

    var sel = window.getSelection();

    var targetNode = sel.anchorNode; // node of caret
    var caretOffset = sel.anchorOffset; // offset in node

    var overallLength = 0;

    //console.log(el, targetNode, caretOffset);

    function getTextNodes(node) {

      //If reached the target node:
      if (node != targetNode) {

        //If node type is text:
        if (node.nodeType == 3) {
          //if(node.nodeValue === ' ') overallLength += 1;

          nodePath.push(node);

          overallLength += node.nodeValue.length;
          //console.log(node.nodeValue)
          //console.log('node length',node.nodeValue.length)

          //if (node.nodeValue === ' ') {
        } else { //if it's an empty node, this means more nodes underneath:
          //Go over his brother leaves:
          for (var i = 0, len = node.childNodes.length; i < len; ++i)
          {
            // Call recursive call on node's children:
            getTextNodes(node.childNodes[i]);

          }
        }
      }else{
        console.log('found node', node);

        if (node.nodeType != 3) {
          console.log('bad node');
          overallLength = cd.lastChild.value.length;
          caretOffset = 0;
        }
      }
    }

    getTextNodes(el);

    return overallLength + caretOffset;

  }


  function setCaret(el, pos) {
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el,pos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }


  //Go over all nodes till reach the number of characters:
  function getTextNodesIn(el, includeWhitespaceNodes) {

    var overallLength = 0, lastNode;

    function getTextNodes(node) {

      //If reached the target text:
      if (overallLength <= caretPosInText) {

        lastNode = node;

        //If node type is text:
        if (node.nodeType == 3)
        {

          overallLength += node.nodeValue.length;

          //if (node.nodeValue === ' ') {
        } else { //if it's an empty node, this means more nodes underneath:

          //Go over his brother leaves:
          for (var i = 0, len = node.childNodes.length; i < len; ++i)
          {
            // Call recursive call on node's children:
            getTextNodes(node.childNodes[i]);

          }
        }
      }else{
        //console.log('overall length:', overallLength);
      }
    }

    getTextNodes(el);

    if (lastNode) {

      var lastNodeLength = lastNode.nodeValue.length;

      //end of line problem
      //sel.anchorOffset
      //return [lastNode, (lastNodeLength - (overallLength - caretPosInText))];
      return [lastNode, (lastNodeLength - (overallLength - caretPosInText))];

    } else {

      return [cd, 0];

    }
  }


  let caretPosInText = 0;

  cd.update = () => {

    caretPosInText = getCaretPosInInnerText(cd);

    if (caretPosInText) {

      let highlightData = hljs.highlightAuto(cd.innerText);
      cd.classList = highlightData.language;
      cd.innerHTML = highlightData.value;


      let caretData = getTextNodesIn(cd);

      //console.log('caretData:',caretData[1], 'node:',cd.innerHTML.length);

      setCaret(caretData[0], caretData[1]);

    } else {

      let highlightData = hljs.highlightAuto(cd.innerText);
      cd.innerHTML = highlightData.value;

    }

  }

  cd.update();

});
