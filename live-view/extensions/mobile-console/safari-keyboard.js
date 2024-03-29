
/*
 * Safari Keyboard Fixes
 *
 * Usage:
 * 1. Style your input's wrapper element with 'required-styling.css'
 * 2. Run:
      new SafariKeyboard(wrapperEl, input);
 *
 * - input: an editable element
 * - wrapperEl: the input's wrapper element
 */

class SafariKeyboard {
  
  constructor(wrapperEl, input) {
    
    this.wrapperEl = wrapperEl;
    this.input = input;
    
    this.input.addEventListener('focus', this.onInputFocus.bind(this));
    this.input.addEventListener('blur', this.onInputBlur.bind(this));
    
    window.addEventListener('resize', () => {
      
      this.changedOrientation = true;
      
      this.keyboardHeight = null;
      this.smallestFromBottom = -1;
      
    });
    
    window.visualViewport.addEventListener('resize', this.viewportHandler.bind(this));
    
  }
  

  smallestFromBottom = -1;

  keyboardHeight = null;

  changedOrientation = false;
  
  
  safariTimeoutDelay = 70;

  lastBlurTime = 0;

  blurTransitionTimeout;

  
  viewportHandler() {
    
    // if pinch-zoomed in, return
    if (window.visualViewport.scale !== 1) return;
    
    if (!this.keyboardHeight) {
      
      let currFromBottom = (window.visualViewport.height - document.body.clientHeight) * -1;
      
      // don't record if keyboard isn't open yet
      if (currFromBottom === 0) return;
      
      
      // if input is focused
      if (document.activeElement === this.input) {
        
        this.changeWrapperBottom(currFromBottom);
        
      }
      
      
      if (this.smallestFromBottom === -1
          || this.smallestFromBottom > currFromBottom) {
        
        this.smallestFromBottom = currFromBottom;
        
      }
      
    }
      
  }
  

  onInputFocus() {
    
    this.wrapperEl.classList.remove('safari-transitioning-blur');
    
    if (this.blurTransitionTimeout) {
      
      window.clearTimeout(this.blurTransitionTimeout);
      
    }
    
    
    this.updateScrollOnFocus();
    
    
    if (this.keyboardHeight) {
      
      const currTime = new Date().getTime();
      
      const blurDelta = currTime - this.lastBlurTime;
      
      
      // if blur delta was extremely quick
      if (blurDelta < this.safariTimeoutDelay) {
        
        // change wrapper bottom instantly
        this.changeWrapperBottom(this.keyboardHeight);
        
      } else {
        
        // change wrapper bottom with delay
        window.setTimeout(() => {
          
          this.changeWrapperBottom(this.keyboardHeight);
          
        }, this.safariTimeoutDelay);
        
      }
      
    }
    
    
    this.changedOrientation = false;
    
  }
  
  onInputBlur() {
  
    this.wrapperEl.classList.add('safari-transitioning-blur');
  
    this.blurTransitionTimeout = window.setTimeout(() => {
      
      this.wrapperEl.classList.remove('safari-transitioning-blur');
      
    }, 270);
    
    
    this.changeWrapperBottom(0);
    
    
    if (!this.keyboardHeight
        && !this.changedOrientation) {
      
      this.keyboardHeight = this.smallestFromBottom;
    
    }
    
    
    this.lastBlurTime = new Date().getTime();
    
  }
  

  updateScrollOnFocus() {
    
    window.scrollTo(0, 0);
    
    if (document.activeElement === this.input) {
      
      window.requestAnimationFrame(this.updateScrollOnFocus
                                   .bind(this));
      
    }
    
  }
  
  
  changeWrapperBottom(bottom) {
    
    document.body.style.setProperty('--keyboard-height', bottom + 'px');
    
  }
  
}

