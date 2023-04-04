(function () {

	if (typeof Prism === 'undefined') {
		return;
	}

	var url = /\b([a-z]{3,7}:\/\/|tel:)[\w\-+%~/.:=&!$'()*,;@]+(?:\?[\w\-+%~/.:=?&!$'()*,;@]*)?(?:#[\w\-+%~/.:#=?&!$'()*,;@]*)?/;
	var email = /\b\S+@[\w.]+[a-z]{2}/;
	var linkMd = /\[([^\]]+)\]\(([^)]+)\)/;

	// Tokens that may contain URLs and emails
	var candidates = ['comment', 'url', 'attr-value', 'string'];

	Prism.plugins.autolinker = {
		processGrammar: function (grammar) {
			// abort if grammar has already been processed
			if (!grammar || grammar['url-link']) {
				return;
			}
			Prism.languages.DFS(grammar, function (key, def, type) {
				if (candidates.indexOf(type) > -1 && !Array.isArray(def)) {
					if (!def.pattern) {
						def = this[key] = {
							pattern: def
						};
					}

					def.inside = def.inside || {};
					
					if (type == 'comment') {
						def.inside['md-link'] = linkMd;
					}
					if (type == 'attr-value') {
						Prism.languages.insertBefore('inside', 'punctuation', { 'url-link': url }, def);
					} else {
						def.inside['url-link'] = url;
					}

					def.inside['email-link'] = email;
				}
			});
			grammar['url-link'] = url;
			grammar['email-link'] = email;
		}
	};

	Prism.hooks.add('before-tokenize', function (env) {
		if (env.language === 'markdown') return;
		Prism.plugins.autolinker.processGrammar(env.grammar);
	});
	
	
	const onClickEvent = 'if ((event.ctrlKey || event.metaKey) && event.shiftKey) { event.preventDefault(); window.open(this.href, \'_blank\') }';
	
	const isMac = navigator.platform.indexOf('Mac') > -1;
	
	const linkTitle = isMac ? '⌘ + ⇧ + click to open link' : 'Ctrl + Shift + click to open link';
	
	Prism.hooks.add('wrap', function (env) {

    // disabled for markdown because regex dosen't cover all edge cases
		if (env.language === 'markdown') return;
		
		/*
    if (env.language === 'markdown' &&
		    env.type === 'url-reference') {
			
			let matches = env.content.match(url);
			
			if (matches && matches[0]) {
				
				matches[0] = matches[0].replaceAll('\'','').replaceAll('"','').replaceAll('`','');
								
				env.content = env.content.replace(matches[0], '<a class="token url-link" title="' + linkTitle + '" onclick="' + onClickEvent + '" href="'+ matches[0] + '">' + matches[0] + '</a>');
				
			}
			
		}
    */
		
		if (/-link$/.test(env.type)) {
			env.tag = 'a';
									
			var href = env.content;

			if (env.type == 'email-link' && href.indexOf('mailto:') != 0) {
				href = 'mailto:' + href;
			} else if (env.type == 'md-link') {
				// markdown
				var match = env.content.match(linkMd);

				href = match[2];
				env.content = match[1];
			}
			
			env.attributes.href = href.replaceAll('\'','').replaceAll('"','').replaceAll('`','');

			env.attributes.onclick = onClickEvent;
			env.attributes.title = linkTitle;

		}

	});

}());
