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
    results: []
  },
  
  didType: false,
  
  event: {},
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
    
  let CSSProps = [];
  
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
  
  acp.language.css.props = CSSProps;
  
}

acp.language.js.init = () => {
  
  const iframe = document.createElement('iframe');
  
  body.append(iframe);
  
  acp.language.js.props = iframe.contentWindow;
  
}

// add language alias / temp @@
acp.language.javascript = acp.language.js;



acp.autocomplete = async (lang) => {
  
  langAcp = acp.language[lang];
  
  if (!langAcp.didInit) {
    
    // init language autocomplete
    await langAcp.init();
    
    langAcp.didInit = true;
    
  }
  
  // if shouldn't autocomplete, return
  const shouldAutocomplete = acp.utils.shouldAutocomplete();
  if (!shouldAutocomplete) return;
  
  
  // get query
  const textBeforeCursor = acp.el.input.beforeCursor();
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
  
  
  // if disabled sorting
  if (results[1] &&
      results[1].sort === false) {
    
    // don't sort results
    results = results[0];
    
  } else {
    
    // sort results
    results = acp.utils.sort(results);
    
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
    
    
    // render top hit in HTML
    
    const topHitHTML = acp.utils.renderTopHitHTML(results[0], query);
    
    acp.el.topHit.innerHTML = topHitHTML;
    
    
    // console.log('[acp] Top hit:', results[0]);
    // console.log('[acp] Results:', results);
    
  } else {
    
    // clear results
    acp.curr.results = [];
    acp.curr.topHit = '';
    
    // hide autocomplete menu
    acp.utils.hideAcpMenu();
    
  }
  
}


/*
 * Autocomplete Language Extension (acp language)
 * ----------------------------------------------
 *
 * 1. Init function
 * ----------------
 *
 * Every acp language has an init function
 * that's called on the first load of a file
 * with the language:
 *
 * acp.language.<lang>.init = () => {
 *   ...
 *   acp.language.<lang>.props = <props>;
 * }
 *
 * Terms:
 * <lang> - language name
 * <props> - array of strings to autocomplete from later
 *
 *
 * 2. Autocomplete function
 * ------------------------
 *
 * Called on every type. Here you can process
 * the query and return results:
 *
 * acp.language.<lang>.autocomplete = (query) => {
 *   ...
 *   return <results>;
 * }
 *
 * Terms:
 * query - text of the current line before the cursor.
 *         newlines, spaces and tabs won't be included.
 * <results> - array of strings to show in the autocomplete menu
 * 
 * Results are automatically sorted.
 * To disable automatic sorting, return:
 *   return [<results>, { sort: false }];
 */


acp.language.css.autocomplete = (query) => {

  let results = [];

  // if query includes a ':' (already completed property), return
  if (query.includes(':')) return [];

  // search props
  
  const props = acp.language.css.props;
  
  props.forEach(prop => {

    if (prop.startsWith(query)) {

      results.push(prop);

    }

  });
  
  return results;
  
}


acp.language.js.autocomplete = (query) => {

  let results = [];

  // if query dosen't end with a '.', return
  if (!query.includes('.')) return [];

  // remove dot from end of query
  query = query.slice(0, -1);
  
  // split query to get hierarchy
  hierarchy = query.split('.');
  
  
  let currObject = acp.language.js.props;
  
  // go down hierarchy
  for (let i = 0; i < hierarchy.length; i++) {
    
    if (currObject) {
      
      const lowerKey = hierarchy[i];
      
      const lowerObject = currObject[lowerKey];
      
      currObject = lowerObject;
      
    } else {
      
      return;
      
    }
    
  }
  
  
  if (currObject) {
    
    // get all keys in object
    for (const name in currObject) {
      results.push(name);
    }
    
  }


  return results;
  
}



