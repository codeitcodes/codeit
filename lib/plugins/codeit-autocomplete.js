(function() {

let acp = {
  
  language: {
    css: {},
    js: {}
  },
  
  options: {
    minChar: 0 // 4
  },
  
  el: {
    input: document.querySelector('cd-el'),
    suggestions: document.querySelector('.cd-wrapper .autocomplete'),
    topHit: document.querySelector('.cd-wrapper .top-hit')
  },
  
  
  curr: {
    query: '',
    topHit: '',
    suggestions: []
  },
  
  didType: false,
  
  utils: {}
  
};


let isMobile = false;

if (navigator.userAgentData && navigator.userAgentData.mobile)
  isMobile = true;

if (navigator.userAgent && navigator.userAgent.includes('Mobile'))
  isMobile = true;

if (isMobile) return;



acp.initLang = (language) => {
  
  acp.language[language].init();
  
}

acp.language.css.init = () => {
    
  const CSSProps = acp.language.css.props;
  
  CSSProps = Array.from(window.getComputedStyle(document.documentElement));
  
  CSSProps.push('padding');
  CSSProps.push('margin');
  CSSProps.push('border');
  CSSProps.push('flex');
  CSSProps.push('grid');
  CSSProps.push('gap');
  CSSProps.push('background');
  CSSProps.push('overflow');
  CSSProps.push('transition');
  CSSProps.push('animation');
  CSSProps.push('-webkit-user-select');
  
  acp.language.css.didInit = true;
  
}

acp.language.js.init = () => {
  
  const iframe = document.createElement('iframe');
  
  body.append(iframe);
  
  acp.language.js.props = iframe.contentWindow;
  
  acp.language.js.didInit = true;
  
}



acp.autocomplete = async (lang) => {
  
  if (!lang.didInit) {
    
    await acp.language[lang].init();
    
  }
  
  acp.language[lang].autocomplete();
  
}


acp.language.css.autocomplete = () => {

  const cursor = cd.dropper.cursor();

  if (!cursor.collapsed) return;


  const query = getQuery(cursor);


  if (query === prevQuery) return;

  prevQuery = query;


  let out = [];

  if (query !== '' &&
    query !== '\n' &&
    !query.includes(':') &&
    query.length >= acp.options.minChar) {

    let matches = [];

    // search props
    CSSProps.forEach(prop => {

      if (prop.startsWith(query)) {

        matches.push(prop);

      }

    });


    // if matches exist
    if (matches.length !== 0) {

      matches = matches.sort((match1, match2) => match1.length - match2.length);

      matches.forEach((match, index) => {

        // if holding a preference for a match,
        // add it to the top of the list
        if (preference[query] === match) {

          array_move(matches, index, 0);

          out.unshift(match);

        } else {

          out.push(match);

        }

      });


      if (matches.length === 1 &&
        matches[0] === query) {

        out = []; // --matches--
        topHit = '';
        currSuggestions = [];

        topHitEl.textContent = '';

      } else {

        topHit = matches[0];
        currSuggestions = matches;

        //console.log('Top hit: ' + matches[0]);

        let topHitText = '<b>' + query + '</b>' + topHit.slice(query.length);

        // if top hit is a CSS property, add :
        if (!topHit.includes('@')) topHitText += ':';

        topHitEl.innerHTML = topHitText;

      }

    } else {

      topHitEl.textContent = '';

    }

  } else {

    topHitEl.textContent = '';

  }


  //console.log('Suggestions:\n' + out.replaceAll('<br>','\n'));

  // if suggestions exist
  if (out.length !== 0) {

    let html = '';

    out.forEach((suggestion, i) => {

      let active = '';
      if (i === 0) active = ' active';

      const suggestionHTML = suggestion.replace(query, '<b>' + query + '</b>');

      html += '<div class="icon' + active + '">' + suggestionHTML + '</div>';

    });

    suggestions.innerHTML = html;

    // move suggestions to caret
    moveSuggestionsToCaret(cursor);

    suggestions.classList.add('visible');

    suggestions.scrollTop = 0;

  } else {

    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';

  }

}



// add event listeners

acp.el.input.on('keydown caretmove', acp.event.autocompleteOnType);
acp.el.input.on('keydown', acp.event.handleMenuNavigation);

acp.el.input.on('caretmove', acp.event.hideMenuOnCaretMove);
acp.el.input.on('scroll', acp.event.hideMenuOnScroll);


// autocomplete on type
acp.event.autocompleteOnType = (e) => {
  
  acp.curr.lang = acp.utils.getSelectionLanguage();
  
  if (acp.curr.lang === 'css') {
    
    // if typed
    if (cd.typed(e)) {

      acp.didType = true;
      
      // autocomplete after finished typing
      onNextFrame(() => {
        acp.autocomplete(acp.curr.lang);
      });

    } else {

      acp.didType = false;

    }

  }

}


// handle menu navigation on keydown

acp.event.handleMenuNavigation = (e) => {

  if (acp.el.suggestions.classList.contains('visible')) {
    
    if (e.key === 'ArrowDown') {
      
      // go to next suggestion
      
      e.preventDefault();

      const activeSg = acp.el.suggestions.querySelector('.icon.active');
      let nextSg = activeSg.nextElementSibling;

      // if next suggestion dosen't exist
      if (!nextSg) {

        // jump to first suggestion
        nextSg = suggestions.querySelector('.icon:first-of-type');
        acp.el.suggestions.scrollTop = 0;

      } else {

        // go to next suggestion
        
        const absSgPos = nextSg.getBoundingClientRect().top;
        const sgMenuPos = acp.el.suggestions.getBoundingClientRect().top;
        
        const menuPadding = 1;
        
        const nextSgPos = absSgPos - sgMenuPos - menuPadding;
        
        const menuHeight = 140;
        
        // if next suggestion isn't visible
        if (nextSgPos > menuHeight) {
          
          // scroll next suggestion into view
          acp.el.suggestions.scrollTop += nextSg.clientHeight;
          
        }

      }

      activeSg.classList.remove('active');
      nextSg.classList.add('active');

      acp.globals.topHit = nextSg.textContent;

      let topHitText = '<b>' + acp.curr.query + '</b>' + acp.curr.topHit.slice(acp.curr.query.length);

      // if top hit is a CSS property, add :
      if (acp.curr.lang === 'css') topHitText += ':';

      acp.el.topHit.innerHTML = topHitText;

    } else if (e.key === 'ArrowUp') {
      
      // go to previous suggestion
      
      e.preventDefault();

      const activeSg = acp.el.suggestions.querySelector('.icon.active');
      let prevSg = activeSg.previousElementSibling;

      // if previous suggestion dosen't exist
      if (!prevSg) {

        // jump to last suggestion
        prevSg = acp.el.suggestions.querySelector('.icon:last-of-type');
        acp.el.suggestions.scrollTop = acp.el.suggestions.scrollHeight;

      } else {

        // go to previous suggestion
        
        const absSgPos = prevSg.getBoundingClientRect().top;
        const sgMenuPos = acp.el.suggestions.getBoundingClientRect().top;
                
        const prevSgPos = absSgPos - sgMenuPos;

        // if previous suggestion isn't visible
        if (prevSgPos < 0) {
          
          // scroll previous suggestion into view
          acp.el.suggestions.scrollTop -= prevSg.clientHeight;
        
        }

      }

      activeSg.classList.remove('active');
      prevSg.classList.add('active');

      acp.globals.topHit = prevSg.textContent;

      let topHitText = '<b>' + acp.curr.query + '</b>' + acp.curr.topHit.slice(acp.curr.query.length);

      // if top hit is a CSS property, add :
      if (acp.curr.lang === 'css') topHitText += ':';

      acp.el.topHit.innerHTML = topHitText;

    } else if (e.key === 'Enter') {

      // add suggestion to text

      e.preventDefault();


      // prevent auto-tab on enter
      
      cd.history.pos -= 1;
      const record = cd.history.records[cd.history.pos];

      if (record) {

        cd.innerHTML = record.html;
        cd.setSelection(record.pos.start, record.pos.end);

        cd.dispatchTypeEvent();

      }

      if (cd.history.pos < 0) cd.history.pos = 0;
      

      let topHitText = acp.curr.topHit.slice(acp.curr.query.length);

      // if top hit is a CSS property, add :
      if (acp.curr.lang === 'css') topHitText += ': ';

      acp.curr.topHit = '';
      acp.el.topHit.innerHTML = '';

      acp.el.suggestions.classList.remove('visible');
      acp.el.suggestions.innerHTML = '';

      cd.insert(topHitText);

    }

  }

}


// hide menu on caret move
acp.event.hideMenuOnCaretMove = () => {

  // if didn't type but suggestions are visible
  if (!acp.didType &&
      suggestions.classList.contains('visible')) {
    
    // hide suggestions
    acp.el.suggestions.classList.remove('visible');
    acp.el.suggestions.innerHTML = '';
    acp.el.topHit.innerHTML = '';

  } else {
    
    // reset typing status
    acp.didType = false;

  }

}


// hide menu on scroll
acp.event.hideMenuOnScroll = () => {
  
  if (acp.el.suggestions.classList.contains('visible')) {
    
    // hide suggestions on scroll
    acp.el.suggestions.classList.remove('visible');
    acp.el.suggestions.innerHTML = '';
    acp.el.topHit.innerHTML = '';

  }
  
}



// get current selection language
acp.utils.getSelectionLanguage = () => {
  
  const cursor = cd.dropper.cursor();
  const cursorEl = cursor.startContainer === cd ? cd : cursor.getParent();
  
  // get selection language
  const selLang = Prism.util.getLanguage(cursorEl);
  
  return selLang;
  
}


// get autocomplete query
acp.utils.getQuery = (textBeforeCursor) => {

  const textAfter = cd.afterCursor();
  
  if (!textAfter.startsWith('\n')) return '';
  

  const textBefore = textBeforeCursor;

  let query = '';

  let i = textBefore.length;

  while (i >= 0 && query.length < 50) {

    i--;

    const char = textBefore[i];

    if (char !== ' ' && char !== '\n' && char !== '\t') {

      query = char + query;

    } else {

      break;

    }

  }

  return query;

}


// get position of caret from start of query
acp.utils.getCaretPos = (originRange, query) => {

  let range = originRange.cloneRange();

  const container = range.startContainer;
  const offset = range.startOffset - query.length;

  range.setStart(container, offset);

  const rect = range.getBoundingClientRect();

  const pos = [rect.top, rect.left];

  range.detach();

  return pos;

}


// move suggestions to caret
acp.utils.moveSuggestionsToCaret = (cursor) => {

  const [top, left] = acp.utils.getCaretPos(cursor, acp.currQuery);

  // if sidebar is expanded, move suggestions left
  let leftMargin = 0;
  if (body.classList.contains('expanded')) leftMargin = 350;

  suggestions.style.top = top + 'px';
  suggestions.style.left = left - leftMargin + 'px';

  topHitEl.style.top = top + 'px';
  topHitEl.style.left = left - leftMargin + 'px';

}



/*

let preference = {};


input.onkeydown = (e) => {
  
  // if pressed shift + enter or tab
  if (e.shiftKey && (e.key === 'Enter' || e.key === 'Tab')) {
    
    // if holding shift or alt
    // and suggestions exist
    if ((e.shiftKey || e.altKey)
        && currSuggestions.length > 1) {
      
      selSuggestionIndex++;
      
      if (selSuggestionIndex > currSuggestions.length-1) selSuggestionIndex = 0;
      
      topHit = currSuggestions[selSuggestionIndex];
      
      if (selSuggestionIndex !== 0) {
        
        Object.entries(preference).forEach(preferenceObj => {
          
          if (preferenceObj[1] === currSuggestions[selSuggestionIndex-1]) {
            
            preference[preferenceObj[0]] = topHit;
            
          }
          
        });
        
      } else {
        
        preference[input.value.replace(': ', '')] = topHit;
        
      }
      
      //topHitEl.textContent = '';
      
    } else if (topHit) {
      
      preference[input.value.replace(': ', '')] = topHit;
      
    }
    
    // if top hit exists
    if (topHit) {
      
      e.preventDefault();
      
      //input.value = topHit + ': ';
      console.log('selected ' + topHit + ':');
      
      topHit = '';
      
      //suggestions.innerHTML = '--yay!--';
      
    }
    
  }
  
}


function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

*/


/*
// JavaScript tokens
const tokens = 
 {
   'javascript': [
[
`forEach(`,
`, () => {
  
});`
],
[
`for (let i = `,
]
    ]
 };
*/


/*
cd.on('type', () => {

  // if current language
  // is configured for autocomplete
  if (config[cd.lang]) {

    const cursor = cd.dropper.cursor();

    // if cursor is not in string or comment
    // but is in text node
    if (cursor && !cursor.in('string') && !cursor.in('comment') &&
      cursor.startContainer.nodeType === 3) {

      // if node value does not exceed
      // maximum autocomplete length
      if (stringToMatch &&
        !Array.isArray(stringToMatch) &&
        stringToMatch.length < 50) {

        // find autocomplete matches

      }

    }

  }

});
*/
  
}());

