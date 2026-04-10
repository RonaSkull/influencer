import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

console.log('Trying with access_token directly in headers...');

// Create a custom auth class that uses the access token
class AccessTokenAuth {
  constructor(token) {
    this.token = token;
  }
  
  async getAccessToken() {
    return { token: this.token };
  }
  
  async getRequestHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }
}

const auth = new AccessTokenAuth(tokens.access_token);

const client = new BetaAnalyticsDataClient({
  auth: auth,
});

console.log('Running test...');

try {
  const [response] = await client.runReport({
    property: 'properties/80120206',
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'sessionSource' }],
  });
  
  console.log('SUCCESS!', response.rows?.length, 'rows');
} catch (err) {
  console.error('Still failing:', err.message);
}
