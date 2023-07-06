
// mobile console sheet

// @@todo fix error parsing on Safari
// @@todo add 'show more' / 'copy all' buttons when log text exceeds a certain length
// @@todo move text up if scrolled to bottom and input resized
// @@nextsteps display Regexp and Symbols properly in logger (by calling .toString() on them)
// @@nextsteps group identical 'log' type console messages

class ConsoleSheet {

  logCallback(log) {
    
    const logWrapper = this.el.logWrapper;
    
    
    if (log.type === 'clear') {
      
      // clear logs
      logWrapper.innerHTML = this.getLogHTML({
        type: 'clear',
        arguments: []
      });
      
      return;
      
    }
    
    
    // don't show logs without arguments
    if (log.arguments.length === 0) return;
    
    
    const scrolledToBottom = this.isScrolledToBottom();
    
    
    // get log HTML
    const logHTML = this.getLogHTML(log);
    
    // add log to HTML
    logWrapper.innerHTML += logHTML;
    
    
    // if was scrolled to bottom
    if (scrolledToBottom) {
      
      // scroll to bottom of logs
      this.scrollToBottom();
      
    }
    
  }
     
  getLogHTML(log) {
    
    // parse log arguments
    
    let out = '';
    
    log.arguments.forEach(argument => {
      
      let argumentHTML = 
      `<span class="argument object-value-` + escapeHTML(argument.dataType) + `">` +
        argument.data +
      `</span>`;
      
      // add spaces between adjacent arguments
      argumentHTML += ' ';
      
      // add argument HTML to log
      out += argumentHTML;
      
    });
    
    // remove trailing space
    out = out.slice(0, -1);
    
    
    // get log icon
    
    let icon = this.logIcons[log.type];
    
    if (!icon) icon = '';
    
    
    // no border between subsequent input-resp logs
    
    const lastLog = this.el.logWrapper.querySelector('.log:last-of-type');
    
    if (log.type === 'resp'
        && lastLog.classList.contains('input')) {
      
      lastLog.classList.add('no-border-bottom');
      
    }
    
    
    const logHTML = `
    <div class="log ` + escapeHTML(log.type) + `">
      ` + icon + `
      <div class="data">` + out + `</div>
    </div>
    `;
    
    return logHTML;
    
  }
  
  
  onReturnClick(e) {
    
    e.preventDefault();
    e.stopPropagation();
    
    
    const input = this.el.input;
    
    const hlInputText = input.innerHTML;
    
    const inputText = input.textContent;
    

    // clear input
    
    this.el.footer.classList.remove('return-enabled');

    input.textContent = '\n';
    
    this.el.footer.classList.add('input-empty');
    
    input.focus();
    
    
    // scroll to bottom of logs
    this.scrollToBottom();

    
    // show highlighted input in console
    this.logCallback({
      type: 'input',
      arguments: [{
        data: hlInputText,
        dataType: 'input',
        rawData: inputText
      }]
    });
    
    
    // run code
    logger.run(inputText);

  }
  
  
  constructor() {
    
    // init Draggable
    this.Draggable = new Draggable(this.el.header);
    
    const draggable = this.Draggable;
    
    
    // if swiped down, hide
    draggable.on('swipe', (e) => {
      
      if (e.direction === 'down' &&
          this.isVisible()) {
        
        // hide live view console
        this.hide();
        
      }
      
    });
    
    
    // on click of close button, background, or live view header, hide
    
    this.el.close.addEventListener('click', () => {

      // hide live view console
      this.hide();

    });

    this.el.bg.addEventListener('click', () => {

      // hide live view console
      this.hide();

    });
    
    bottomWrapper.Draggable.on('swipe', (e) => {
      
      if (this.isVisible()) {

        // hide live view console
        this.hide();

      }

    });
    
    
    // add shadow to header on scroll
    this.el.logWrapper.addEventListener('scroll', () => {
      
      const scrollTop = this.el.logWrapper.scrollTop;
      
      const scrolledLogs = (scrollTop > 0);
      
      this.el.header.classList.toggle('scrolled', scrolledLogs);
      
    });


    // init input

    this.el.input.outerHTML = '<cd-el class="input" lang="js"></cd-el>';

    this.el.input = this.el.footer.querySelector('.input');

    const input = this.el.input;


    // on type in input
    input.on('type', () => {
      
      // toggle placeholder
      if (input.textContent === '\n') {
        
        this.el.footer.classList.add('input-empty');
        
      } else {
        
        this.el.footer.classList.remove('input-empty');
        
      }
      
      
      // toggle return button
      
      const text = input.textContent.replaceAll(' ', '').replaceAll('\n', '').replaceAll('\r', '');

      const returnEnabled = (text !== '');

      this.el.footer.classList.toggle('return-enabled', returnEnabled);
      
    });
    
    
    // move text up if was scrolled to bottom and input resized
    function onInputResize(e) {

      console.log(e, this.isScrolledToBottom());
      
    }
    
    // when input resizes, update
    new ResizeObserver(onInputResize.bind(this)).observe(input);

    
    // add return click listener
    this.el.return.addEventListener('click',
                                    this.onReturnClick
                                      .bind(this));

    
    if (isSafari) {
      
      // fix keyboard on safari
      new SafariKeyboard(this.el.sheet, this.el.input);
      
    }

    
    // if on dev version
    if (isDev) {
      
      input.on('keydown', (e) => {
        
        // run code on Shift+Enter
        if (e.key === 'Enter' && e.shiftKey) {
  
          e.preventDefault();
  
          this.onReturnClick(e);
  
        }
        
      });
      
    }

  }
  
  
  isScrolledToBottom() {
    
    const logWrapper = this.el.logWrapper;
    
    const maxScroll = logWrapper.scrollHeight - logWrapper.clientHeight;
    
    const scrolledToBottom = (logWrapper.scrollTop >= maxScroll);
    
    return scrolledToBottom;
    
  }
  
  scrollToBottom() {
    
    const logWrapper = this.el.logWrapper;
    
    const maxScroll = logWrapper.scrollHeight - logWrapper.clientHeight;
    
    logWrapper.scrollTo(0, maxScroll);
    
  }
  
  
  show() {
    
    this.el.sheet.classList.add('visible');
    
    // scroll to bottom of logs
    this.scrollToBottom();
    
  }
  
  hide() {
    
    this.el.sheet.classList.remove('visible');
    
    // blur input
    this.el.input.blur();
    
  }
  
  isVisible() {
    
    return this.el.sheet.classList.contains('visible');    
    
  }
  
  
  el = {

    sheet: document.querySelector('.console-sheet'),
  
    header: document.querySelector('.console-sheet .header'),
    close: document.querySelector('.console-sheet .header .close'),
    logWrapper: document.querySelector('.console-sheet .logs'),
    footer: document.querySelector('.console-sheet .footer'),
    input: document.querySelector('.console-sheet .footer .input'),
    'return': document.querySelector('.console-sheet .footer .return'),

    bg: document.querySelector('.sheet-background')

  };
  
  
  logIcons = {

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
    
    warn: `
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

  };

}


// init

if (isMobile) {
  
  (async () => {
    
    await loadScript('live-view/extensions/mobile-console/logger.js');

    if (isSafari) {
      
      await loadScript('live-view/extensions/mobile-console/safari-keyboard.js');
      
    }
  
    window.consoleSheet = new ConsoleSheet();
    
  })();

}

