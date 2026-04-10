import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret
);

auth.setCredentials(tokens);

// Use analyticsdata API via googleapis
const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

console.log('Testing via googleapis analyticsdata...');

try {
  const res = await analyticsdata.properties.runReport({
    property: 'properties/80120206',
    requestBody: {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'sessionSource' }],
    }
  });
  
  console.log('SUCCESS! Got', res.data.rows?.length || 0, 'rows');
  res.data.rows?.slice(0, 5).forEach(row => {
    console.log(' ', row.dimensionValues[0].value, '-', row.metricValues[0].value, 'sessions');
  });
} catch (err) {
  console.error('Error:', err.message);
  if (err.response?.data) {
    console.error('Details:', JSON.stringify(err.response.data, null, 2));
  }
}
