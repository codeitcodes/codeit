
export default function handler(request, response) {
  
  const query = Object.keys(request.query);
  
  let html = '';
  
  if (query[0] === 'url') {
    
    html = '<h1 style="font-family:system-ui">' + query[1] + '</h1>';
    
  }
  
  response.status(200).send(html);
  
}
