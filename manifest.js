
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
      "action": window.location.origin + "/full?file=true",
      "name": "Code",
      "accept": {
        "text/*": [".js", ".json", ".html", ".css", ".htm", ".svg", ".ts", ".mjs", ".py", ".scss"]
      }
    }
  ],
  "share_target": {
    "action": window.location.origin + "/full?file=true",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "file",
          "accept": ["text/*", ".js", ".json", ".html", ".css", ".htm", ".svg", ".ts", ".mjs", ".py", ".scss"]
        }
      ]
    },
    "handle_links": "preferred",
    "launch_handler": {
      "route_to": "new-client"
    },
    "capture_links": "new-client"
  }
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



// apply dynamic manifest

let linkElem = document.createElement('link');
linkElem.setAttribute('rel', 'manifest');
linkElem.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest)));

document.head.appendChild(linkElem);
