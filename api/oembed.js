
export default function handler(request, response) {
  
  const query = request.query;
  
  const isJSON = query.format ? query.format.toLowerCase() === 'json' : false;
  
  
  let resp;
  
  if (isJSON) resp = { "error": "Try adding a URL" };
  else resp = 'Try adding a <code>?url=</code>.';
  
  
  if (query.url) {
    
    let url = 'https://codeit.codes';
    
    url += '/api/link?url=' + query.url + '&oembed=true';
    
    const embedHTML = `<iframe src="`+ url +`" width="700" height="480" style="border-radius: 10px;" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe></html>`;
    
    
    if (isJSON) {
    
      resp = {
        "type": "rich",
        "title": "Codeit",
        "width": 700,
        "height": 480,
        "html": embedHTML,
        "version": "2.0",
        "cache_age": 3600,
        "provider_name": "Codeit",
        "provider_url": "https://codeit.codes/"
      };
      
    } else {
      
      resp = `
      <oembed>
        <html>`+ embedHTML +`</html>
        <width>700</width>
        <height>480</height>
      </oembed>
      `;
      
    }
    
  }
  
  
  if (isJSON) response.status(200).json(resp);
  else response.status(200).send(resp);
  
}

