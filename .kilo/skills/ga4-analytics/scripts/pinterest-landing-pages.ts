/**
 * Find which Pinterest pins are still bringing traffic to Hello Hayley
 * by analyzing landing pages from Pinterest source
 */

import { runReport } from './src/api/reports.js';
import { resetClient } from './src/core/client.js';

// Hello Hayley Property ID
process.env.GA4_PROPERTY_ID = '80120206';

async function getPinterestLandingPages() {
  console.log('=== Hello Hayley - Pinterest Landing Pages ===\n');
  console.log('Finding which pins are still driving traffic...\n');
  
  // Reset client to pick up property ID
  resetClient();
  
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
    save: false,
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
  console.log(`TOTAL: ${totalSessions.toLocaleString()} sessions, ${totalUsers.toLocaleString()} users\n`);
  
  // Now get same data from 3 months ago for comparison
  console.log('\n📌 COMPARISON: Same pages 3 MONTHS AGO (Oct 2025)\n');
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
    save: false,
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
    console.log(`OCT 2025 TOTAL: ${oldTotalSessions.toLocaleString()} sessions`);
    console.log(`\n📉 Drop: ${totalSessions.toLocaleString()} now vs ${oldTotalSessions.toLocaleString()} in Oct = ${((1 - totalSessions/oldTotalSessions) * 100).toFixed(1)}% decrease`);
  }
}

getPinterestLandingPages().catch(console.error);
