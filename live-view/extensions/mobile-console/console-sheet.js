
// mobile console sheet

class ConsoleSheet {
  
  options = {
    maxLogLength: 1200
  };

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
    
    
    // group identical consecutive logs
    
    let lastLog = logWrapper.querySelector('.log:last-of-type');
    
    let logsAreOfSameType = false;
    
    if (lastLog) {
      
      if (log.type !== 'log') {
        
        logsAreOfSameType = lastLog.classList.contains(log.type);
        
      } else {
        
        // handle the special case for a 'log' type log,
        // since all logs already have a 'log' class
        logsAreOfSameType = lastLog.classList.contains('type-log');
        
      }
      
    }
    
    // if logs are of the same type,
    // and aren't of type 'input'
    if (logsAreOfSameType &&
        log.type !== 'input') {
      
      let lastLogHTML = lastLog.outerHTML;
      
      const duplicateBadgeHTML = `
        <div class="duplicate-badge">2</div>
      `.trim();
      
      const tempLogHTML = logHTML.replace('<div class="data safari-margin-left-update">', '<div class="data">');
      const tempLastLogHTML = lastLogHTML.replace('<div class="data safari-margin-left-update">', '<div class="data">');
      
      const currLogDataAndActions = tempLogHTML.trim().split('<div class="data">')[1];
      const lastLogDataAndActions = tempLastLogHTML.trim().split('<div class="data">')[1];
      
      // if the current and last logs are identical
      if (currLogDataAndActions === lastLogDataAndActions) {
        
        const duplicateBadge = lastLog.querySelector('.duplicate-badge');
        
        // if the log already had duplicates
        if (duplicateBadge) {
          
          // bump its 'duplicate' counter
          
          let currValue = duplicateBadge.textContent;
          
          if (currValue !== '999+') {
            
            currValue = Number(currValue) + 1;
            
            if (currValue <= 999) {
            
              duplicateBadge.textContent = currValue;
              
            } else {
              
              duplicateBadge.textContent = '999+';
              
            }
            
          }
          
          
          // animate its 'duplicate' badge
          
          duplicateBadge.classList.add('animating');
          
          if (isSafari) {
            
            onNextFrame(() => {
              
              duplicateBadge.classList.remove('animating');
              
            });
            
          } else {
            
            window.setTimeout(() => {
              
              duplicateBadge.classList.remove('animating');
              
            }, 20);
            
          }
          
        } else {
          
          // add a new 'duplicate' badge to the log
          
          const dataWrapper = lastLog.querySelector('.data-wrapper');
          
          dataWrapper.insertAdjacentHTML('afterbegin', duplicateBadgeHTML);
          
          
          const logIcon = lastLog.querySelector('.icon');
          
          // if the log has an icon, remove it
          if (logIcon) logIcon.remove();
          
          
          // fix Safari not updating the data's margin-left
          if (isSafari) {
            
            const data = dataWrapper.querySelector('.data');
            
            data.classList.add('safari-margin-left-update');
            
            onNextFrame(() => {
              
              data.classList.remove('safari-margin-left-update');
              
            });
            
          }
          
        }
        
        // return so we won't add the new log
        return;
        
      }
      
    }
    
    
    // add log to HTML
    // note: we're not using innerHTML because we want
    // to keep the action event listeners
    logWrapper.insertAdjacentHTML('beforeend', logHTML);
    
    
    if (logWrapper.classList.contains('empty')) {
      
      // remove 'empty' class from log wrapper
      logWrapper.classList.remove('empty');
      
    }
    
    
    // if was scrolled to bottom
    if (scrolledToBottom) {
      
      // scroll to bottom of logs
      this.scrollToBottom();
      
    }
    
    
    // add log action listeners
    
    lastLog = logWrapper.querySelector('.log:last-of-type');
    
