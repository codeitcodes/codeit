
/*
 * logger
 * ------
 * override and display logs
 *
 * --- 
 *
 * usage:
 * 
   logger.init(contextWindow, logCallback(e), ?options);
 *
 * definitions:
 *
 * logCallback({ type, arguments: [{ data, shouldHighlight, dataType, rawData }] })
 *
 * > type [string] - the log type.
                     you might like to style ['warning', 'error', 'debug', 'clear'] differently and display the rest as normal 'log's.
                     see https://developer.mozilla.org/en-US/docs/Web/API/console for more info about the possible types.
 *
 * > arguments [array] - an array of the arguments passed to the console function.
 *
 * >> argument.data [string] - the stringified, HTML-escaped argument.
 *
 * >> argument.shouldHighlight [boolean] - specifies whether you should highlight the argument data using a syntax highlighter.
                                           by default, options.shouldNotHighlightDataTypes = ['string'].
 *
 * >> argument.dataType [string] - the argument's type (eg. 'string', 'object', 'array').
 *
 * >> argument.rawData [argument.dataType] - the raw argument.
 *
 */

let logger = {

  log: null, // log callback
  cW: null, // context window
  
  overrides: {}, // original console functions before overriding
  
  options: {
    shouldNotHighlightDataTypes: ['string'],
    enableBrowserConsole: true
  },
  
  init: (contextWindow, logCallback, options = {}) => {

    logger.cW = contextWindow;
    logger.log = logCallback;
    
    // apply options
    for (option in options) {
      
      if (option in logger.options) {
        
        logger.options[option] = options[option];
        
      }
      
    }
    
    // override console logs
    logger.override();

  },
  
  
  override: () => {
    
    // get console functions in context window
    // (note: using Object.getOwnPropertyNames() instead of Object.keys() to get innumerable props)
    const consoleFuncs = Object.getOwnPropertyNames(logger.cW.console)
                          .filter(item => (typeof logger.cW.console[item] === 'function'));
    
    // run on all console functions
    consoleFuncs.forEach(func => {
      
      // override console function
      logger.overrideFunc(func, logger.cW.console);
      
    });
    
    // override errors not created by console.error
    logger.cW.addEventListener('error', (e) => {
      
      // get error message
      let errorMessage = e.error.stack;
      
      
      // replace absolute URLs with relative URLs in message
      
      // get origin URL
      let originURL = logger.cW.location.href;
      
      // remove trailing '/' from origin URL
      if (originURL.endsWith('/')) originURL = originURL.slice(0, -1);
      
      // remove all origin URL occurences from error message
      errorMessage = errorMessage.replaceAll(originURL, '');
      
      
      // escape message HTML
      errorMessage = logger.utils.escapeHTML(errorMessage);
      
      // add 'Uncaught' to start of message
      errorMessage = 'Uncaught ' + errorMessage;
      
      
      // place error message in an array
      // for consistency with all other log types
      const rawData = [errorMessage];
      
      // parse log data
      const arguments = logger.utils.parseLogData(rawData);
      
      // call log callback
      logger.log({
        type: 'error',
        arguments: arguments
      });
      
    });
    
  },
  
  
  // override console function
  // currConsole is cW.console
  overrideFunc: (funcName, currConsole) => {
    
    // save original console function in array
    logger.overrides[funcName] = currConsole[funcName];
    
    // override console function
    currConsole[funcName] = (...rawData) => {
      
      // parse log argument data
      const arguments = logger.utils.parseLogData(rawData);
            
      // call log callback
      logger.log({
        type: funcName,
        arguments: arguments
      });
      
      // if should show in browser console
      if (logger.options.enableBrowserConsole) {
        
        // call original console function
        logger.overrides[funcName].apply(currConsole, rawData);
        
      }
      
    }
    
  },
  

  utils: {

    parseLogData: (data) => {
      
      const resp = [];
      
      // parse every argument in data
      data.forEach(argument => {
        
        // parse argument
        let parsedArgument = logger.utils.stringify(argument);
        parsedArgument = logger.utils.escapeHTML(parsedArgument);
        
        // get argument type
        const argumentType = logger.utils.typeOf(argument);
        
        const shouldHighlight = logger.utils.shouldHighlightType(argumentType);
        
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
    
    shouldHighlightType: (type) => {
      
      const notHighlightTypes = logger.options.shouldNotHighlightDataTypes;
      
      const shouldNotHighlight = notHighlightTypes.includes(type);
      
      const shouldHighlight = !shouldNotHighlight;
      
      return shouldHighlight;
      
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

