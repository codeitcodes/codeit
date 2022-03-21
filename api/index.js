
export default function handler(request, response) {
  
  const query = Object.keys(request.query)[0];
  
  const html = '<h1 style="font-family:system-ui">' + query + '</h1>';
  
  response.status(200).send(html);
  
}
