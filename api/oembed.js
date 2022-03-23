
export default function handler(request, response) {
  
  const query = request.query;
  
  let html = 'Try adding a <code>?url=</code>.';
  
  if (query.url) {
    
    html = `
    <oembed>
      <html><iframe src="https://codeit.codes/api/link?url=`+ query.url +`&embed=true" width="700" height="480"></html>
      <width>700</width>
      <height>480</height>
    </oembed>
    `;
    
  }
    
  response.status(200).send(html);
  
}