    this.addLogActionListeners(lastLog);
    
  }
     
  getLogHTML(log) {
    
    // parse log arguments
    
    let out = '';
    
    let rawLogText = ''; // note: this can contain unescaped HTML
    
    let exceededMaxLength = false;
    
    log.arguments.forEach(argument => {
      
      let data = argument.data;
      
      
      const unescapedArgData = this.utils.unescapeHTML(data);
      
      // add spaces between adjacent arguments
      rawLogText += unescapedArgData + ' ';
      
      
      if (exceededMaxLength) return;
      
      
      const maxLogLength = this.options.maxLogLength;
      
      // if log length exceeded max
      // (don't overflow input logs because it'll make their highlighted HTML break)
      if (maxLogLength < rawLogText.length
          && log.type !== 'input') {
        
        exceededMaxLength = true;
        
        
        const totalLogLength = rawLogText.length;
        
        const overflowLength = totalLogLength - maxLogLength - 1;

        
        const argLength = unescapedArgData.length;
        
        const notInOverflowLength = argLength - overflowLength;

        // if the argument is completely hidden, return
        if (notInOverflowLength === 0) {
          
          return;
          
        }
        
        
        // slice argument to overflow cap
        
        let slicedArgData = unescapedArgData.slice(0, -overflowLength);
        
        slicedArgData = escapeHTML(slicedArgData);
        
        data = slicedArgData;
        
      }
      
      
      let argumentHTML = 
      `<span class="argument object-value-` + escapeHTML(argument.dataType) + `">` +
        data +
      `</span>`;
      
      // add spaces between adjacent arguments
      argumentHTML += ' ';
      
      // add argument HTML to log
      out += argumentHTML;
      
    });
    
    // remove trailing space
    out = out.slice(0, -1);
    rawLogText = rawLogText.slice(0, -1);
    
    
    // get log icon
    
    let icon = this.logIcons[log.type];
    
    if (!icon) icon = '';
    
    
    // no border between subsequent input-resp logs
    
    const lastLog = this.el.logWrapper.querySelector('.log:last-of-type');
    
    if (log.type === 'resp'
        && lastLog.classList.contains('input')) {
      
      lastLog.classList.add('no-border-bottom');
      
    }
    
    
    // add action buttons to HTML
    
    let actionButtons = '';
    
    if (exceededMaxLength) {
      
      const maxLogLength = this.options.maxLogLength;
      
      
      let remainingText = rawLogText.slice(maxLogLength);
      
      remainingText = escapeHTML(remainingText);
      
      
      const logSize = this.utils.getStrSize(rawLogText);
      
      
      // note: the 'tabindex' property on the action elements marks them as 'focusable'.
      // we can use that to determine whether the input got blurred when the actions were clicked,
      // so if the input did get blurred, we'll know we need to refocus it.
      
      actionButtons = `
      <div class="actions" remainingText="` + remainingText + `">
        <div class="more action link-style" tabindex="0">
        Show more
        </div>
        <div class="seperator">·</div>
        <div class="copy action link-style" tabindex="0">
        Copy all (` + logSize + `)
        </div>
      </div>
      `;
      
    }
    
    
    let logType = log.type;
    if (logType === 'log') logType = 'type-log';
    
    const logHTML = `
    <div class="log ` + escapeHTML(logType) + `">
      <div class="data-wrapper">
        ` + icon + `
        <div class="data">` + out + `</div>
      </div>
      ` + actionButtons + `
    </div>
    `;
    
    return logHTML;
    
  }
  
  
  addLogActionListeners(log) {
    
    const actions = log.querySelectorAll('.actions .action');
    
    actions.forEach(action => {
      
      action.addEventListener('click', () => {
        
        this.onLogActionClick(action);
        
      });
      
      // refocus input if clicked on action
      action.addEventListener('focus', this.refocusInputIfBlurred.bind(this));
      
    });
    
  }
  
  // on click of 'show more' or 'copy all' log actions
  onLogActionClick(actionEl) {
    
    const actionWrapper = actionEl.parentElement;
    
    const remainingText = getAttr(actionWrapper, 'remainingText');
    
    if (actionEl.classList.contains('more')) {
      
      const maxLogLength = this.options.maxLogLength;
      
      const logEl = actionWrapper.parentElement;
      
      const dataEl = logEl.querySelector('.data');
      
      const textToAdd = remainingText.slice(0, maxLogLength);
      const newRemainingText = remainingText.slice(maxLogLength);
      
      dataEl.textContent += textToAdd;
      
      // if all text has been displayed
      if (newRemainingText === '') {
        
        // remove 'show more' button
        actionEl.remove();
        actionWrapper.querySelector('.seperator').remove();
        
      }
      
      setAttr(actionWrapper, 'remainingText', newRemainingText);
      
      
      // update 'jump to bottom' button if needed
      
      const atBottom = this.isScrolledToBottom();
      
      this.el.jumpToBottom.classList.toggle('visible', !atBottom);
      
    } else if (actionEl.classList.contains('copy')) {
      
      const logEl = actionWrapper.parentElement;
      
      const dataEl = logEl.querySelector('.data');
      
      const data = dataEl.textContent + remainingText;
      
      copy(data).then(() => {
        showMessage('Copied log!');
      });
      
    }
    
  }
  
  
  onReturnClick(e) {
    
    e.preventDefault();
    
    
    const input = this.el.input;
    
    const hlInputText = input.innerHTML;
    
    const inputText = input.textContent;
    
    
    // clear input
    this.clearInput();
    
    
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
    
    
    // on click of close button or live view header, hide
    
    this.el.close.addEventListener('click', () => {

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
    
    
    // jump to bottom on click of button
    this.el.jumpToBottom.addEventListener('touchend', (e) => {
      
      e.preventDefault();
      
      this.scrollToBottom();
      
    });

    // hide 'jump to bottom' button when at bottom
    this.el.logWrapper.addEventListener('scroll', () => {
      
      const atBottom = this.isScrolledToBottom();
      
      this.el.jumpToBottom.classList.toggle('visible', !atBottom);
      
    });
    
    // refocus input if clicked on 'jump to bottom' button
    this.el.jumpToBottom
      .addEventListener('focus',
                        this.refocusInputIfBlurred
                          .bind(this));
    
    
    // init input

    this.el.input.outerHTML = '<cd-el class="input" lang="js" tabindex="0"></cd-el>';

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
      
      
      if (isSafari) {
        
        // fix Safari scrolling the logs up when typing in input
        safariLastInputTime = new Date().getTime();
        
      }
      
    });
    
    
    // move text up if was scrolled to bottom and input resized
    
    let prevInputHeight = input.clientHeight;
    
    function onInputResize() {
      
      const currInputHeight = input.clientHeight;
      
      const heightDelta = currInputHeight - prevInputHeight;
      
      
      const logWrapper = this.el.logWrapper;
      
      const maxScroll = logWrapper.scrollHeight - logWrapper.clientHeight;
      
      const wasScrolledToBottom = (Math.floor(logWrapper.scrollTop) === (maxScroll - heightDelta));
      
      
      if (heightDelta > 0 && wasScrolledToBottom) {
        
        if (!isSafari) {
          
          this.scrollToBottom();
          
        } else {
          
          // prevent fixing Safari scroll position, because we scrolled on purpose
          safariLastInputTime = 0;
          
          this.scrollToBottom();
          
          safariLastScrollPos = logWrapper.scrollTop;
          
        }
        
      }
      
      
      prevInputHeight = currInputHeight;
      
      
      // move 'jump to bottom' button
      this.el.jumpToBottom.style.setProperty('--input-height', currInputHeight + 'px');
      
    }
    
    // when input resizes, update
    new ResizeObserver(onInputResize.bind(this)).observe(input);
    
    
    let safariLastInputTime = 0;
    let safariLastScrollPos = 0;
    
    if (isSafari) {
      
      // fix Safari scrolling the logs up when typing in input
      this.el.logWrapper.addEventListener('scroll', () => {
        
        onNextFrame(() => {
          
          const currTime = new Date().getTime();
          
          const deltaTime = currTime - safariLastInputTime;
          
          if (deltaTime === 0) {
            
            this.el.logWrapper.scrollTop = safariLastScrollPos;
            
            safariLastInputTime = 0;
            
          }
          
          safariLastScrollPos = this.el.logWrapper.scrollTop;
          
        });
        
      });
      
    }
    
    
    // enable virtual keyboard control for the console sheet
    
    if (!isSafari) {
      
      let lastInputFocusTime = 0;
      
      input.on('focus', () => {
        
        navigator.virtualKeyboard.overlaysContent = true;
        
        lastInputFocusTime = new Date().getTime();
        
      });
      
      input.on('blur', () => {
        
        navigator.virtualKeyboard.overlaysContent = false;
        
        onNextFrame(() => {
          
          body.style.setProperty('--keyboard-height', 0);
          
        });
        
      });
      
      navigator.virtualKeyboard.addEventListener('geometrychange', (e) => {
        
        let keyboardHeight = e.target.boundingRect.height;
        
        if (document.activeElement !== input) {
          
          keyboardHeight = 0;
          
        }
        
        body.style.setProperty('--keyboard-height', keyboardHeight + 'px');
        
        
        // prevent soft-hiding keyboard on Android
        
        const currTime = new Date().getTime();
        const inputFocusTimeDelta = currTime - lastInputFocusTime;
        
        if (document.activeElement === input &&
            inputFocusTimeDelta > 100 &&
            keyboardHeight === 0) {
          
          input.blur();
              
        }
        
      });
      
    }

    
    // refocus input if clicked on return button
    this.el.return.addEventListener('focus', this.refocusInputIfBlurred.bind(this));
    
    
    // add return click listener
    this.el.return
      .addEventListener('touchend',
                        this.onReturnClick
                          .bind(this));
    
    
    if (isSafari) {
      
      // fix keyboard on safari
      new SafariKeyboard(this.el.sheet, this.el.input);
      
    }

    
    // if on dev version
    if (isDev) {
      
      input.on('keydown', (e) => {
        
        // run code on Ctrl/Cmd+Enter
        if (e.key === 'Enter' && isKeyEventMeta(e)) {
  
          e.preventDefault();
  
          this.onReturnClick(e);
  
        }
        
      });
      
    }

  }
  
  
  // refocus input if it was focused
  // but then got blurred by another element
  refocusInputIfBlurred(e) {
    
    const blurredElement = e.relatedTarget;
    
    if (blurredElement === this.el.input) {
      
      e.preventDefault();
      
      this.el.input.focus();
      
    }
    
  }
  
  
  isScrolledToBottom() {
    
    const logWrapper = this.el.logWrapper;
    
    const maxScroll = logWrapper.scrollHeight - logWrapper.clientHeight;
    const scrollTop = logWrapper.scrollTop;
    
    // prevent rounding errors
    const scrolledToBottom = ((maxScroll - scrollTop) < 1);
    
    return scrolledToBottom;
    
  }
  
  scrollToBottom() {
    
    const logWrapper = this.el.logWrapper;
    
    // fix Safari lying about the scroll position
    if (isSafari) {
      
      logWrapper.style.overflowY = 'hidden';
      
      onNextFrame(() => {
        
        logWrapper.style.overflowY = '';
        
      });
      
    }
    
    logWrapper.scrollTop = logWrapper.scrollHeight;
    
  }
  
  
  clearLogs() {
    
    this.el.logWrapper.textContent = '';
    this.el.logWrapper.classList.add('empty');
    
    this.el.jumpToBottom.classList.remove('visible');
    
  }
  
  clearInput() {
    
    this.el.footer.classList.remove('return-enabled');

    this.el.input.textContent = '\n';
    
    this.el.footer.classList.add('input-empty');
    
  }
  
  
  show() {
    
    this.el.sheet.classList.add('visible');
    
    // scroll to bottom of logs
    this.scrollToBottom();
    
  }
  
  hide() {
    
    this.el.sheet.classList.remove('visible');
    
    // clear input
    this.clearInput();
    
    // make sure the sheet hiding animation plays
    onNextFrame(() => {
      
      // blur input
      this.el.input.blur();
      
    });
    
  }
  
  isVisible() {
    
    return this.el.sheet.classList.contains('visible');    
    
  }
  
  
  utils = {
    
    getStrSize: (str) => {
      
      const bytes = (new TextEncoder().encode(str)).length;
      
      return this.utils.formatBytes(bytes);
      
    },
    
    formatBytes: (bytes, decimals = 1) => {
      
      if (!+bytes) return 'Zero bytes';
      
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      let resp = `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
      
      if (resp === '1 bytes') resp = '1 byte';
      
      return resp;
      
    },
    
    unescapeHTML: (str) => {
      
      const doc = new DOMParser().parseFromString(str, 'text/html');
      return doc.documentElement.textContent;
      
    }
  
  };
  
  
  el = {

    sheet: document.querySelector('.console-sheet'),
  
    header: document.querySelector('.console-sheet .header'),
    close: document.querySelector('.console-sheet .header .close'),
    logWrapper: document.querySelector('.console-sheet .logs'),
    jumpToBottom: document.querySelector('.console-sheet .jump-to-bottom'),
    footer: document.querySelector('.console-sheet .footer'),
    input: document.querySelector('.console-sheet .footer .input'),
    'return': document.querySelector('.console-sheet .footer .return')

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
      <path d="M10.1896 5.05809C10.943 3.6473 12.9643 3.6473 13.7177 5.05809L20.671 18.0661C20.8339 18.3709 20.9151 18.7127 20.9067 19.0582C20.8982 19.4038 20.8004 19.7412 20.6227 20.0377C20.4451 20.3341 20.1937 20.5795 19.893 20.7499C19.5923 20.9203 19.2526 21.0099 18.9069 21.01H5.00032C4.6547 21.0099 4.31499 20.9203 4.01429 20.7499C3.7136 20.5795 3.46217 20.3341 3.28452 20.0377C3.10687 19.7412 3.00905 19.4038 3.0006 19.0582C2.99214 18.7127 3.07334 18.3709 3.23627 18.0661L10.1896 5.05809ZM12.2052 5.86637C12.1807 5.821 12.1444 5.7831 12.1001 5.75668C12.0558 5.73026 12.0052 5.71631 11.9536 5.71631C11.9021 5.71631 11.8515 5.73026 11.8072 5.75668C11.7629 5.7831 11.7266 5.821 11.7021 5.86637L4.7488 18.8744C4.72551 18.9179 4.71388 18.9667 4.71504 19.016C4.71621 19.0654 4.73013 19.1136 4.75546 19.156C4.78079 19.1983 4.81665 19.2334 4.85956 19.2578C4.90247 19.2822 4.95097 19.295 5.00032 19.2951H18.9069C18.9563 19.295 19.0048 19.2822 19.0477 19.2578C19.0906 19.2334 19.1265 19.1983 19.1518 19.156C19.1771 19.1136 19.1911 19.0654 19.1922 19.016C19.1934 18.9667 19.1818 18.9179 19.1585 18.8744L12.2052 5.86637ZM12.8111 10.4348V13.293C12.8111 13.5204 12.7207 13.7385 12.5599 13.8993C12.3991 14.0601 12.181 14.1504 11.9536 14.1504C11.7262 14.1504 11.5081 14.0601 11.3473 13.8993C11.1865 13.7385 11.0962 13.5204 11.0962 13.293V10.4348C11.0962 10.2074 11.1865 9.98934 11.3473 9.82854C11.5081 9.66773 11.7262 9.5774 11.9536 9.5774C12.181 9.5774 12.3991 9.66773 12.5599 9.82854C12.7207 9.98934 12.8111 10.2074 12.8111 10.4348ZM13.0969 16.437C13.0969 16.7402 12.9764 17.031 12.762 17.2454C12.5476 17.4598 12.2568 17.5802 11.9536 17.5802C11.6504 17.5802 11.3596 17.4598 11.1452 17.2454C10.9308 17.031 10.8104 16.7402 10.8104 16.437C10.8104 16.1337 10.9308 15.843 11.1452 15.6286C11.3596 15.4141 11.6504 15.2937 11.9536 15.2937C12.2568 15.2937 12.5476 15.4141 12.762 15.6286C12.9764 15.843 13.0969 16.1337 13.0969 16.437Z" fill="currentColor"></path>
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

