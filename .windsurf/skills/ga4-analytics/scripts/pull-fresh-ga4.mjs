import { google } from 'googleapis';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret, 'http://localhost');
auth.setCredentials({ access_token: tokens.access_token, refresh_token: tokens.refresh_token, expiry_date: tokens.expiry_date });

const client = new BetaAnalyticsDataClient({ authClient: auth });

const SITES = {
  'Hello Hayley': '361561956',
  'We Heart This': '271025498',
  'Melrose Family': '271025498', // need correct ID
  'Living Tickled': '271025498',
  'Today Mommy': '271025498',
  'Moms Make Cents': '271025498',
};

// We'll just pull the sites we have property IDs for
// From TOOLS.md: Hello Hayley = 361561956
const KNOWN_SITES = [
  { name: 'Hello Hayley', propertyId: '361561956' },
];

async function pullSiteData(name, propertyId) {
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-02-01', endDate: '2026-02-07' }],
      metrics: [
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
      ],
    });
    
    const row = response.rows?.[0];
    if (row) {
      return {
        name,
        sessions: parseInt(row.metricValues[0].value),
        pageviews: parseInt(row.metricValues[1].value),
        users: parseInt(row.metricValues[2].value),
      };
    }
  } catch (err) {
    console.error(`Error for ${name}:`, err.message);
  }
  return null;
}

// Pull all account properties first to get correct IDs
async function listProperties() {
  const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });
  const res = await analyticsAdmin.accountSummaries.list();
  const results = [];
  for (const account of res.data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      results.push({
        account: account.displayName,
        accountId: account.account,
        property: prop.displayName,
        propertyId: prop.property?.replace('properties/', ''),
      });
    }
  }
  return results;
}

async function main() {
  console.log('Listing all GA4 properties...\n');
  const properties = await listProperties();
  
  // Sites we care about
  const targetSites = ['Hello Hayley', 'We Heart This', 'Living Tickled', 'Today Mommy', 'Moms Make Cents', 'NY Melrose Family', 'Melrose Family'];
  
  const siteData = [];
  for (const prop of properties) {
    const matchedTarget = targetSites.find(t => prop.property?.toLowerCase().includes(t.toLowerCase()) || prop.account?.toLowerCase().includes(t.toLowerCase()));
    if (matchedTarget || targetSites.some(t => prop.property?.includes(t))) {
      console.log(`Pulling: ${prop.property} (${prop.propertyId})...`);
      const data = await pullSiteData(prop.property, prop.propertyId);
      if (data) {
        siteData.push(data);
        console.log(`  → ${data.sessions} sessions, ${data.pageviews} pageviews`);
      }
    }
  }
  
  // Also pull for all properties that match known accounts
  const mainAccounts = properties.filter(p => 
    ['Hello Hayley', 'weheartthis', 'Living Tickled', 'Today Mommy', 'Moms Make Cents', 'Melrose', 'We Heart'].some(n => 
      (p.property || '').toLowerCase().includes(n.toLowerCase()) || 
      (p.account || '').toLowerCase().includes(n.toLowerCase())
    )
  );
  
  for (const prop of mainAccounts) {
    if (!siteData.find(s => s.name === prop.property)) {
      console.log(`Pulling: ${prop.property} (${prop.propertyId})...`);
      const data = await pullSiteData(prop.property, prop.propertyId);
      if (data) {
        siteData.push(data);
        console.log(`  → ${data.sessions} sessions, ${data.pageviews} pageviews`);
      }
    }
  }
  
  console.log('\n--- Results ---');
  console.log(JSON.stringify(siteData, null, 2));
  
  // Save to data dir
  const dataDir = join(new URL('.', import.meta.url).pathname, '..', 'data');
  writeFileSync(join(dataDir, 'ga4-feb-2026.json'), JSON.stringify({
    pulledAt: new Date().toISOString(),
    dateRange: '2026-02-01 to 2026-02-07',
    sites: siteData
  }, null, 2));
  
  console.log('\nSaved to data/ga4-feb-2026.json');
}

main().catch(console.error);
