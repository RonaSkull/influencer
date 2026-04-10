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

const months = [
  { name: 'Sep 2025', start: '2025-09-01', end: '2025-09-30' },
  { name: 'Oct 2025', start: '2025-10-01', end: '2025-10-31' },
  { name: 'Nov 2025', start: '2025-11-01', end: '2025-11-30' },
  { name: 'Dec 2025', start: '2025-12-01', end: '2025-12-31' },
  { name: 'Jan 2026', start: '2026-01-01', end: '2026-01-31' },
  { name: 'Feb 2026', start: '2026-02-01', end: '2026-02-11' },
];

console.log('=== HELLO HAYLEY — GOOGLE ORGANIC BY MONTH ===\n');

for (const m of months) {
  const res = await analyticsData.properties.runReport({
    property: 'properties/361561956',
    requestBody: {
      dateRanges: [{ startDate: m.start, endDate: m.end }],
      dimensionFilter: {
        filter: { fieldName: 'sessionMedium', stringFilter: { value: 'organic' } }
      },
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'activeUsers' }],
    },
  });
  const row = res.data.rows?.[0];
  const sessions = row ? parseInt(row.metricValues[0].value) : 0;
  const pvs = row ? parseInt(row.metricValues[1].value) : 0;
  console.log(`${m.name.padEnd(12)} ${sessions.toLocaleString().padStart(8)} sessions  ${pvs.toLocaleString().padStart(8)} pageviews`);
}

// Also check Pinterest specifically
console.log('\n=== HELLO HAYLEY — PINTEREST BY MONTH ===\n');

for (const m of months) {
  const res = await analyticsData.properties.runReport({
    property: 'properties/361561956',
    requestBody: {
      dateRanges: [{ startDate: m.start, endDate: m.end }],
      dimensionFilter: {
        orGroup: {
          expressions: [
            { filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'CONTAINS', value: 'pinterest' } } },
          ]
        }
      },
      metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
    },
  });
  const row = res.data.rows?.[0];
  const sessions = row ? parseInt(row.metricValues[0].value) : 0;
  const pvs = row ? parseInt(row.metricValues[1].value) : 0;
  console.log(`${m.name.padEnd(12)} ${sessions.toLocaleString().padStart(8)} sessions  ${pvs.toLocaleString().padStart(8)} pageviews`);
}
