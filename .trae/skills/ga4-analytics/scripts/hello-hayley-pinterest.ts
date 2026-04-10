/**
 * Analyze Hello Hayley Pinterest Traffic Drop
 * Looking at September through January to find when the drop occurred
 */

import { runReport } from './src/api/reports.js';
import { resetClient, getClient } from './src/core/client.js';
import { getSettings, validateSettings } from './src/config/settings.js';

// Hello Hayley Property ID - MUST be set before importing client
process.env.GA4_PROPERTY_ID = '80120206';

interface TrafficRow {
  source: string;
  medium: string;
  sessions: number;
  activeUsers: number;
}

async function analyzeTrafficByMonth(name: string, startDate: string, endDate: string): Promise<TrafficRow[]> {
  const response = await runReport({
    dimensions: ['sessionSource', 'sessionMedium'],
    metrics: ['sessions', 'activeUsers'],
    dateRange: { startDate, endDate },
    save: false,
  });
  
  if (!response.rows) return [];
  
  return response.rows.map(row => ({
    source: row.dimensionValues[0].value,
    medium: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value, 10),
    activeUsers: parseInt(row.metricValues[1].value, 10),
  }));
}

async function main() {
  console.log('=== Hello Hayley Pinterest Traffic Analysis ===\n');
  console.log('Property ID: 80120206\n');
  
  // Debug: Check settings
  const settings = getSettings();
  console.log('Auth type:', settings.authType);
  console.log('Has OAuth Client ID:', !!settings.oauthClientId);
  console.log('Has OAuth Refresh Token:', !!settings.oauthRefreshToken);
  
  const validation = validateSettings();
  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    return;
  }
  
  console.log('Credentials validated ✓\n');
  
  // Reset client to pick up new property ID
  resetClient();
  
  // Test connection
  try {
    const client = getClient();
    console.log('Client initialized ✓\n');
  } catch (err) {
    console.error('Failed to initialize client:', (err as Error).message);
    return;
  }
  
  const periods = [
    { name: 'September 2025', start: '2025-09-01', end: '2025-09-30' },
    { name: 'October 2025', start: '2025-10-01', end: '2025-10-31' },
    { name: 'November 1-15, 2025', start: '2025-11-01', end: '2025-11-15' },
    { name: 'November 16-30, 2025', start: '2025-11-16', end: '2025-11-30' },
    { name: 'December 1-15, 2025', start: '2025-12-01', end: '2025-12-15' },
    { name: 'December 16-31, 2025', start: '2025-12-16', end: '2025-12-31' },
    { name: 'January 2026', start: '2026-01-01', end: '2026-01-31' },
  ];
  
  const pinterestData: { period: string; sessions: number; users: number }[] = [];
  
  for (const period of periods) {
    console.log(`\n📅 ${period.name}`);
    console.log('─'.repeat(40));
    
    try {
      const data = await analyzeTrafficByMonth(period.name, period.start, period.end);
      
      // Find Pinterest
      const pinterest = data.find(d => 
        d.source.toLowerCase().includes('pinterest')
      );
      
      if (pinterest) {
        console.log(`📌 PINTEREST: ${pinterest.sessions.toLocaleString()} sessions, ${pinterest.activeUsers.toLocaleString()} users`);
        pinterestData.push({
          period: period.name,
          sessions: pinterest.sessions,
          users: pinterest.activeUsers,
        });
      } else {
        console.log('📌 PINTEREST: No data found');
        pinterestData.push({ period: period.name, sessions: 0, users: 0 });
      }
      
      // Show top 5 sources for context
      console.log('\nTop 5 traffic sources:');
      data.slice(0, 5).forEach((source, i) => {
        const isPinterest = source.source.toLowerCase().includes('pinterest');
        console.log(`  ${i+1}. ${source.source} / ${source.medium}: ${source.sessions.toLocaleString()} sessions ${isPinterest ? '📌' : ''}`);
      });
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
    }
  }
  
  // Summary table
  console.log('\n\n📊 PINTEREST TRAFFIC TREND');
  console.log('═'.repeat(60));
  console.log('Period                    | Sessions    | Users     | Change');
  console.log('─'.repeat(60));
  
  let prevSessions = 0;
  for (const d of pinterestData) {
    const change = prevSessions > 0 ? ((d.sessions - prevSessions) / prevSessions * 100).toFixed(1) : '';
    const changeStr = change ? (parseFloat(change) >= 0 ? `+${change}%` : `${change}%`) : '';
    console.log(`${d.period.padEnd(25)} | ${d.sessions.toLocaleString().padStart(11)} | ${d.users.toLocaleString().padStart(8)} | ${changeStr}`);
    prevSessions = d.sessions;
  }
}

main().catch(console.error);
