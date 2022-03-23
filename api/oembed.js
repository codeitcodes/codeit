
export default function handler(request, response) {
  
  const query = Object.keys(request.query);
  
  let html = '';
  
  console.log(query);
  
  if (query[0] === 'url') {
    
    html = `
    <oembed>
      <html><iframe src="https://dev.codeit.codes/api/link?url=`+ query[1] +`&embed=true" width="700" height="480"></html>
      <width>700</width>
      <height>480</height>
    </oembed>
    `;
    
  }
  
  response.status(200).send(html);
  
}

