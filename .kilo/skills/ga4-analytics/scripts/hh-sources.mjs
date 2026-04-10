import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));
const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret, 'http://localhost');
auth.setCredentials(tokens);

const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
const pid = '361561956';

// Current 30 days by source
const [cur, prev] = await Promise.all([
  analyticsData.properties.runReport({
    property: `properties/${pid}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    },
  }),
  analyticsData.properties.runReport({
    property: `properties/${pid}`,
    requestBody: {
      dateRanges: [{ startDate: '60daysAgo', endDate: '31daysAgo' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    },
  }),
]);

console.log('=== HELLO HAYLEY — CURRENT 30 DAYS ===\n');
console.log('Source/Medium'.padEnd(35) + 'Sessions'.padStart(10) + 'Pageviews'.padStart(12));
console.log('-'.repeat(57));
for (const row of cur.data.rows || []) {
  const src = `${row.dimensionValues[0].value} / ${row.dimensionValues[1].value}`;
  console.log(src.padEnd(35) + parseInt(row.metricValues[0].value).toLocaleString().padStart(10) + parseInt(row.metricValues[1].value).toLocaleString().padStart(12));
}

console.log('\n=== HELLO HAYLEY — PREVIOUS 30 DAYS ===\n');
console.log('Source/Medium'.padEnd(35) + 'Sessions'.padStart(10) + 'Pageviews'.padStart(12));
console.log('-'.repeat(57));
for (const row of prev.data.rows || []) {
  const src = `${row.dimensionValues[0].value} / ${row.dimensionValues[1].value}`;
  console.log(src.padEnd(35) + parseInt(row.metricValues[0].value).toLocaleString().padStart(10) + parseInt(row.metricValues[1].value).toLocaleString().padStart(12));
}
