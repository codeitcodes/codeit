(function () {

	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
		return;
	}

	// Copied from the markup language definition
	var HTML_TAG = /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g;

	// a regex to validate hexadecimal colors
	var HEX_COLOR = /^#?((?:[\da-f]){3,4}|(?:[\da-f]{2}){3,4})$/i;

	/**
	 * Validates the given Color using the current browser's internal implementation.
	 *
	 * @param {string} color
	 * @returns {string | undefined}
	 */
	function validateColor(color) {
		var s = new Option().style;
		s.color = color;
		return s.color ? color : undefined;
	}
	
	var isMobile = navigator.userAgent.match('Mobile') ?? false;
	var isSafari = isMobile && navigator.userAgent.toLowerCase().indexOf('safari') != -1;
	
	// if on mobile safari
	if (isSafari) {
		// create eye dropper
		var eyeDropper = document.createElement('input');
		eyeDropper.classList = 'inline-color-input';
		eyeDropper.type = 'color';
		
		eyeDropper.onchange = () => {

			// hex color value (#RRGGBB)
			var result = eyeDropper.value;
			
			var el = document.querySelector('.inline-color-wrapper.selected');
			
			el.classList.remove('selected');
			
			el.children[0].style.backgroundColor = result;
			el.nextSibling.textContent = result;

			document.querySelector('cd-el').dispatchEvent(new Event('type'));

		};
		
		document.body.appendChild(eyeDropper);
	}
	
	/**
	 * Global exports
	 */
	Prism.plugins.inlineColor = {
		
		/**
		 * Opens color picker for given element.
		 */
		openPicker: (el, event) => {
			
			// if on desktop
			if (!isMobile) {
				
				// create eye dropper
				var eyeDropper = new EyeDropper();
				
				// open eye dropper
				eyeDropper.open()
					.then(colorSelectionResult => {
						
						// hex color value (#RRGGBB)
						var result = colorSelectionResult.sRGBHex;
						
						el.children[0].style.backgroundColor = result;
						el.nextSibling.textContent = result;
					
						document.querySelector('cd-el').dispatchEvent(new Event('type'));
						
					}).catch(error => {});

			} else if (isSafari) { // if on mobile safari
				
				event.preventDefault();
				event.stopPropagation();
				
				el.classList.add('selected');
				
				// open eye dropper
				var e = document.createEvent('MouseEvents');
			    	e.initMouseEvent('mousedown', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			    	document.querySelector('input.inline-color-input').dispatchEvent(e);
				
			}
			
		}
		
	};


	Prism.hooks.add('wrap', function (env) {
		if (env.type === 'color' || env.classes.indexOf('color') >= 0) {
			var content = env.content;
			
			// if token dosen't already have an inline color element
			if (!env.content.includes('inline-color-wrapper')) {
				
				// remove all HTML tags inside
				var rawText = content.split(HTML_TAG).join('');

				var color = validateColor(rawText);

				if (!color) {
					return;
				}
				
				var previewElement = '<span class="inline-color-wrapper" onclick="Prism.plugins.inlineColor.openPicker(this, event)" aria-hidden="true" contenteditable="false"><span class="inline-color" style="background-color:' + color + ';"></span></span>';
				env.content = previewElement + content;
				
			}
		}
	});

}());
