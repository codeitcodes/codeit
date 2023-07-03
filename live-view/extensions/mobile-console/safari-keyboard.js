
/*
 * Safari Keyboard Fixes
 *
 * Variables prefixed with 'safari' are Safari's '*magical* numbers
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

  viewportChangeCount = 0;

  changedOrientation = false;
  
  safariInitialViewportOffset = 19.5;
  
  
  safariTimeoutDelay = 70;

  blurTransitionTimeout;

  
  viewportHandler() {
    
    if (!this.keyboardHeight) {
      
      let currFromBottom = (window.visualViewport.height - document.body.clientHeight) * -1;
      
      // don't record if keyboard isn't open yet
      if (currFromBottom === 0) return;
      
      
      if (window.orientation === 0
          && !this.changedOrientation) {
        
        this.viewportChangeCount++;
        
        if (this.viewportChangeCount === 1) {
        
          // currFromBottom -= this.safariInitialViewportOffset;
          
        } else if (this.viewportChangeCount === 2) {
          
          this.viewportChangeCount = 0;
          
        }
        
      }
      
      
      this.changeWrapperBottom(currFromBottom);
      
      
      if (this.smallestFromBottom === -1
          || this.smallestFromBottom > currFromBottom) {
        
        console.log(this.smallestFromBottom - currFromBottom);
        
        this.smallestFromBottom = currFromBottom;
        
      }
      
    }
      
  }
  

  onInputFocus() {
    
    this.wrapperEl.classList.remove('transitioning-blur');
    
    if (this.blurTransitionTimeout) {
      
      window.clearTimeout(this.blurTransitionTimeout);
      
    }
    
    
    this.updateScrollOnFocus();
    
    
    if (this.keyboardHeight) {
      
      window.setTimeout(() => {
        
        this.changeWrapperBottom(this.keyboardHeight);
        
      }, this.safariTimeoutDelay);
      
    }
    
    
    this.changedOrientation = false;
    
  }
  
  onInputBlur() {
  
    this.wrapperEl.classList.add('transitioning-blur');
  
    this.blurTransitionTimeout = window.setTimeout(() => {
      
      this.wrapperEl.classList.remove('transitioning-blur');
      
    }, 270);
    
    
    this.changeWrapperBottom(0);
    
    
    if (!this.keyboardHeight
        && !this.changedOrientation) {
      
      this.keyboardHeight = this.smallestFromBottom;
    
    } 
    
  }
  

  updateScrollOnFocus() {
    
    window.scrollTo(0, 0);
    
    if (document.activeElement === this.input) {
      
      window.requestAnimationFrame(this.updateScrollOnFocus
                                   .bind(this));
      
    }
    
  }
  
  
  changeWrapperBottom(bottom) {
    
    this.wrapperEl.style.translate = '0 ' + (bottom * -1) + 'px';
    
  }
  
}

