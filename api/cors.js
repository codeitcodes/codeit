
export default async function handler(request, response) {
  
  const https = require('https');
  
  const {status, data} = await getRequest(decodeURIComponent(request.query.url));
  
  response.status(status).json(data);
  
  
  function getRequest(url) {
  
    return new Promise(resolve => {
      
      url = new URL(url);
      
      const req = https.request({
        host: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      }, (resp) => {
        
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