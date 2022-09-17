
// dynamic manifest

let manifest = {
  "name": "Codeit",
  "short_name": "Codeit",
  "description": "Mobile code editor connected to Git.",
  "background_color": "#313744",
  "theme_color": "#313744",
  "display": "standalone",
  "scope": window.location.origin,
  "start_url": window.location.origin + "/full",
  "id": "/full",
  "orientation": "any",
  "icons": [
    {
      "src": window.location.origin + "/icons/android-app-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "file_handlers": [
    {
      "action": window.location.origin + "/full",
      "name": "file",
      "accept": {
        "text/plain": [".js",".html",".css",".c",".cs",".py",".jsx",".atom",".xss",".do",".action",".xml",".svg",".md",".gitignore",".json",".aspx",".kt",".sass",".less",".asp",".axd",".asx",".asmx",".ashx",".sh",".bash",".sh",".shell",".bat",".cmd",".dotnet",".csharp",".ejs",".editorconfig",".java",".webmanifest",".mathml",".ssml",".php",".perl",".pug",".scss",".rb",".ruby",".swift",".turtle",".trig",".ts",".tsconfig",".uscript",".uc",".wasm",".yaml",".ps1",".ps2",".objc",".kt",".kts",".emacs",".elisp",".lisp",".cgi",".dll",".lua",".makefile",".hs",".go",".git",".haml",".hbs",".mustache",".graphql",".haml",".erl",".hrl",".tex",".h",".m",".mm",".cpp",".xls",".xlsx",".csv",".coffee",".cmake",".basic",".adoc",".ino"]
      }
    }
  ],
  "share_target": {
    "action": window.location.origin + "/full",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "file",
          "accept": ["text/*", "application/json"]
        }
      ]
    }
  },
  "protocol_handlers": [
    {
      "protocol": "https://cde.run",
      "url": window.location.origin + "/api/link?url=%s"
    },
    {
      "protocol": "https://codeit.codes",
      "url": window.location.origin + "/full?url=%s"
    }
  ],
  "handle_links": "preferred",
  "launch_type": "multiple-clients",
  "launch_handler": {
    "route_to": "new-client"
  },
  "capture_links": "new-client"
};


// if not on mobile, display special icons
if (!isMobile) {
  
  if (isMac) {
    
    manifest.icons = [
      {
        "src": window.location.origin + "/icons/mac-icon-512-padding.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      }
    ];
    
  } else {
    
    manifest.icons = [
      {
        "src": window.location.origin + "/icons/app-favicon.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any"
      }
    ];
    
  }
  
  // change page favicon
  var link = document.querySelector("link[rel*='icon']");
  link.href = '/icons/app-favicon.png';
  
} else if (!isSafari) {
  
  manifest.background_color = '#0b0d1a';
  
}


if (isDev) {
  
  manifest.name = 'Codeit [DEV]';
  manifest.short_name = 'Codeit [DEV]';
  
}



// apply dynamic manifest

let linkElem = document.createElement('link');
linkElem.setAttribute('rel', 'manifest');
linkElem.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest)));

document.head.appendChild(linkElem);

