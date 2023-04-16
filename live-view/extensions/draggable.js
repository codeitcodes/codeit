
/*
 * Draggable.js
 * ------------
 *
 * Usage
 *
 * 1. Create a new instance
 *
   const draggable = new Draggable(el, ?options);
 *
   > options [object] - { requiredMovement [px] }
 * 
 * 2. Add event listeners
 *
   const listener = draggable.on(eventType, callback(event));
 * 
   > eventType [string] - 'drag' | 'swipe'
   < event [object] - {
   <   offset [px],
   <   direction [string] - 'up' | 'down'
   < }
 *
 * 2. Note. You can remove listeners with:
 *
   draggable.removeListener(listener);
 *
 */

class Draggable {
  
  constructor(el, currOptions = null) {
    
    this.el = el;
    
    this.options = {
      requiredMovement: 30, // to be counted as a swipe
      eventHooks: {
        drag: [],
        swipe: []
      }
    };
    
    // update options with selection
    
    if (currOptions) {
      
      Object.keys(this.options).forEach(option => {
        
        if (option in currOptions) {
          
          this.options[option] = currOptions[option];
          
        }
        
      });
      
    }
    
    
    this.#addDragListeners();
    
  }
  
  
  on(eventType, callback) {
    
    const hooks = this.options.eventHooks[eventType];
    
    hooks.push(callback);
    
    return [eventType, hooks.length];
    
  }
  
  removeListener(listener) {
    
    const [eventType, index] = listener;
    const hooks = this.options.eventHooks[eventType];
    
    // remove listener from array
    hooks.splice(index, 1);
    
  }
  
  
  #addDragListeners() {
      
    this.initialY = 0;
    this.offsetY = 0;
    
    this.direction = null;

    this.swiped = false;    
    
    this.#addElListener('touchstart', this.touchStart);
    this.#addElListener('touchmove', this.touchMove);
    this.#addElListener('touchend', this.touchEnd);
    
  }
  
  
  #touchStart(e) {

    this.initialY = this.#getPointerPos(e);

    this.swiped = false;

  }

  #touchMove(e) {

    e.preventDefault();

    
    // get offset from initial pos
    
    const currentY = this.#getPointerPos(e);
    
    this.offsetY = currentY - this.initialY;
    

    // get drag direction
    
    if (this.offsetY < 0) {
      
      this.direction = 'up';
      
    } else {
      
      this.direction = 'down';
      
    }
    
    
    // if not swiped yet
    if (!this.swiped) {
      
      const requiredMovement = this.options.requiredMovement;
      
      // check if the pointer was dragged
      // enough to be counted as a swipe
      this.swiped = (Math.abs(this.offsetY) > requiredMovement);
    
      if (this.swiped) {
        
        this.#callEventHook('swipe', {
          offset: this.offsetY,
          direction: this.direction
        });
        
      }
    
    }

    
    this.#callEventHook('drag', {
      offset: this.offsetY,
      direction: this.direction,
      swiped: this.swiped
    });

  }

  #touchEnd(e) {
    
    // reset values
    
    this.initialY = 0;
    this.offsetY = 0;
    
    this.direction = null;
    
    this.swiped = false;

  }
  
  
  #getPointerPos(e) {
    
    if (e.type.startsWith('touch')) {
      
      return e.touches[0].clientY;
    
    } else {
      
      return e.clientY;
    
    }
    
  }
  
  #callEventHook(eventType, data = null) {
    
    const hooks = this.options.eventHooks;
    
    hooks[eventType].forEach(hook => {
      
      hook(data);
      
    });
    
  }
  
  #addElListener(eventType, callback) {
    
    this.el.addEventListener(eventType, callback.bind(this));
    
  }
  
}