// autocomplete on type
acp.event.autocompleteOnType = (e) => {
  
  // if shouldn't autocomplete, return
  const shouldAutocomplete = acp.utils.shouldAutocomplete();
  if (!shouldAutocomplete) return;
    
  // if typed
  if (acp.el.input.typed(e)) {

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
        nextSg = acp.el.menu.querySelector('.icon:first-of-type');
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

      acp.curr.topHit = nextSg.textContent;

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

      acp.curr.topHit = prevSg.textContent;

      let topHitText = '<b>' + acp.curr.query + '</b>' + acp.curr.topHit.slice(acp.curr.query.length);

      // if top hit is a CSS property, add :
      if (acp.curr.lang === 'css') topHitText += ':';

      acp.el.topHit.innerHTML = topHitText;

    } else if (e.key === 'Enter') {

      // add suggestion to text

      e.preventDefault();

      let topHitText = acp.curr.topHit.slice(acp.curr.query.length);

      // if top hit is a CSS property, add :
      if (acp.curr.lang === 'css') topHitText += ': ';

      // clear results
      acp.curr.results = [];
      acp.curr.topHit = '';

      // hide menu
      acp.utils.hideAcpMenu();

      acp.el.input.insert(topHitText);

    }

  }

}


// hide menu on caret move
acp.event.hideMenuOnCaretMove = () => {

  // if didn't type but menu is visible
  if (!acp.didType &&
      acp.el.menu.classList.contains('visible')) {
    
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


// if autocomplete menu is visible,
// prevent auto-tab on enter
acp.el.input.options.shouldAutoTabFunc = () => {
  
  if (acp.el.menu.classList.contains('visible')) {
    
    return false;
    
  } else {
    
    return true;
    
  }
  
}


// add event listeners

acp.el.input.on('keydown caretmove', acp.event.autocompleteOnType);
acp.el.input.on('keydown', acp.event.handleMenuNavigation);

acp.el.input.on('caretmove', acp.event.hideMenuOnCaretMove);
acp.el.input.on('scroll', acp.event.hideMenuOnScroll);



// check if should autocomplete
acp.utils.shouldAutocomplete = () => {
  
  const input = acp.el.input;
  
  // if input isn't focused, return
  if (input !== document.activeElement) return false;
  
  const cursor = input.dropper.cursor();
  const cursorCollapsed = cursor.collapsed;
  
  // if cursor not collapsed, return
  if (!cursorCollapsed) return false;
    
  acp.curr.lang = acp.utils.getSelectionLanguage();
  
  const currLang = acp.curr.lang;
  
  // if can't autocomplete language, return
  if (!acp.language[currLang]) return false;
  
  return true;
  
}


// get current selection language
acp.utils.getSelectionLanguage = () => {
  
  const input = acp.el.input;
  
  const cursor = input.dropper.cursor();
  const cursorEl = cursor.startContainer === input ? input : cursor.getParent();
  
  // get selection language
  const selLang = Prism.util.getLanguage(cursorEl);
  
  return selLang;
  
}


// get autocomplete query
acp.utils.getQuery = (textBeforeCursor) => {

  const textAfter = acp.el.input.afterCursor();
  
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


// sort matches
acp.utils.sort = (matches) => {

  if (matches.length > 0) {
    
    matches = matches.sort((match1, match2) => match1.length - match2.length);
  
  }
  
  return matches;
  
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
  
  // move menu to cursor
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


// render top hit HTML
acp.utils.renderTopHitHTML = (topHit, query) => {
  
  let topHitHTML = '<b>' + query + '</b>' + topHit.slice(query.length);

  // if top hit is a CSS property, add :
  if (acp.curr.lang === 'css') topHitHTML += ':';

  return topHitHTML;
  
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


// move autocomplete menu to cursor
acp.utils.moveMenuToCursor = () => {
  
  const input = acp.el.input;
  const cursor = input.dropper.cursor();
  
  const [top, left] = acp.utils.getCaretPos(cursor, acp.curr.query);

  // if sidebar is expanded, move menu left
  let leftMargin = 0;
  if (body.classList.contains('expanded')) leftMargin = 350;

  acp.el.menu.style.top = top + 'px';
  acp.el.menu.style.left = left - leftMargin + 'px';

  acp.el.topHit.style.top = top + 'px';
  acp.el.topHit.style.left = left - leftMargin + 'px';

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

