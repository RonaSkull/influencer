import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret);
auth.setCredentials(tokens);

const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

// CORRECT Property ID for Hello Hayley
const PROPERTY_ID = 'properties/361561956';

async function getTrafficBySource(startDate, endDate) {
  const res = await analyticsdata.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      dimensions: [{ name: 'sessionSource' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    }
  });
  return res.data.rows || [];
}

console.log('=== HELLO HAYLEY PINTEREST TRAFFIC ANALYSIS ===\n');

const periods = [
  { name: 'Sep 2025', start: '2025-09-01', end: '2025-09-30' },
  { name: 'Oct 2025', start: '2025-10-01', end: '2025-10-31' },
  { name: 'Nov 2025', start: '2025-11-01', end: '2025-11-30' },
  { name: 'Dec 2025', start: '2025-12-01', end: '2025-12-31' },
  { name: 'Jan 2026', start: '2026-01-01', end: '2026-01-31' },
];

const pinterestData = [];

for (const period of periods) {
  console.log(`📅 ${period.name}`);
  try {
    const rows = await getTrafficBySource(period.start, period.end);
    
    const pinterest = rows.find(r => 
      r.dimensionValues[0].value.toLowerCase().includes('pinterest')
    );
    
    const sessions = pinterest ? parseInt(pinterest.metricValues[0].value) : 0;
    const users = pinterest ? parseInt(pinterest.metricValues[1].value) : 0;
    
    console.log(`   Pinterest: ${sessions.toLocaleString()} sessions, ${users.toLocaleString()} users`);
    
    // Show top 3 sources
    console.log('   Top sources:');
    rows.slice(0, 3).forEach(r => {
      const isPinterest = r.dimensionValues[0].value.toLowerCase().includes('pinterest');
      console.log(`     ${isPinterest ? '📌' : '  '} ${r.dimensionValues[0].value}: ${parseInt(r.metricValues[0].value).toLocaleString()}`);
    });
    
    pinterestData.push({ period: period.name, sessions, users });
  } catch (e) {
    console.log(`   Error: ${e.message}`);
    pinterestData.push({ period: period.name, sessions: 0, users: 0 });
  }
  console.log('');
}

// Summary
console.log('\n📊 PINTEREST TREND SUMMARY');
console.log('═'.repeat(55));
console.log('Period     | Sessions    | Users      | Change');
console.log('─'.repeat(55));

let prev = 0;
for (const d of pinterestData) {
  const change = prev > 0 ? ((d.sessions - prev) / prev * 100).toFixed(0) : '-';
  const changeStr = change !== '-' ? (parseInt(change) >= 0 ? `+${change}%` : `${change}%`) : '-';
  console.log(`${d.period.padEnd(10)} | ${d.sessions.toLocaleString().padStart(11)} | ${d.users.toLocaleString().padStart(10)} | ${changeStr}`);
  prev = d.sessions;
}

// Calculate total drop
if (pinterestData.length >= 2) {
  const first = pinterestData[0].sessions;
  const last = pinterestData[pinterestData.length - 1].sessions;
  const totalDrop = ((last - first) / first * 100).toFixed(0);
  console.log('─'.repeat(55));
  console.log(`Total change Sep→Jan: ${totalDrop}%`);
}
