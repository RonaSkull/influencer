const https = require('https');

const options = {
  hostname: 'tavusapi.com',
  path: '/v2/replicas',
  method: 'GET',
  headers: {
    'x-api-key': '4b43830c8e23496391b7d3cc38d39ab1'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data) {
        // Try to find a female replica matching "Zoe" or similar
        const femaleReplicas = json.data.filter(r => 
           r.replica_name.includes('Zoe') || 
           r.replica_name.includes('Sarah') || 
           r.replica_name.includes('Female')
        );
        console.log(JSON.stringify(femaleReplicas, null, 2));
      } else {
        console.log("No replicas found");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
