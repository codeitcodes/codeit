
export default async function handler(request, response) {
  
  const https = require('https');
  
  const {status, data} = await getRequest(decodeURIComponent(request.query.url));
  
  response.status(status).json(data);
  
  
  function getRequest(url) {
  
    return new Promise(resolve => {
      
      const req = https.get({
        url: url, headers: {
        accept: 'application/json'
      }}, (resp) => {
        
        let data = '';
        
        resp.on('data', (chunk) => {
          data += chunk;
        });
        
        resp.on('end', () => {
          
          data = JSON.parse(data);
          
          resolve({status: resp.statusCode, data: data});
        });
        
      });
      
    });
    
  }
  
}