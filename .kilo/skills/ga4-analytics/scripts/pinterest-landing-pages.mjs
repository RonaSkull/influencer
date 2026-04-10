/**
 * Find which Pinterest pins are still bringing traffic to Hello Hayley
 * Using direct googleapis client with token refresh
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Load credentials
const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;

// Create OAuth2 client and set credentials
const auth = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret,
  'http://localhost'
);

auth.setCredentials({
  refresh_token: tokens.refresh_token,
});

// Refresh the token
console.log('Refreshing OAuth token...');
const { credentials } = await auth.refreshAccessToken();
auth.setCredentials(credentials);

// Save refreshed tokens
writeFileSync(join(credDir, 'ga4-tokens.json'), JSON.stringify(credentials, null, 2));
console.log('Token refreshed ✓\n');

// Create Analytics Data API client
const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

// Hello Hayley Property ID (account 80120206, property 361561956)
const propertyId = 'properties/361561956';

async function runReport(options) {
  const response = await analyticsData.properties.runReport({
    property: propertyId,
    requestBody: {
      dateRanges: [options.dateRange],
      dimensions: options.dimensions.map(d => ({ name: d })),
      metrics: options.metrics.map(m => ({ name: m })),
      dimensionFilter: options.dimensionFilter,
      orderBys: options.orderBys,
      limit: options.limit || 10000,
    },
  });
  
  return response.data;
}

async function getPinterestLandingPages() {
  console.log('=== Hello Hayley - Pinterest Landing Pages ===\n');
  console.log('Finding which pins are still driving traffic...\n');
  
  // Last 30 days - landing pages from Pinterest
  const response = await runReport({
    dimensions: ['landingPage', 'sessionSource'],
    metrics: ['sessions', 'activeUsers', 'screenPageViews'],
    dateRange: { startDate: '30daysAgo', endDate: 'today' },
    dimensionFilter: {
      filter: {
        fieldName: 'sessionSource',
        stringFilter: {
          matchType: 'CONTAINS',
          value: 'pinterest',
          caseSensitive: false,
        },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  });
  
  if (!response.rows || response.rows.length === 0) {
    console.log('No Pinterest traffic data found!');
    return;
  }
  
  console.log('📌 TOP 50 LANDING PAGES FROM PINTEREST (Last 30 Days)\n');
  console.log('═'.repeat(100));
  console.log('Rank | Sessions | Users | Views | URL');
  console.log('─'.repeat(100));
  
  let totalSessions = 0;
  let totalUsers = 0;
  
  response.rows.forEach((row, i) => {
    const landingPage = row.dimensionValues[0].value;
    const sessions = parseInt(row.metricValues[0].value, 10);
    const users = parseInt(row.metricValues[1].value, 10);
    const pageViews = parseInt(row.metricValues[2].value, 10);
    
    totalSessions += sessions;
    totalUsers += users;
    
    console.log(`${(i+1).toString().padStart(4)} | ${sessions.toLocaleString().padStart(8)} | ${users.toLocaleString().padStart(5)} | ${pageViews.toLocaleString().padStart(5)} | ${landingPage}`);
  });
  
  console.log('─'.repeat(100));
  console.log(`TOTAL (top 50): ${totalSessions.toLocaleString()} sessions, ${totalUsers.toLocaleString()} users\n`);
  
  // Now get same data from October for comparison
  console.log('\n📌 COMPARISON: Same query OCTOBER 2025\n');
  console.log('═'.repeat(100));
  
  const oldResponse = await runReport({
    dimensions: ['landingPage', 'sessionSource'],
    metrics: ['sessions', 'activeUsers', 'screenPageViews'],
    dateRange: { startDate: '2025-10-01', endDate: '2025-10-31' },
    dimensionFilter: {
      filter: {
        fieldName: 'sessionSource',
        stringFilter: {
          matchType: 'CONTAINS',
          value: 'pinterest',
          caseSensitive: false,
        },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50,
  });
  
  if (oldResponse.rows) {
    console.log('Rank | Sessions | Users | Views | URL');
    console.log('─'.repeat(100));
    
    let oldTotalSessions = 0;
    oldResponse.rows.forEach((row, i) => {
      const landingPage = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value, 10);
      const users = parseInt(row.metricValues[1].value, 10);
      const pageViews = parseInt(row.metricValues[2].value, 10);
      
      oldTotalSessions += sessions;
      
      console.log(`${(i+1).toString().padStart(4)} | ${sessions.toLocaleString().padStart(8)} | ${users.toLocaleString().padStart(5)} | ${pageViews.toLocaleString().padStart(5)} | ${landingPage}`);
    });
    
    console.log('─'.repeat(100));
    console.log(`OCT 2025 TOTAL (top 50): ${oldTotalSessions.toLocaleString()} sessions`);
    console.log(`\n📉 Drop in top 50 pages: ${totalSessions.toLocaleString()} now vs ${oldTotalSessions.toLocaleString()} in Oct = ${((1 - totalSessions/oldTotalSessions) * 100).toFixed(1)}% decrease`);
  }
}

getPinterestLandingPages().catch(console.error);
