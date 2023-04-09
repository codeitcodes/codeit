
// mobile console sheet

let consoleSheet = {

  el: {
    
    sheet: document.querySelector('.console-sheet'),
    
    close: document.querySelector('.console-sheet .header .close'),
    items: document.querySelector('.console-sheet .items'),
    footer: document.querySelector('.console-sheet .footer'),
    input: document.querySelector('.console-sheet .footer .input'),
    'return': document.querySelector('.console-sheet .footer .return'),
    
    bg: document.querySelector('.sheet-background')
    
  },

  init: function() {
  
    this.el.close.addEventListener('click', () => {
      
      // hide live view console
      consoleSheet.el.sheet.classList.remove('visible');
      
    });
    
    this.el.bg.addEventListener('click', () => {
      
      // hide live view console
      consoleSheet.el.sheet.classList.remove('visible');
      
    });
    
    bottomWrapper.addEventListener('touchstart', () => {
      
      if (this.el.sheet.classList.contains('visible')) {
        
        // hide live view console
        consoleSheet.el.sheet.classList.remove('visible');
      
      }
      
    });
    
    
    // init input
    
    this.el.input.outerHTML = '<cd-el class="input" lang="js"></cd-el>';
    
    this.el.input = this.el.footer.querySelector('.input');
    
    const input = this.el.input;
    
    
    // toggle input empty indicator on type
    input.on('keydown', (e) => {
      
      // run code on Shift+Enter
      if (e.key === 'Enter' && e.shiftKey) {
        
        e.preventDefault();
        
        this.runCode();
        
      }
      
      
      // if didn't type in input
      if (!input.typed(e)) return;
      
      // wait until finished typing
      onNextFrame(() => {
    
        // toggle input empty indicator
        
        const empty = (input.textContent === '' || input.textContent === '\n');
        
        this.el.footer.classList.toggle('empty', empty);
        
        
        const text = input.textContent.replaceAll(' ', '').replaceAll('\n', '').replaceAll('\r', '');
        
        const returnEnabled = (text !== '');
        
        this.el.footer.classList.toggle('return-enabled', returnEnabled);
        
      });
      
    });
    
    
    if (isSafari) {
      
      // change header color to input background color
      // on safari
      
      input.on('focus', (e) => {
        
        input.prevThemeColor = document.querySelector('meta[name="theme-color"]').content;
        document.querySelector('meta[name="theme-color"]').content = '#0f1014';
        
      });
      
      input.on('blur', (e) => {
        
        document.querySelector('meta[name="theme-color"]').content = input.prevThemeColor;
        
      });
      
    }
    
    
    this.el.return.addEventListener('click', this.runCode);
    
  },
      
  runCode: function() {
    
    const input = consoleSheet.el.input;
    
    let codeToRun = input.textContent;
    
    input.textContent = '';
    input.focus();
    
    consoleSheet.el.footer.classList.remove('return-enabled');
    consoleSheet.el.footer.classList.add('empty');
    
    
    consoleSheet.logger.log(codeToRun, 'input');
    
    codeToRun = codeToRun.replaceAll('`', '\`');
    
    let resp = '';
    
    try {
      
      resp = new Function('return eval(`'+ codeToRun +'`)')();
      
      consoleSheet.logger.log(resp, 'resp');
      
    } catch(e) {
      
      resp = e;
      
      consoleSheet.logger.log(resp, 'error', false);        
      
    }
    
    consoleSheet.el.items.scrollTo(0, consoleSheet.el.items.scrollHeight);
    
  },
  
  logger: {
    
    log: function(code, type, highlight = true) {
      
      if (!type) type = '';
      
      let icon = this.icons[type];
      if (!icon) icon = '';
      
      let codeEl;
      let closingCodeEl;
      
      if (highlight) {
        
        codeEl = `<cd-el class="code" edit="false" lang="js">`;
        closingCodeEl = `</cd-el>`;
        
      } else {
        
        codeEl = `<div class="code">`;
        closingCodeEl = '</div>';
        
      }
      
      const logHTML = `
      <div class="item `+ type +`">
        `+ icon +`
        `+ codeEl + escapeHTML(code) + closingCodeEl +`
      </div>
      `;
      
      consoleSheet.el.items.innerHTML += logHTML;
      
    },
    
    icons: {
      
      input: `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <path d="M9.31 6.71c-.39.39-.39 1.02 0 1.41L13.19 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.72 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
      </svg>
      `,
      
      resp: `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <g xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M18.29,17.29L18.29,17.29c0.39-0.39,0.39-1.02,0-1.41L14.42,12l3.88-3.88c0.39-0.39,0.39-1.02,0-1.41l0,0 c-0.39-0.39-1.02-0.39-1.41,0l-4.59,4.59c-0.39,0.39-0.39,1.02,0,1.41l4.59,4.59C17.27,17.68,17.9,17.68,18.29,17.29z"></path>
          <path d="M11.7,17.29L11.7,17.29c0.39-0.39,0.39-1.02,0-1.41L7.83,12l3.88-3.88c0.39-0.39,0.39-1.02,0-1.41l0,0 c-0.39-0.39-1.02-0.39-1.41,0l-4.59,4.59c-0.39,0.39-0.39,1.02,0,1.41l4.59,4.59C10.68,17.68,11.31,17.68,11.7,17.29z"></path>
        </g>
      </svg>
      `,
      
      error: `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <path d="M13.89 8.7L12 10.59 10.11 8.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 8.7 13.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l1.89 1.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l1.89-1.89c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.38-1.41 0zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      </svg>
      `
      
    }
    
  }
  
}


if (isMobile) {
  
  consoleSheet.init();
  
}

