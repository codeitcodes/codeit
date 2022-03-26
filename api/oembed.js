
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
      <html><iframe src="`+ url +`/api/link?url=`+ query.url +`&embed=true" width="700" height="480"></iframe></html>
      <width>700</width>
      <height>480</height>
    </oembed>
    `;
    
  }
    
  response.status(200).send(html);
  
}

