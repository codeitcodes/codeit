(function() {

if (typeof Prism === 'undefined' || typeof document === 'undefined') {
  return;
}


let isMobile = false;

if (navigator.userAgentData && navigator.userAgentData.mobile)
  isMobile = true;

if (navigator.userAgent && navigator.userAgent.includes('Mobile'))
  isMobile = true;

if (isMobile) return;


const input = document.querySelector('cd-el');

const suggestions = document.querySelector('.cd-wrapper .autocomplete');

const topHitEl = document.querySelector('.cd-wrapper .top-hit');


let CSSProps = Array.from(window.getComputedStyle(document.documentElement));

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

const maxChar = 0; // 4

let topHit = '';

let currSuggestions = [];

let selSuggestionIndex = 0;

let prevQuery = '';

let typed = false;


input.on('keydown caretmove', (e) => {

  if (cd.lang === 'css') {

    if (cd.typed(e)) {

      typed = true;

      window.requestAnimationFrame(onType);

    } else {

      typed = false;

    }

  }

});

input.on('caretmove', onCaretMove);


function onType() {

  const cursor = cd.dropper.cursor();

  if (!cursor.collapsed) return;


  const query = getQuery(cursor);


  if (query === prevQuery) return;

  prevQuery = query;


  let out = [];

  selSuggestionIndex = 0;

  if (query !== '' &&
    query !== '\n' &&
    !query.includes(':') &&
    query.length >= maxChar) {

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


input.on('keydown', handleMenuKeydown);

function handleMenuKeydown(e) {

  if (suggestions.classList.contains('visible')) {

    if (e.key === 'ArrowDown') {

      e.preventDefault();

      const active = suggestions.querySelector('.icon.active');
      let next = active.nextElementSibling;

      if (!next) {

        next = suggestions.querySelector('.icon:first-of-type');
        suggestions.scrollTop = 0;

      } else {

        const selIconPos = next.getBoundingClientRect().top - suggestions.getBoundingClientRect().top - 1;

        if (selIconPos > 140) {
          suggestions.scrollTop += next.clientHeight;
        }

      }

      active.classList.remove('active');
      next.classList.add('active');

      topHit = next.textContent;

      let topHitText = '<b>' + prevQuery + '</b>' + topHit.slice(prevQuery.length);

      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ':';

      topHitEl.innerHTML = topHitText;

    } else if (e.key === 'ArrowUp') {

      e.preventDefault();

      let active = suggestions.querySelector('.icon.active');
      let prev = active.previousElementSibling;

      if (!prev) {

        prev = suggestions.querySelector('.icon:last-of-type');
        suggestions.scrollTop = suggestions.scrollHeight;

      } else {

        const selIconPos = prev.getBoundingClientRect().top - suggestions.getBoundingClientRect().top;

        if (selIconPos < 0) {
          suggestions.scrollTop -= prev.clientHeight;
        }

      }

      active.classList.remove('active');
      prev.classList.add('active');

      topHit = prev.textContent;

      let topHitText = '<b>' + prevQuery + '</b>' + topHit.slice(prevQuery.length);

      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ':';

      topHitEl.innerHTML = topHitText;

    } else if (e.key === 'Enter') {

      e.preventDefault();

      cd.history.pos -= 1;
      const record = cd.history.records[cd.history.pos];

      if (record) {

        cd.innerHTML = record.html;
        cd.setSelection(record.pos.start, record.pos.end);

        cd.dispatchTypeEvent();

      }

      if (cd.history.pos < 0) cd.history.pos = 0;
      

      let topHitText = topHit.slice(prevQuery.length);

      // if top hit is a CSS property, add :
      if (!topHit.includes('@')) topHitText += ': ';

      topHit = '';
      topHitEl.innerHTML = '';

      suggestions.classList.remove('visible');
      suggestions.innerHTML = '';

      cd.insert(topHitText);

    }

  }

}


function onCaretMove() {

  if (!typed &&
    suggestions.classList.contains('visible')) {

    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';
    topHitEl.innerHTML = '';

  } else {

    typed = false;

  }

}


function getQuery(cursor) {

  const textAfter = cd.afterCursor();
  
  if (!textAfter.startsWith('\n')) return '';
  

  const textBefore = cd.beforeCursor();

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


function getRangePosOf(originRange) {

  let range = originRange.cloneRange();

  const container = range.startContainer;
  const offset = range.startOffset - prevQuery.length;

  range.setStart(container, offset);

  const rect = range.getBoundingClientRect();

  const pos = [rect.top, rect.left];

  range.detach();

  return pos;

}


function moveSuggestionsToCaret(cursor) {

  const [top, left] = getRangePosOf(cursor);

  // if sidebar is expanded, move suggestions left
  let leftMargin = 0;
  if (body.classList.contains('expanded')) leftMargin = 350;

  suggestions.style.top = top + 'px';
  suggestions.style.left = left - leftMargin + 'px';

  topHitEl.style.top = top + 'px';
  topHitEl.style.left = left - leftMargin + 'px';

}


input.on('scroll', () => {

  if (suggestions.classList.contains('visible')) {

    suggestions.classList.remove('visible');
    suggestions.innerHTML = '';
    topHitEl.innerHTML = '';

  }

});



let preference = {};

/*

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

*/



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

