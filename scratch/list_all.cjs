const https = require('https');

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'tavusapi.com',
      path: path,
      method: 'GET',
      headers: { 'x-api-key': '4b43830c8e23496391b7d3cc38d39ab1' }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (f) => data += f);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const replicas = await get('/v2/replicas');
  const personas = await get('/v2/personas');
  
  console.log("REPLICAS:");
  replicas.data.forEach(r => console.log(`- ${r.replica_id}: ${r.replica_name}`));
  
  console.log("\nPERSONAS:");
  personas.data.forEach(p => console.log(`- ${p.persona_id}: ${p.persona_name}`));
}

main();
