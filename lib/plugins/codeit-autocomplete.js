(function() {

let acp = {
  
  language: {
    css: {},
    js: {}
  },
  
  el: {
    input: document.querySelector('cd-el'),
    menu: document.querySelector('.cd-wrapper .autocomplete'),
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
  
  langAcp = acp.language[lang];
  
  if (!langAcp.didInit) {
    
    // init language autocomplete
    await langAcp.init();
    
  }
  
  // if shouldn't autocomplete, return
  const shouldAutocomplete = acp.utils.shouldAutocomplete();
  if (!shouldAutocomplete) return;
  
  
  // get query
  const textBeforeCursor = cd.beforeCursor();
  const query = acp.utils.getQuery(textBeforeCursor);
  
  // if query didn't change, return
  if (query === acp.curr.query) return;
  
  acp.curr.query = query;
  
  
  let results = [];
  
  // if query exists
  if (query !== '') {
      
    // autocomplete query
    results = acp.language[lang].autocomplete(query);
    
  }
  
  
  // render results in HTML
  
  const resultsExist = acp.utils.resultsExist(results, query);
  
  if (resultsExist) {
    
    acp.curr.results = results;
    acp.curr.topHit = results[0];
    
    
    // get result HTML
    const resultHTML = acp.utils.renderMenuResults(results, query);
    
    // render results in HTML
    acp.el.menu.innerHTML = resultHTML;
    
    // show autocomplete menu
    acp.utils.showAcpMenu();
    
  } else {
    
    // clear results
    acp.curr.suggestions = [];
    acp.curr.topHit = '';
    
    // hide autocomplete menu
    acp.utils.hideAcpMenu();
    
  }
  
}


acp.language.css.autocomplete = (query) => {

  // if query includes a ':' (already completed property), return
  if (query.includes(':') return [];


  let results = [];
  

  // search props
  
  let matches = [];
  
  const props = acp.language.css.props;
  
  props.forEach(prop => {

    if (prop.startsWith(query)) {

      matches.push(prop);

    }

  });


  // if matches exist
  if (matches.length > 0) {

    matches = matches.sort((match1, match2) => match1.length - match2.length);


    //console.log('Top hit: ' + matches[0]);

    let topHitText = '<b>' + query + '</b>' + acp.curr.topHit.slice(query.length);

    // if top hit is a CSS property, add :
    if (!topHit.includes('@')) topHitText += ':';

    topHitEl.innerHTML = topHitText;
    
  }

//console.log('Suggestions:\n' + out.replaceAll('<br>','\n'));

}



// add event listeners

acp.el.input.on('keydown caretmove', acp.event.autocompleteOnType);
acp.el.input.on('keydown', acp.event.handleMenuNavigation);

acp.el.input.on('caretmove', acp.event.hideMenuOnCaretMove);
acp.el.input.on('scroll', acp.event.hideMenuOnScroll);


// autocomplete on type
acp.event.autocompleteOnType = (e) => {
  
  // if shouldn't autocomplete, return
  const shouldAutocomplete = acp.utils.shouldAutocomplete();
  if (!shouldAutocomplete) return;
    
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


// handle menu navigation on keydown

acp.event.handleMenuNavigation = (e) => {

  if (acp.el.menu.classList.contains('visible')) {
    
    if (e.key === 'ArrowDown') {
      
      // go to next suggestion
      
      e.preventDefault();

      const activeSg = acp.el.menu.querySelector('.icon.active');
      let nextSg = activeSg.nextElementSibling;

      // if next suggestion dosen't exist
      if (!nextSg) {

        // jump to first suggestion
        nextSg = suggestions.querySelector('.icon:first-of-type');
        acp.el.menu.scrollTop = 0;

      } else {

        // go to next suggestion
        
        const absSgPos = nextSg.getBoundingClientRect().top;
        const sgMenuPos = acp.el.menu.getBoundingClientRect().top;
        
        const menuPadding = 1;
        
        const nextSgPos = absSgPos - sgMenuPos - menuPadding;
        
        const menuHeight = 140;
        
        // if next suggestion isn't visible
        if (nextSgPos > menuHeight) {
          
          // scroll next suggestion into view
          acp.el.menu.scrollTop += nextSg.clientHeight;
          
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

      const activeSg = acp.el.menu.querySelector('.icon.active');
      let prevSg = activeSg.previousElementSibling;

      // if previous suggestion dosen't exist
      if (!prevSg) {

        // jump to last suggestion
        prevSg = acp.el.menu.querySelector('.icon:last-of-type');
        acp.el.menu.scrollTop = acp.el.menu.scrollHeight;

      } else {

        // go to previous suggestion
        
        const absSgPos = prevSg.getBoundingClientRect().top;
        const sgMenuPos = acp.el.menu.getBoundingClientRect().top;
                
        const prevSgPos = absSgPos - sgMenuPos;

        // if previous suggestion isn't visible
        if (prevSgPos < 0) {
          
          // scroll previous suggestion into view
          acp.el.menu.scrollTop -= prevSg.clientHeight;
        
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

      // hide menu
      acp.utils.hideAcpMenu();

      cd.insert(topHitText);

    }

  }

}


// hide menu on caret move
acp.event.hideMenuOnCaretMove = () => {

  // if didn't type but suggestions are visible
  if (!acp.didType &&
      suggestions.classList.contains('visible')) {
    
    // hide autocomplete menu
    acp.utils.hideAcpMenu();

  } else {
    
    // reset typing status
    acp.didType = false;

  }

}


// hide menu on scroll
acp.event.hideMenuOnScroll = () => {
  
  if (acp.el.menu.classList.contains('visible')) {
    
    // hide autocomplete menu
    acp.utils.hideAcpMenu();

  }
  
}



// check if should autocomplete
acp.utils.shouldAutocomplete = () => {
  
  // if input isn't focused, return
  if (acp.el.input !== document.activeElement) return false;
  
  const cursorCollapsed = cd.dropper.cursor().collapsed;
  
  // if cursor not collapsed, return
  if (!cursorCollapsed) return false;
    
  acp.curr.lang = acp.utils.getSelectionLanguage();
  
  // if can't autocomplete language, return
  if (!acp.language[acp.curr.lang]) return false;
  
  return true;
  
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


// check if results exist
acp.utils.resultsExist = (results, query) => {
  
  // if there's no results
  if (results.length === 0) {
    
    return false;
    
  }
  
  // if query matches result
  if (results.length === 1 &&
      results[0] === query) {
    
    return false;
    
  }
  
  return true;
  
}


// show autocomplete menu
acp.utils.showAcpMenu = () => {
  
  // move menu to caret
  acp.utils.moveMenuToCursor();

  acp.el.menu.classList.add('visible');
  
  // scroll to top of menu
  acp.el.menu.scrollTop = 0;
  
}


// hide autocomplete menu
acp.utils.hideAcpMenu = () => {

  acp.el.topHit.textContent = '';
  
  acp.el.menu.innerHTML = '';
  
  acp.el.menu.classList.remove('visible');
  
}


// render autocomplete menu results
acp.utils.renderMenuResults = (results, query) => {
  
  let html = '';
  
  results.forEach((result, i) => {
  
    // select first result
    let active = '';
    if (i === 0) active = ' active';

    // show query in bold
    const resultHTML = result.replace(query, '<b>' + query + '</b>');

    html += '<div class="icon' + active + '">' + resultHTML + '</div>';

  });
  
  return html;
  
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

// add after match sorting:

for (let i = 0; i < matches.length; i++) {
  
  const match = matches[i];
  
  // if holding a preference for a match,
  // move it to the top of the list
  if (preference[query] === match) {
    
    // remove from array and add to start
    moveToStartOfArray(match, matches);
  
  }
  
}


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

