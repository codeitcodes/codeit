
export default async function handler(request, response) {
  
  const https = require('https');
  
  
  let query = Object.entries(request.query);
  
  query.shift();
  
  let url = request.query.url;
  
  query.forEach(entry => {
    
    url += '&' + entry[0] + '=' + entry[1];
    
  });
  
  console.log(url);
  
  
  const {status, data} = await getRequest(url);
  
  response.status(status).send(data);
  
  
  function getRequest(url) {
  
    return new Promise(resolve => {
      
      url = new URL(url);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        query: url.query,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (resp) => {
        
        let data = '';
        
        resp.on('data', (chunk) => {
          
          data += chunk;
          
        });
        
        resp.on('end', () => {
          
          resolve({status: resp.statusCode, data: data});
          
        });
        
      });
      
    });
    
  }
  
}
