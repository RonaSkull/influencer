import { google } from 'googleapis';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret,
  'http://localhost'
);

auth.setCredentials({
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  expiry_date: tokens.expiry_date,
});

console.log('Creating client with OAuth...');
console.log('Access token (first 50 chars):', tokens.access_token.slice(0, 50));

const client = new BetaAnalyticsDataClient({
  authClient: auth,
});

console.log('Running test report for Hello Hayley (property 80120206)...');

try {
  const [response] = await client.runReport({
    property: 'properties/80120206',
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [{ name: 'sessions' }],
    dimensions: [{ name: 'sessionSource' }],
  });
  
  console.log('SUCCESS! Got', response.rows?.length || 0, 'rows');
  console.log('Top sources:');
  response.rows?.slice(0, 5).forEach(row => {
    console.log(' ', row.dimensionValues[0].value, '-', row.metricValues[0].value, 'sessions');
  });
} catch (err) {
  console.error('ERROR:', err.message);
  console.error('Details:', err.details || 'none');
}
