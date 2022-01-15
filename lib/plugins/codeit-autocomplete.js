(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
  }
  
  // autocomplete configuration
  var config = 
   {
     "css": [
       "font","font-style","font-variant","font-weight","font-size","font-family","text-align","letter-spacing","word-wrap","direction","text-wrap","word-spacing","cursor","resize","background","background-size","background-image","background-repeat","background-attachment","background-color","background-position","border","border-width","border-style","border-color","border-left","border-right","border-top","border-bottom","border-radius","float","width","height","max-height","max-width","min-height","min-width","margin","margin-bottom","margin-left","margin-right","margin-top","padding","padding-bottom","padding-top","padding-right","padding-left","display","overflow","overflow-y","overflow-x","rotation","visibility","color","flex","flex-direction","flex-wrap","align-content","justify-content","align-items","grid-gap","opacity","animation","animation-name","animation-duration","animation-timing-function","animation-delay","animation-iteration-count","animation-direction","animation-play-state","animation-fill-mode","bottom","z-index","clip","position","right","top","left","transition","transition-delay","transition-duration","transition-property","transition-timing-function","backface-visibility","perspective","perspective-origin","transform","transform-origin","transform-style",":active",":focus",":link",":enabled",":disabled",":hover",":checked",":lang",":ﬁrst-child",":last-child",":only-child",":ﬁrst-of-type",":last-of-type",":only-of-type",":empty",":root",":target","::first-letter","::first-line","::before","::after","counter-reset","display","content","counter-increment","quotes","line-height","box-sizing","white-space","text-height","vertical-align"
     ],
     "javascript": [
       "concat","indexOf","join","lastIndexOf","pop","push","reverse","shift","slice","sort","splice","toString","unshift","valueOf","++","--","==","===","!=","!==",">=","&&","||",">>",">>>","function","alert","confirm","console.log","document.write","prompt","decodeURI","encodeURI","decodeURIComponent","encodeURI","encodeURIComponent","eval","isFinite","isNaN","Number","parseFloat","parseInt","for","while","do while","break","continue","if else","switch","\\'","\\\"","\\\\","\\b","\\f","\\n","\\r","\\t","\\v","charAt","charCodeAt","concat","fromCharCode","indexOf","lastIndexOf","match","replace","search","slice","split","substr","substring","toLowerCase","toUpperCase","valueOf","MAX_VALUE","MIN_VALUE","NaN","NEGATIVE_INFINITY","POSITIVE_INFINITY","toExponential","toFixed","toPrecision","toString","valueOf","LN2","LN10","LOG2E","LOG10E","SQRT1_2","SQRT2","abs","acos","asin","atan","atan2","ceil","cos","exp","floor","log","max","min","pow","random","round","sin","sqrt","tan","Date","getDate","getDay","getFullYear","getHours","getMilliseconds","getMinutes","getMonth","getSeconds","getTime","getUTCDate","parse","setDate","setFullYear","setHours","setMilliseconds","setMinutes","setMonth","setSeconds","setTime","setUTCDate","attributes","baseURI","childNodes","firstChild","lastChild","nextSibling","nodeName","nodeType","nodeValue","ownerDocument","parentNode","previousSibling","textContent","appendChild","cloneNode","compareDocumentPosition","getFeature","hasAttributes","hasChildNodes","insertBefore","isDefaultNamespace","isEqualNode","isSameNode","isSupported","lookupNamespaceURI","lookupPrefix","normalize","removeChild","replaceChild","getAttribute","getAttributeNS","getAttributeNode","getAttributeNodeNS","getElementsByTagName","getElementsByTagNameNS","hasAttribute","hasAttributeNS","removeAttribute","removeAttributeNS","removeAttributeNode","setAttribute","setAttributeNS","setAttributeNode","setAttributeNodeNS","closed","defaultStatus","document","frames","history","innerHeight","innerWidth","length","location","name","navigator","opener","outerHeight","outerWidth","pageXOffset","pageYOffset","parent","screen","screenLeft","screenTop","screenX","screenLeft","screenY","screenTop","self","status","top","alert","blur","clearInterval","setInterval","clearTimeout","setTimeout","close","confirm","focus","moveBy","moveTo","open","print","prompt","resizeBy","resizeTo","scrollBy","scrollTo","setInterval","setTimeout","stop","availHeight","availWidth","colorDepth","height","pixelDepth","width","onclick","oncontextmenu","ondblclick","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseover","onmouseout","onmouseup","onkeydown","onkeypress","onkeyup","onabort","onbeforeunload","onerror","onhashchange","onload","onpagehide","onpageshow","onresize","onscroll","onunload","onblur","onchange","onfocus","onfocusin","onfocusout","oninput","oninvalid","onreset","onsearch","onselect","onsubmit","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","oncopy","oncut","onpaste","onabort","oncanplay","oncanplaythrough","ondurationchange","onended","onerror","onloadeddata","onloadedmetadata","onloadstart","onpause","onplay","onplaying","onprogress","onratechange","onseeked","onseeking","onstalled","onsuspend","ontimeupdate","onvolumechange","onwaiting","animationend","animationiteration","animationstart","transitionend","onmessage","onoffline","ononline","onpopstate","onshow","onstorage","ontoggle","onwheel","ontouchcancel","ontouchend","ontouchmove","ontouchstart","try","catch","throw","finally","name","message"
     ]
   };
  
  // autocomplete list
	var autocomplete = [];
  
  
  // minimum match distance to show suggestions
  // (lower is more suggestions)
  var minMatchDistance = 0.22;
  
  
  // calculate difference percentage between two strings
  // (Levenshtein distance. See: https://stackoverflow.com/a/36566052)
  
  function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
  
	
	document.querySelectorAll('cd-el').forEach(cd => {
		
    const menu = cd.parentElement.querySelector('.menu');
    
    // add menu event listeners
    document.addEventListener('keydown', (e) => {
      
      // if menu is visible
      if (menu.classList.contains('visible')) {
        
        if (e.key === 'Enter' || e.keyCode === 13) { // if pressed enter
          
          // prevent default behavior
          e.preventDefault();
                    
          // get cursor
          const cursor = cd.dropper.cursor();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          cursor.startContainer.nodeValue = activeSuggestion.textContent;
          
        } else if (e.key === 'ArrowDown' || e.keyCode === 40) { // if navigated down
          
          // prevent scrolling
          e.preventDefault();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          // select next suggestion
          activeSuggestion.nextElementSibling.classList.add('active');
          activeSuggestion.classList.remove('active');
          
        } else if (e.key === 'ArrowUp' || e.keyCode === 38) { // if navigated up
          
          // prevent scrolling
          e.preventDefault();
          
          // get active suggestion
          const activeSuggestion = menu.querySelector('.icon.active');
          
          // select previous suggestion
          activeSuggestion.prevElementSibling.classList.add('active');
          activeSuggestion.classList.remove('active');
          
        }
        
      }
      
    });
    
    // if moved cursor, hide menu
    cd.on('caretmove', () => {
      
      menu.classList.remove('visible');
      
    });
    
    
		cd.on('type', () => {
			
      // if current language
      // is configured for autocomplete
      if (config[cd.lang]) {
        
        const cursor = cd.dropper.cursor();
        
        // if cursor is not in string or comment
        if (cursor && !cursor.in('string') && !cursor.in('comment')) {
          
          // if cursor is in text node
          // and node value does not exceed
          // maximum autocomplete length
          
          if (cursor.startContainer.nodeType === 3
              && cursor.startContainer.nodeValue.length < 50) {
            
            // find autocomplete matches
            const matches = autoComplete(cursor.startContainer.nodeValue, config[cd.lang]);
            
            // if found matches
            if (matches.length > 0) {
              
              // save rendered HTML
              let out = '';
              
              // render matches
              matches.forEach((match, index) => {
                
                // highlight first match
                if (index === 0) {
                  
                  out += '<div class="icon active">'+ match.content +'</div>';
                  
                } else {
                  
                  out += '<div class="icon">'+ match.content +'</div>';
                  
                }
                
              });
              
              // add rendered HTML to dom
              menu.innerHTML = out;
              menu.scrollTo(0, 0);
              
              // show menu
              menu.classList.add('visible');
              
              
              // add match event listeners
              menu.querySelectorAll('.icon').forEach(icon => {
                
                // when clicked on icon
                icon.addEventListener('click', () => {
                  
                  // complete current node
                  cursor.startContainer.nodeValue = icon.textContent;
                  
                });
                
              });
              
            } else {
              
              // hide menu
              menu.classList.remove('visible');
              
            }
            
          }
          
        }
        
			}
			
		});
		
	});
	
}());
