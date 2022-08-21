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
	
  let isMobile = false;
  
  if (navigator.userAgentData && navigator.userAgentData.mobile)
    isMobile = true;
  
  if (navigator.userAgent && navigator.userAgent.includes('Mobile'))
    isMobile = true;	
    
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
