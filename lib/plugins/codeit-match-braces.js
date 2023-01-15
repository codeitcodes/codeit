(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	function mapClassName(name) {
		var customClass = Prism.plugins.customClass;
		if (customClass) {
			return customClass.apply(name, 'none');
		} else {
			return name;
		}
	}

	var PARTNER = {
		'(': ')',
		'[': ']',
		'{': '}',
	};

	// The names for brace types.
	// These names have two purposes: 1) they can be used for styling and 2) they are used to pair braces. Only braces
	// of the same type are paired.
	var NAMES = {
		'(': 'brace-round',
		'[': 'brace-square',
		'{': 'brace-curly',
	};

	// A map for brace aliases.
	// This is useful for when some braces have a prefix/suffix as part of the punctuation token.
	var BRACE_ALIAS_MAP = {
		'${': '{', // JS template punctuation (e.g. `foo ${bar + 1}`)
	};

	var LEVEL_WARP = 12;

	var pairIdCounter = 0;

	var BRACE_ID_PATTERN = /^(pair-\d+-)(open|close)$/;

	/**
	 * Returns the brace partner given one brace of a brace pair.
	 *
	 * @param {HTMLElement} brace
	 * @returns {HTMLElement}
	 */
	function getPartnerBrace(brace) {
		var match = BRACE_ID_PATTERN.exec(brace.id);
		return document.querySelector('#' + match[1] + (match[2] == 'open' ? 'close' : 'open'));
	}

	/**
	 * @this {HTMLElement}
	 */
	function hoverBrace() {
		[this, getPartnerBrace(this)].forEach(function (e) {
			e.classList.add(mapClassName('brace-focus'));
		});
	}
	/**
	 * @this {HTMLElement}
	 */
	function leaveBrace() {
		[this, getPartnerBrace(this)].forEach(function (e) {
			e.classList.remove(mapClassName('brace-focus'));
		});
	}
	
	/**
	 * Re-match braces for element
	 */
	function rematch(code) {
		
		// reset pair id counter
		pairIdCounter = 0;
		
		// find the braces to match
		/** @type {string[]} */
		var toMatch = ['(', '[', '{'];
		
		/** @type {HTMLSpanElement[]} */
		var punctuation = Array.prototype.slice.call(
			code.querySelectorAll('span.' + mapClassName('token') + '.' + mapClassName('punctuation'))
		);

		/** @type {{ index: number, open: boolean, element: HTMLElement }[]} */
		var allBraces = [];

		toMatch.forEach(function (open) {
			var close = PARTNER[open];
			var name = mapClassName(NAMES[open]);

			/** @type {[number, number][]} */
			var pairs = [];
			/** @type {number[]} */
			var openStack = [];

			for (var i = 0; i < punctuation.length; i++) {
				var element = punctuation[i];
				if (element.childElementCount == 0) {
					var text = element.textContent;
					text = BRACE_ALIAS_MAP[text] || text;
					if (text === open) {
						allBraces.push({ index: i, open: true, element: element });
						element.classList.add(name);
						element.classList.add(mapClassName('brace'));
						openStack.push(i);
					} else if (text === close) {
						allBraces.push({ index: i, open: false, element: element });
						element.classList.add(name);
						element.classList.add(mapClassName('brace'));
						if (openStack.length) {
							pairs.push([i, openStack.pop()]);
						}
					}
				}
			}

			pairs.forEach(function (pair) {
				var pairId = 'pair-' + (pairIdCounter++) + '-';

				var opening = punctuation[pair[0]];
				var closing = punctuation[pair[1]];

				opening.id = pairId + 'open';
				closing.id = pairId + 'close';
			});
		});

		var level = 0;
		allBraces.sort(function (a, b) { return a.index - b.index; });
		allBraces.forEach(function (brace) {
			if (brace.open) {
				brace.element.classList.add(mapClassName('brace-level-' + (level % LEVEL_WARP + 1)));
				level++;
			} else {
				level = Math.max(0, level - 1);
				brace.element.classList.add(mapClassName('brace-level-' + (level % LEVEL_WARP + 1)));
			}
		});
	}
	
	/**
	 * Global exports
	 */
	var config = Prism.plugins.matchBraces = {
		/**
		 * Matches braces for an element
		 */
		match: function (element) {
			rematch(element);
		}
	}

	Prism.hooks.add('complete', function (env) {
		
		if (env.language === 'markdown') return;
		
		var code = env.element;
		
		rematch(code);
		
	});
	
	function matchBraces(cd) {

		cd.querySelectorAll('.token.brace.brace-active').forEach(brace => {
			brace.classList.remove('brace-active');
		});

		if (document.activeElement === cd) {

			if (window.getSelection().toString().length < 2) {

				const cursor = cd.dropper.cursor();

				if (cursor && cursor.in('brace')) {
  
					const currentBrace = cursor.getParent();

					if (currentBrace.id) {
  
						currentBrace.classList.add('brace-active');

						const partnerBrace = getPartnerBrace(currentBrace);
						if (partnerBrace) partnerBrace.classList.add('brace-active');

					}

				}

			}

		}

	}
	
	document.querySelectorAll('cd-el').forEach(cd => {
		
		cd.on('caretmove', () => {
			
			matchBraces(cd);
			window.requestAnimationFrame(() => { matchBraces(cd) });
			
		});
		
	});
	
}());
