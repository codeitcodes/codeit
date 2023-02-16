
// mobile console

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
      consoleSheet.classList.remove('visible');
      
    });
    
    this.el.bg.addEventListener('click', () => {
      
      // hide live view console
      consoleSheet.classList.remove('visible');
      
    });
    
    bottomWrapper.addEventListener('touchstart', () => {
      
      if (this.el.sheet.classList.contains('visible')) {
        
        // hide live view console
        this.el.sheet.classList.remove('visible');
      
      }
      
    });
    
    
    // init input
    
    this.el.input.outerHTML = '<cd-el class="input" lang="js"></cd-el>';
    
    this.el.input = this.el.footer.querySelector('.input');
    
    const input = this.el.input;
    
    
    // toggle input empty indicator on type
    input.on('input', (e) => {
      
      // if didn't type in input
      //if (!input.typed(e)) return;
      
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
    
    
    this.el.return.addEventListener('click', () => {
      
      let codeToRun = input.textContent;
      
      input.textContent = '';
      input.focus();
      this.el.footer.classList.remove('empty', 'return-enabled');
      
      this.logger.log(codeToRun, 'input');
      
      codeToRun = codeToRun.replaceAll('`', '\`');
      
      let resp = '';
      
      try {
        
        resp = new Function('return eval(`'+ codeToRun +'`)')();
        
      } catch(e) {
        
        resp = e;
        
      }
      
      this.logger.log(resp, 'resp');
      
      this.el.items.scrollTo(0, this.el.items.scrollHeight);
      
    });
  
  },
  
  logger: {
    
    log: function(code, type) {
      
      let icon = this.icons[type];
      if (!icon) icon = '';
      
      const logHTML = `
      <div class="item">
        `+ icon +`
        <cd-el class="code" edit="false" lang="js">`+ escapeHTML(code) +`</cd-el>
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
      `
        
    }
    
  }
  
}


if (isMobile) {
  
  consoleSheet.init();
  
}
