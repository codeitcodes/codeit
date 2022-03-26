
export default function handler(request, response) {
  
  const query = request.query;
  
  let html = 'Try adding a <code>?url=</code>.';
  
  if (query.url) {
    
    let url = 'https://codeit.codes';
    
    if (query.url.startsWith('https://dev.cde.run/')) {
      url = 'https://dev.codeit.codes';
    }
    
    html = `
    <oembed>
      <html><iframe src="`+ url +`/api/link?url=`+ query.url +`&embed=true" width="700" height="480" style="border-radius: 10px;" allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write" allowfullscreen="true" allowpaymentrequest="true" loading="lazy" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" scrolling="yes" frameborder="0"></iframe></html>
      <width>700</width>
      <height>480</height>
    </oembed>
    `;
    
  }
    
  response.status(200).send(html);
  
}

