
/*
 * logger
 * ------
 * display logs and run code
 *
 * --- 
 *
 * usage:
 * 
 * - init
 *
   logger.init(contextWindow, logCallback(e), ?options);
 *
 * - run code with
 * 
   logger.run(codeStr);
 *
 *
 * definitions:
 *
 * logCallback({ type, arguments: [{ data, shouldHighlight, dataType, rawData }] })
 *
 * > type [string] - the log type.
                     you might like to style ['resp', 'warning', 'error', 'debug', 'clear'] differently and display the rest as normal 'log's.
                     see https://developer.mozilla.org/en-US/docs/Web/API/console for more info about the possible types.
 *
 * > arguments [array] - an array of the arguments passed to the console function.
 *
 * >> argument.data [string] - the stringified, HTML-escaped argument.
 *
 * >> argument.shouldHighlight [boolean] - specifies whether you should highlight argument.data using a syntax highlighter.
                                           by default, options.shouldNotHighlightArgTypes = ['string'].
 *
 * >> argument.dataType [string] - the argument's type (eg. 'string', 'object', 'array', ...).
 *
 * >> argument.rawData [argument.dataType] - the raw argument.
 *
 */

// next steps:
// - custom Prism theme for objects & arrays
// - expandable objects

let logger = {

  options: {
    shouldNotHighlightArgTypes: ['string'],
    browserConsoleEnabled: true
  },
  
  
  logCallback: null,
  cW: null, // context window
  
  origFuncs: {}, // original console functions before overriding
  
  
  init: (contextWindow, logCallback, options = {}) => {

    logger.cW = contextWindow;
    logger.logCallback = logCallback;
    
    // apply options
    for (option in options) {
      
      if (option in logger.options) {
        
        logger.options[option] = options[option];
        
      }
      
    }
    
    // override console logs
    logger.override();

  },
  
  
  // run code in context
  run: (codeStr) => {
    
    const contextWindow = logger.cW;
    
    // if context window isn't defined, return
    if (!contextWindow) return;
    

    // call 'input' log callback
    logger.log('input', [codeStr]);


    // run code in context
    
    const evalFunc = contextWindow.eval;
    
    let resp;
    
    try {
    
      resp = evalFunc(codeStr);
      
    } catch(e) {
      
      // catch error to prevent stopping the code which ran this function.
      // use a different way to propagate the error to the console.
      // (console.error instead of throw)
      
      
      // get error message
      
      const errorTitle = e.toString();
      
      // +1 to remove additional \n at end of title
      let stackTrace = e.stack.slice(errorTitle.length + 1);
      
      // get trace line and position
      stackTrace = stackTrace
                     .split(')\n')[0]
                     .split('<anonymous>')[1];
      
      const errorMessage = errorTitle +
                           '\n    at <anonymous>' +
                           stackTrace;
      
      
      // propagate the error message back to the console
      console.error(errorMessage);
      
    }
    
    
    // call 'resp' log callback
    logger.log('resp', [resp]);
    
  },
  
  
  override: () => {
    
    // get console functions in context window
    // (note: using Object.getOwnPropertyNames() instead of Object.keys() to get innumerable props)
    const consoleFuncs = Object.getOwnPropertyNames(logger.cW.console)
                          .filter(item => (typeof logger.cW.console[item] === 'function'));
    
    // run on all console functions
    consoleFuncs.forEach(funcName => {
      
      // override console function
      logger.overrideFunc(funcName);
      
    });
    
    // override errors not created by console.error
    logger.errorEvent.override();
    
  },
  
  
  // override console function
  overrideFunc: (funcName) => {
    
    const currConsole = logger.cW.console;
    
    // save original console function in array
    logger.origFuncs[funcName] = currConsole[funcName];
    
    // override console function
    currConsole[funcName] = (...argArray) => {
      
      // call log callback
      logger.log(funcName, argArray);
      
      
      // if browser console enabled
      
      const browserConsoleEnabled = logger.options.browserConsoleEnabled;
      
      if (browserConsoleEnabled) {
        
        // call original console function
        logger.origFuncs[funcName].apply(currConsole, argArray);
        
      }
      
    }
    
  },
  
  
  // override errors not created by console.error
  errorEvent: {
    
    override: () => {
      
      const callback = logger.errorEvent.callback;
      
      logger.cW.addEventListener('error', callback);
      
    },
    
    getMessage: (e) => {
      
      // get error message
      let errorMessage = e.error.stack;
      
      
      // replace absolute URLs with relative URLs in message
      
      // get origin URL
      const location = logger.cW.location;
      let originURL = location.origin + location.pathname;
            
      // remove all origin URL occurences from error message
      errorMessage = errorMessage.replaceAll(originURL, '');
      
      
      // add 'Uncaught' to start of message
      errorMessage = 'Uncaught ' + errorMessage;
      
      
      return errorMessage;
      
    },
    
    callback: (e) => {
      
      const errorMessage = logger.errorEvent.getMessage(e);
      
      // call 'error' log callback
      logger.log('error', [errorMessage]);
      
    }
    
  },
  
  
  log: (type, argArray) => {
    
    // parse log argument data
    const parsedArgs = logger.utils.parseLogArgs(argArray);
    
    // call log callback
    logger.logCallback({
      type: type,
      arguments: parsedArgs
    });
    
  },


  utils: {

    parseLogArgs: (argArray) => {
      
      const resp = [];
      
      // run on all arguments
      argArray.forEach(argument => {
        
        // parse argument
        let parsedArgument = logger.utils.stringify(argument);
        parsedArgument = logger.utils.escapeHTML(parsedArgument);
        
        // get argument type
        const argumentType = logger.utils.typeOf(argument);
        
        const shouldHighlight = logger.utils.shouldHlArgType(argumentType);
        
        // push parsed argument to array
        resp.push({
          data: parsedArgument,
          shouldHighlight: shouldHighlight,
          dataType: argumentType,
          rawData: argument
        });
        
      });
      
      return resp;
      
    },
    
    shouldHlArgType: (type) => {
      
      const notHlTypes = logger.options.shouldNotHighlightArgTypes;
      
      const shouldNotHlArg = notHlTypes.includes(type);
      
      const shouldHlArg = !shouldNotHlArg;
      
      return shouldHlArg;
      
    },
    
    // see https://stackoverflow.com/a/13926334
    typeOf: (obj) => {
      
      return ({}).toString.call(obj).match(/\s(\w+)/)[1].toLowerCase();
      
    },
    
    // escape HTML
    escapeHTML: (str) => {
    
      const p = document.createElement('p');
      p.appendChild(document.createTextNode(str));
    
      let resp = p.innerHTML;
      resp = resp.replaceAll(/"/g, "&quot;").replaceAll(/'/g, "&#039;");
    
      return resp;
    
    },
    
    
    /*
     * Stringify
     * Inspects objects, functions, arrays, classes and other types
     * and turns them into plain text.
     *
     * Note: Does not escape HTML.
     *
     * A heavily modified version of:
     * https://github.com/jsbin/jsbin
     */
    stringify: (function () {

      var sortci = function(a, b) {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
      };

      /**
       * Recursively stringify an object. Keeps track of which objects it has
       * visited to avoid hitting circular references, and a buffer for indentation.
       * Goes 2 levels deep.
       */
      return function stringify(o, visited, buffer) {
        var i, vi, type = '', parts = [], circular = false;
        buffer = buffer || '';
        visited = visited || [];

        // Get out fast with primitives that don't like toString
        if (o === null) {
          return 'null';
        }
        if (typeof o === 'undefined') {
          return 'undefined';
        }

        // Determine the type
        try {
          type = ({}).toString.call(o);
        } catch (e) { // only happens when typeof is protected (...randomly)
          type = '[object Object]';
        }

        // Handle the primitive types
        if (type == '[object Number]') {
          return ''+o;
        }
        if (type == '[object Boolean]') {
          return o ? 'true' : 'false';
        }
        if (type == '[object Function]') {
          
          const func = o.toString();
          
          // if not in object
          if (buffer.length / 2 < 1) {
            
            /*
            if (func.startsWith('function')) {
              
              // replace 'function' with 'f'
              let resp = func.replace('function', '');
              if (resp.startsWith(' ')) resp = resp.replace(' ', '');
              
              resp = 'f ' + resp;
              
              return resp;
              
            } else {
              
              // return function
              return func;
              
            }
            */
            
            // return function
            return func.split('\n  ').join('\n  ' + buffer);
        
          } else {
            
            if (func.startsWith('function')) {
              
              // return function without contents
              let resp = func.split(')')[0] + ')';
              
              /*
              // replace 'function' with 'f'
              resp = resp.replace('function', '');
              if (resp.startsWith(' ')) resp = resp.replace(' ', '');
              
              resp = 'f ' + resp;
              */
              
              return resp;
              
            } else {
              
              // return function
              return func.split('\n  ').join('\n' + buffer);
              
            }
            
          }
          
        }
        if (type == '[object String]') {
          
          let string = o;
          
          // if not in object
          if (buffer.length / 2 < 1) {
            
            return string;
            
          } else {
            
            // replace newlines with "\n"
            string = string.replace(/\n/g, '\\n');
            
            // surround string with quotes
            string = '"' + string.replaceAll(/"/g, '\\"') + '"';
            
            return string; 
            
          }
          
        }

        // Check for circular references
        for (vi = 0; vi < visited.length; vi++) {
          if (o === visited[vi]) {
            // Show that a circular object was found
            
            const typeStr = type.replace('[object ', '').replace(']', '');
            
            /*
            // if available, show the object's nodeName (for nodes)
            if ('nodeName' in o) {
              
              return o.nodeName.toLowerCase();
              
            } else {*/
              
            return typeStr + ' {...}';
              
            /*}*/
            
            /*
            return '[' + circular ' + type.slice(1) +
              ('outerHTML' in o ? ':\n' + (o.outerHTML).split('\n').join('\n' + buffer) : '')
            */
            
          }
        }

        // Remember that we visited this object
        visited.push(o);

        // Stringify each member of the array
        if (type == '[object Array]') {
          for (i = 0; i < o.length; i++) {
            parts.push(stringify(o[i], visited, buffer));
          }
          return '[' + parts.join(', ') + ']';
        }

        // Fake array – very tricksy, get out quickly
        if (type.match(/Array/)) {
          return type;
        }

        var typeStr = type + ' ';
        var newBuffer = buffer + '  ';

        // Dive down if we're less than 2 levels deep
        if (buffer.length / 2 < 2) {

          var names = [];
          // Some objects don't like 'in', so just skip them
          try {
            for (i in o) {
              names.push(i);
            }
          } catch (e) {}

          names.sort(sortci);
          for (i = 0; i < names.length; i++) {
            try {
              parts.push(newBuffer + names[i] + ': ' + stringify(o[names[i]], visited, newBuffer));
            } catch (e) {}
          }

        }

        typeStr = typeStr.replace('[object ', '').replace(']', '');

        // If nothing was gathered, return empty object
        if (!parts.length) return typeStr + '{...}';
        
        const excludeTypes = ['Object', 'Array', 'Number', 'Boolean', 'Function', 'String'];
        
        if (excludeTypes.includes(typeStr.slice(0, -1))) {
          typeStr = '';
        } else { // if type isn't in list
          
          /*
          // if object has a node name
          if ('nodeName' in o && o.nodeName !== '') {
              
            typeStr = o.nodeName.toLowerCase() + ' ';
              
          }*/
          
        }
        
        // Return the indented object with new lines
        return typeStr + '{\n' + parts.join(',\n') + '\n' + buffer + '}';
      };
    }())
    
  }
    
}

