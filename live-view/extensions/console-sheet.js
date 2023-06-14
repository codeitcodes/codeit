
// mobile console sheet

let consoleSheet = {

  el: {

    sheet: document.querySelector('.console-sheet'),
  
    header: document.querySelector('.console-sheet .header'),
    close: document.querySelector('.console-sheet .header .close'),
    items: document.querySelector('.console-sheet .items'),
    footer: document.querySelector('.console-sheet .footer'),
    input: document.querySelector('.console-sheet .footer .input'),
    'return': document.querySelector('.console-sheet .footer .return'),

    bg: document.querySelector('.sheet-background')

  },

  init: function() {
    
    // init Draggable
    consoleSheet.Draggable = new Draggable(consoleSheet.el.header);
    
    const draggable = consoleSheet.Draggable;
    
    
    // if swiped down, hide
    draggable.on('swipe', (e) => {
      
      if (e.direction === 'down' &&
          consoleSheet.isVisible()) {
        
        // hide live view console
        consoleSheet.hide();
        
      }
      
    });
    
    
    // on click of close button, background, or live view header, hide
    
    consoleSheet.el.close.addEventListener('click', () => {

      // hide live view console
      consoleSheet.hide();

    });

    consoleSheet.el.bg.addEventListener('click', () => {

      // hide live view console
      consoleSheet.hide();

    });
    
    bottomWrapper.Draggable.on('swipe', (e) => {
      
      if (consoleSheet.isVisible()) {

        // hide live view console
        consoleSheet.hide();

      }

    });


    // init input

    this.el.input.outerHTML = '<cd-el class="input" lang="js"></cd-el>';

    this.el.input = this.el.footer.querySelector('.input');

    const input = this.el.input;


    // toggle input empty indicator on type
    input.on('input', (e) => {

      // toggle input empty indicator

      const empty = (input.textContent === '' || input.textContent === '\n');

      this.el.footer.classList.toggle('empty', empty);


      const text = input.textContent.replaceAll(' ', '').replaceAll('\n', '').replaceAll('\r', '');

      const returnEnabled = (text !== '');

      this.el.footer.classList.toggle('return-enabled', returnEnabled);
    
    });
    
    
    if (isDev) {
      
      input.on('keydown', (e) => {
        
        // run code on Shift+Enter
        if (e.key === 'Enter' && e.shiftKey) {
  
          e.preventDefault();
  
          this.runCode();
  
        }
        
      });
      
    }


    if (isSafari) {

      // change header color to input background color
      // on safari

      input.on('focus', (e) => {

        input.prevThemeColor = document.querySelector('meta[name="theme-color"]').content;
        document.querySelector('meta[name="theme-color"]').content = '#0f1014';

      });

      input.on('focus', () => {

        window.scrollTo(0, 0);

        onNextFrame(() => {

          document.documentElement.style.paddingBottom = body.clientHeight + 'px';

          onNextFrame(() => {

            window.scrollTo(0, body.clientHeight);

          });

        });

      });

      input.on('blur', (e) => {

        document.querySelector('meta[name="theme-color"]').content = input.prevThemeColor;

        document.documentElement.style.paddingBottom = '';

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

    let resp = '';

    try {

      resp = eval(codeToRun);

      consoleSheet.logger.log(resp, 'resp');

    } catch (e) {

      resp = e;

      consoleSheet.logger.log(resp, 'error', false);

    }

    consoleSheet.el.items.scrollTo(0, consoleSheet.el.items.scrollHeight);

  },
  
  show: function() {
    
    consoleSheet.el.sheet.classList.add('visible');
    
  },
  
  hide: function() {
    
    consoleSheet.el.sheet.classList.remove('visible');
    
  },
  
  isVisible: function() {
    
    return consoleSheet.el.sheet.classList.contains('visible');    
    
  },

  logger: {

    log: function(code, type, highlight = true) {

      let icon = this.icons[type];

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
      <div class="item ` + type + `">
        ` + icon + `
        ` + codeEl + escapeHTML(code) + closingCodeEl + `
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
      
      log: ``,
      
      warning: `
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <path d="M12 5.99L19.53 19H4.47L12 5.99ZM2.74 18C1.97 19.33 2.93 21 4.47 21H19.53C21.07 21 22.03 19.33 21.26 18L13.73 4.99C12.96 3.66 11.04 3.66 10.27 4.99L2.74 18ZM11 11V13C11 13.55 11.45 14 12 14C12.55 14 13 13.55 13 13V11C13 10.45 12.55 10 12 10C11.45 10 11 10.45 11 11ZM11 16.25C11 16.1119 11.1119 16 11.25 16H12.75C12.8881 16 13 16.1119 13 16.25V17.75C13 17.8881 12.8881 18 12.75 18H11.25C11.1119 18 11 17.8881 11 17.75V16.25Z" fill="currentColor"></path>
      </svg>
      `,

      error: `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <path d="M13.89 8.7L12 10.59 10.11 8.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 8.7 13.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l1.89 1.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l1.89-1.89c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.38-1.41 0zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      </svg>
      `,
      
      debug: `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" class="icon">
        <path d="M0 0h24v24H0V0z" fill="none"></path>
        <path d="M20 9C20 8.44772 19.5523 8 19 8H17.19C16.74 7.22 16.12 6.55 15.37 6.04L16.295 5.115C16.6844 4.72564 16.6844 4.09436 16.295 3.705V3.705C15.9056 3.31564 15.2744 3.31564 14.885 3.705L13.42 5.17C12.96 5.06 12.49 5 12 5C11.51 5 11.04 5.06 10.59 5.17L9.11689 3.70365C8.72622 3.31477 8.0945 3.3155 7.70473 3.70527V3.70527C7.31517 4.09483 7.3142 4.72613 7.70255 5.11689L8.62 6.04C7.88 6.55 7.26 7.22 6.81 8H5C4.44772 8 4 8.44772 4 9V9C4 9.55228 4.44772 10 5 10H6.09C6.04 10.33 6 10.66 6 11V12H5C4.44772 12 4 12.4477 4 13V13C4 13.5523 4.44772 14 5 14H6V15C6 15.34 6.04 15.67 6.09 16H5C4.44772 16 4 16.4477 4 17V17C4 17.5523 4.44772 18 5 18H6.81C7.85 19.79 9.78 21 12 21C14.22 21 16.15 19.79 17.19 18H19C19.5523 18 20 17.5523 20 17V17C20 16.4477 19.5523 16 19 16H17.91C17.96 15.67 18 15.34 18 15V14H19C19.5523 14 20 13.5523 20 13V13C20 12.4477 19.5523 12 19 12H18V11C18 10.66 17.96 10.33 17.91 10H19C19.5523 10 20 9.55228 20 9V9ZM16 12V15C16 15.22 15.97 15.47 15.93 15.7L15.9142 15.803C15.8585 16.1646 15.7372 16.513 15.5562 16.8309L15.46 17C14.74 18.24 13.42 19 12 19C10.58 19 9.26 18.23 8.54 17L8.45218 16.8481C8.26569 16.5255 8.14093 16.171 8.08427 15.8028L8.07 15.71C8.03 15.48 8 15.23 8 15V11C8 10.77 8.03 10.52 8.07 10.3L8.08585 10.197C8.14148 9.83537 8.26278 9.487 8.44377 9.16905L8.54 9C8.84 8.48 9.26 8.03 9.75 7.69L9.86761 7.60953C10.1667 7.40487 10.5005 7.25611 10.8526 7.17045L11.06 7.12C11.37 7.04 11.69 7 12 7C12.32 7 12.63 7.04 12.95 7.12L13.0806 7.15074C13.4437 7.23616 13.7876 7.38854 14.0948 7.60005L14.24 7.7C14.74 8.04 15.15 8.48 15.45 9.01L15.5417 9.16677C15.7322 9.49266 15.8595 9.85158 15.9169 10.2247L15.93 10.31C15.97 10.53 16 10.78 16 11V12ZM10 15C10 14.4477 10.4477 14 11 14H13C13.5523 14 14 14.4477 14 15V15C14 15.5523 13.5523 16 13 16H11C10.4477 16 10 15.5523 10 15V15ZM10 11C10 10.4477 10.4477 10 11 10H13C13.5523 10 14 10.4477 14 11V11C14 11.5523 13.5523 12 13 12H11C10.4477 12 10 11.5523 10 11V11Z" fill="currentColor"></path>
      </svg>
      `

    }

  }

}


if (isMobile) {

  consoleSheet.init();

}

