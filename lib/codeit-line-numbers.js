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
		 * Get node for provided line number
		 *
		 * @param {Element} element pre element
		 * @param {number} number line number
		 * @returns {Element|undefined}
		 */
		getLine: function (element, number) {
			if (element.tagName !== 'PRE' || !element.classList.contains(PLUGIN_NAME)) {
				return;
			}

			var lineNumberRows = element.querySelector('.line-numbers-rows');
			if (!lineNumberRows) {
				return;
			}
			var lineNumberStart = parseInt(element.getAttribute('data-start'), 10) || 1;
			var lineNumberEnd = lineNumberStart + (lineNumberRows.children.length - 1);

			if (number < lineNumberStart) {
				number = lineNumberStart;
			}
			if (number > lineNumberEnd) {
				number = lineNumberEnd;
			}

			var lineIndex = number - lineNumberStart;

			return lineNumberRows.children[lineIndex];
		},

		/**
		 * Resizes the line numbers of the given element.
		 *
		 * This function will not add line numbers. It will only resize existing ones.
		 *
		 * @param {HTMLElement} element A `<pre>` element with line numbers.
		 * @returns {void}
		 */
		resize: function (element) {
			resizeElements([element]);
		},

		/**
		 * Whether the plugin can assume that the units font sizes and margins are not depended on the size of
		 * the current viewport.
		 *
		 * Setting this to `true` will allow the plugin to do certain optimizations for better performance.
		 *
		 * Set this to `false` if you use any of the following CSS units: `vh`, `vw`, `vmin`, `vmax`.
		 *
		 * @type {boolean}
		 */
		assumeViewportIndependence: true
	};

	/**
	 * Resizes the given elements.
	 *
	 * @param {HTMLElement[]} elements
	 */
	function resizeElements(elements) {
		elements = elements.filter(function (e) {
			var codeStyles = getStyles(e);
			var whiteSpace = codeStyles['white-space'];
			return whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line';
		});

		if (elements.length == 0) {
			return;
		}

		var infos = elements.map(function (element) {
			var codeElement = element;
			var lineNumbersWrapper = element.querySelector('.line-numbers-rows');
			if (!codeElement || !lineNumbersWrapper) {
				return undefined;
			}

			/** @type {HTMLElement} */
			var lineNumberSizer = element.querySelector('.line-numbers-sizer');
			var codeLines = codeElement.textContent.split(NEW_LINE_EXP);

			if (!lineNumberSizer) {
				lineNumberSizer = document.createElement('span');
				lineNumberSizer.className = 'line-numbers-sizer';

				codeElement.appendChild(lineNumberSizer);
			}

			lineNumberSizer.innerHTML = '0';
			lineNumberSizer.style.display = 'block';

			var oneLinerHeight = lineNumberSizer.getBoundingClientRect().height;
			lineNumberSizer.innerHTML = '';

			return {
				element: element,
				lines: codeLines,
				lineHeights: [],
				oneLinerHeight: oneLinerHeight,
				sizer: lineNumberSizer,
			};
		}).filter(Boolean);

		infos.forEach(function (info) {
			var lineNumberSizer = info.sizer;
			var lines = info.lines;
			var lineHeights = info.lineHeights;
			var oneLinerHeight = info.oneLinerHeight;

			lineHeights[lines.length - 1] = undefined;
			lines.forEach(function (line, index) {
				if (line && line.length > 1) {
					var e = lineNumberSizer.appendChild(document.createElement('span'));
					e.style.display = 'block';
					e.textContent = line;
				} else {
					lineHeights[index] = oneLinerHeight;
				}
			});
		});

		infos.forEach(function (info) {
			var lineNumberSizer = info.sizer;
			var lineHeights = info.lineHeights;

			var childIndex = 0;
			for (var i = 0; i < lineHeights.length; i++) {
				if (lineHeights[i] === undefined) {
					lineHeights[i] = lineNumberSizer.children[childIndex++].getBoundingClientRect().height;
				}
			}
		});

		infos.forEach(function (info) {
			var lineNumberSizer = info.sizer;
			var wrapper = info.element.querySelector('.line-numbers-rows');

			lineNumberSizer.style.display = 'none';
			lineNumberSizer.innerHTML = '';

			info.lineHeights.forEach(function (height, lineNumber) {
				wrapper.children[lineNumber].style.height = height + 'px';
			});
		});
	}

	/**
	 * Returns style declarations for the element
	 *
	 * @param {Element} element
	 */
	function getStyles(element) {
		if (!element) {
			return null;
		}

		return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
	}

	var lastWidth = undefined;
	window.addEventListener('resize', function () {
		if (config.assumeViewportIndependence && lastWidth === window.innerWidth) {
			return;
		}
		lastWidth = window.innerWidth;

		resizeElements(Array.prototype.slice.call(document.querySelectorAll('pre.' + PLUGIN_NAME)));
	});

	var lastLinesNum = 0;
	Prism.hooks.add('complete', function (env) {
		if (!env.code) {
			return;
		}

		var element = env.element;

		// only add line numbers if the element or one of its ancestors has the `line-numbers` class
		if (!Prism.util.isActive(element, PLUGIN_NAME)) {
			return;
		}

		var match = env.code.match(NEW_LINE_EXP);
		var linesNum = match ? match.length + 1 : 1;
		
		console.log(lastLinesNum, linesNum);
		
		if (linesNum !== lastLinesNum) {
			var lineNumbersWrapper = element.querySelector('.line-numbers-rows');

			// if line numbers don't exist, create element
			if (!lineNumbersWrapper) {

				lineNumbersWrapper = document.createElement('span');
				lineNumbersWrapper.setAttribute('aria-hidden', 'true');
				lineNumbersWrapper.setAttribute('contenteditable', 'false');
				lineNumbersWrapper.className = 'line-numbers-rows';
				element.appendChild(lineNumbersWrapper);

			}

			var lines = [...new Array(linesNum + 1).keys()].splice(1).join('\n');


			// change padding of element according
			// to number of lines

			var lineNumberLength = 1.2; // em
			var lineNumberPadding = (13.5 + 13.5); // px

			// 99 or less
			if (linesNum < 100) {
				lineNumberLength = 1.2;
			} else if (linesNum < 1000) { // 999 or less
				lineNumberLength = 1.78;
			} else if (linesNum < 10000) { // 9999 or less
				lineNumberLength = 2.42;
			} else if (linesNum < 100000) { // 99999 or less
				lineNumberLength = 3;
			} else if (linesNum < 1000000) { // 999999 or less
				lineNumberLength = 3.58;
			} else if (linesNum < 10000000) { // 9999999 or less
				lineNumberLength = 4.2;
			} else if (linesNum < 100000000) { // 99999999 or less (~100 million lines)
				lineNumberLength = 4.78;
			}

			// change padding of element
			element.style.setProperty('--gutter-length', 'calc(' + 
							lineNumberLength + 'em' +
							' + ' +
							lineNumberPadding + 'px' +
							')');

			// add line numbers to HTML
			lineNumbersWrapper.textContent = lines;
			
			// prevent re-highlighting
			element.prev = element.textContent;

			//resizeElements([element]);
			
			Prism.hooks.run('line-numbers', env);
		}
	});

	Prism.hooks.add('line-numbers', function (env) {
		env.plugins = env.plugins || {};
		env.plugins.lineNumbers = true;
	});

}());
