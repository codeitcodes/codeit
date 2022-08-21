(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	/**
	 * Plugin name which is used as a class name for <pre> which is activating the plugin
	 *
	 * @type {string}
	 */
	var PLUGIN_NAME = 'line-numbers';

	/**
	 * Regular expression used for determining line breaks
	 *
	 * @type {RegExp}
	 */
	var NEW_LINE_EXP = /\n(?!$)/g;


	/**
	 * Global exports
	 */
	var config = Prism.plugins.lineNumbers = {
		/**
		 * Updates the line numbers of the given element.
		 */
		update: function (element) {
			if (!element.textContent) {
				return;
			}

			// only add line numbers if the element or one of its ancestors has the `line-numbers` class
			if (!Prism.util.isActive(element, PLUGIN_NAME)) {
				return;
			}

			var match = element.textContent.match(NEW_LINE_EXP);
			var linesNum = match ? match.length + 1 : 1;

			var lineNumbersWrapper = element.querySelector('.line-numbers-rows');

			// if line numbers don't exist, create element
			if (!lineNumbersWrapper) {

				lineNumbersWrapper = document.createElement('span');
				lineNumbersWrapper.setAttribute('aria-hidden', 'true');
				lineNumbersWrapper.setAttribute('contenteditable', 'false');
				lineNumbersWrapper.className = 'line-numbers-rows';
				element.prepend(lineNumbersWrapper);

			}

			var lines = [...new Array(linesNum + 1).keys()].splice(1).join('\n');


			// change padding of element according
			// to number of lines

			var lineNumberLength = 1.2; // em
			var lineNumberPadding = (13.5 + 13.5); // px

			if (linesNum < 100) { // 99 or less
				lineNumberLength = 1.2;
			} else if (linesNum < 1000) { // 999 or less
				lineNumberLength = 1.8;
			} else if (linesNum < 10000) { // 9999 or less
				lineNumberLength = 2.4;
			} else if (linesNum < 100000) { // 99999 or less
				lineNumberLength = 3;
			} else if (linesNum < 1000000) { // 999999 or less
				lineNumberLength = 3.6;
			} else if (linesNum < 10000000) { // 9999999 or less
				lineNumberLength = 4.2;
			} else if (linesNum < 100000000) { // 99999999 or less (10 million)
				lineNumberLength = 4.8;
			} else if (linesNum < 1000000000) { // 999999999 or less (1 billion)
				lineNumberLength = 5.4;
			} else if (linesNum < 10000000000) { // 9999999999 or less (10 billion lines)
				lineNumberLength = 6;
			} else { // all numbers above
				lineNumberLength = linesNum.toString().length * 0.6;
			}

			// change padding of element
			element.style.setProperty('--gutter-length', 'calc(' + 
									lineNumberLength + 'em' +
									' + ' +
									lineNumberPadding + 'px' +
								      ')');

			// add line numbers to HTML
			lineNumbersWrapper.setAttribute('line-numbers', lines);
		}
	};

	document.querySelectorAll('.' + PLUGIN_NAME).forEach(el => {
		/*el.on('type', function () {
			config.update(el);
		});*/

    el.on('keydown', (e) => {
      
      if (el.typed(e)) {
        
        config.update(el);
        
      }
      
    })
	});
	
	Prism.hooks.add('complete', function (env) {
		//config.update(env.element);
	});

	Prism.hooks.add('line-numbers', function (env) {
		env.plugins = env.plugins || {};
		env.plugins.lineNumbers = true;
	});

}());
