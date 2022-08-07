
// CodePen project importer

// API:
// const projectTitle = await codepenImporter.import(projectURL);

// Works for any project, any imports and any precompiler
// Uses fetch API and ArrayBuffer for uncapped project size and error handling
// Cleans the resulting code
// 'projectURL' can be any CodePen project URL

// Note: The special CodePen GreenSock plugins
//       won't load unless their URLs are swapped with the standard plugin URLs

let codepenImporter = {

  'import': async (projectURL) => {

    // parse project URL
    
    if (!projectURL.startsWith('https://codepen.io')) return;
    
    projectURL = projectURL.replace('https://codepen.io/', '');
    projectURL = projectURL.split('/');
  
    if (projectURL.length < 3) return;
  
    
    const projectUser = projectURL[0];
    
    const projectId = projectURL[2];
    
  
    const resp = await codepenImporter.fetchProject(projectUser, projectId);
  
    let html = codepenImporter.parseIframeCode(resp);
    html = codepenImporter.decodeEntities(html);
    
    const projectTitle = codepenImporter.getProjectTitle(html);
    
    html = beautifier.html(html, codepenImporter.beautifyOptions);
    
    html = codepenImporter.parsePrettyIframeCode(html);
    
    cd.textContent = html;
    cd.dispatchTypeEvent();
    
    return projectTitle;
    
  },
  
  'fetchProject': async (projectUser, projectId) => {
    
    const query = window.location.origin + '/api/cors?url=' + 'https://cdpn.io/'+ projectUser +'/fullembedgrid/'+ projectId +'?animations=run&type=embed';
    
    
    // get the query
    const resp = await fetch(query);
    
    // if received an error
    if (String(resp.status).startsWith('4')) {
      
      return 'Error ' + resp.status;
      
    }
    
    
    // get data from response
    
    const reader = resp.body.getReader();
    let buffer = [];
    
    async function readChunk() {
      
      const chunk = await reader.read();
      
      // if finished reading, return
      if (chunk.done) return;
      
      // add new chunk to buffer
      buffer = new Uint8Array([...buffer, ...chunk.value]);
      
      // read next chunk
      return readChunk();
      
    }
    
    await readChunk();
    
    
    // decode ArrayBuffer
    
    const decoder = new TextDecoder();
    
    const decodedCode = decoder.decode(buffer);
    
    return decodedCode;
    
  },
  
  'parseIframeCode': (code) => {
    
    code = code.split('<iframe\n      id="result"\n      srcdoc="\n')[1].split('</html>\n \n"\n      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups  allow-scripts allow-top-navigation-by-user-activation allow-downloads allow-presentation" allow="accelerometer; ambient-light-sensor; camera; display-capture; encrypted-media; geolocation; gyroscope; microphone; midi; payment; web-share; vr" allowTransparency="true"\n      allowpaymentrequest="true" allowfullscreen="true" class="result-iframe">\n      </iframe>')[0] + '</html>';
    
    return code;
    
  },
  
  'getProjectTitle': (code) => {
    
    let title = code.split('<title>CodePen - ')[1].split('</title>')[0];

    if (title.startsWith('A Pen by')) {
      
      title = 'Untitled Project by ' + title.split('A Pen by ')[1];
      
    }
    
    return title;

  },
  
  'parsePrettyIframeCode': (code) => {
    
    code = codepenImporter.removeSubstring(code, '\n  <link rel="apple-touch-icon" type="image/png" href="https://cpwebassets.codepen.io/assets/favicon/', '.svg" color="#111" />');
    
    code = codepenImporter.removeSubstring(code, '<script src="https://cpwebassets.codepen.io/assets/common/stopExecutionOnTimeout', '</script>');
    code = codepenImporter.removeSubstring(code, '<script src="https://cpwebassets.codepen.io/assets/editor/iframe/', '</script>');
    
    code = code.replace('\n  <script>\n    if (document.location.search.match(/type=embed/gi)) {\n      window.parent.postMessage("resize", "*");\n    }\n  </script>', '');
    
    code = code.replace('<title>CodePen - A Pen by ', '<title>Untitled Project by ');
    code = code.replace('<title>CodePen - ', '<title>');
    code = code.replace('<script id="rendered-js"', '<script');
    code = code.replace('\n    //# sourceURL=pen.js', '');
        
    return code;
    
  },
  
  'removeSubstring': (code, startsWith, endsWith) => {
    
    if (code.includes(startsWith) && code.includes(endsWith)) {
    
      const splitCode = code.split(startsWith);
      
      const beforeString = splitCode[0];
      
      let afterString = splitCode[1].split(endsWith);
      afterString.shift();
      afterString = afterString.join(endsWith);
      
      return beforeString + afterString;
      
    } else {
      
      return code;
      
    }
    
  },
  
  'decodeEntities': (encodedString) => {
    
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
    
  },
  
  'beautifyOptions': {
    "indent_size": "2",
    "indent_char": " ",
    "max_preserve_newlines": "5",
    "preserve_newlines": false,
    "keep_array_indentation": false,
    "break_chained_methods": false,
    "indent_scripts": "normal",
    "brace_style": "collapse",
    "space_before_conditional": true,
    "unescape_strings": false,
    "jslint_happy": false,
    "end_with_newline": false,
    "wrap_line_length": "0",
    "indent_inner_html": false,
    "comma_first": false,
    "e4x": false,
    "indent_empty_lines": false
  }
  
}

