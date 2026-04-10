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
const PROPERTY_ID = 'properties/361561956';

async function getPinterestPages(startDate, endDate, limit = 20) {
  const res = await analyticsdata.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
      dimensions: [{ name: 'pagePath' }],
      dimensionFilter: {
        filter: {
          fieldName: 'sessionSource',
          stringFilter: { matchType: 'CONTAINS', value: 'pinterest' }
        }
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    }
  });
  return res.data.rows || [];
}

console.log('=== TOP PINTEREST LANDING PAGES: BEFORE vs AFTER ===\n');

// October (peak) vs January (crash)
const octPages = await getPinterestPages('2025-10-01', '2025-10-31', 15);
const janPages = await getPinterestPages('2026-01-01', '2026-01-31', 15);

// Create lookup for comparison
const janLookup = {};
janPages.forEach(r => {
  janLookup[r.dimensionValues[0].value] = parseInt(r.metricValues[0].value);
});

console.log('📌 TOP PINTEREST PAGES - OCTOBER 2025 (Peak)');
console.log('─'.repeat(70));
console.log('Page'.padEnd(50) + 'Oct 2025  →  Jan 2026  | Change');
console.log('─'.repeat(70));

octPages.forEach(row => {
  const page = row.dimensionValues[0].value;
  const octSessions = parseInt(row.metricValues[0].value);
  const janSessions = janLookup[page] || 0;
  const change = octSessions > 0 ? Math.round((janSessions - octSessions) / octSessions * 100) : 0;
  
  const shortPage = page.length > 48 ? page.slice(0, 45) + '...' : page;
  console.log(`${shortPage.padEnd(50)} ${octSessions.toLocaleString().padStart(6)}  →  ${janSessions.toLocaleString().padStart(6)}  | ${change}%`);
});

console.log('\n📌 NEW IN JANUARY (not in Oct top 15):');
janPages.forEach(row => {
  const page = row.dimensionValues[0].value;
  const found = octPages.find(r => r.dimensionValues[0].value === page);
  if (!found) {
    console.log(`  ${page}: ${parseInt(row.metricValues[0].value).toLocaleString()} sessions`);
  }
});
