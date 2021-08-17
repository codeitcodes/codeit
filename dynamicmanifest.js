
// dynamic manifest

let manifest = {
  "name": "Codeit",
  "short_name": "Codeit",
  "background_color": "#313744",
  "theme_color": "#313744",
  "display": "fullscreen",
  "start_url": "/full",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/manifest-icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/manifest-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
};



// if not on mobile, display special icons
if (!isMobile) {
  
  manifest.icons = [
    {
      "src": "icons/mac-icon-512-padding.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ];
  
  // change page favicon
  var link = document.querySelector("link[rel*='icon']");
  link.href = 'icons/mac-favicon.png';
    
}



// apply dynamic manifest

let linkElem = document.createElement('link');
linkElem.setAttribute('rel', 'manifest');
linkElem.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest)));

document.head.appendChild(linkElem);
