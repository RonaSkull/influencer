import { getTrafficBySource } from './src/api/ga4.js';

// Hello Hayley Property ID
const propertyId = '80120206';

async function analyzeTrafficDrop() {
  console.log('=== Hello Hayley Pinterest Traffic Analysis ===\n');
  
  // Get traffic by source for different periods
  const periods = [
    { name: 'September 2025', start: '2025-09-01', end: '2025-09-30' },
    { name: 'October 2025', start: '2025-10-01', end: '2025-10-31' },
    { name: 'November 2025', start: '2025-11-01', end: '2025-11-30' },
    { name: 'December 2025', start: '2025-12-01', end: '2025-12-31' },
    { name: 'January 2026', start: '2026-01-01', end: '2026-01-31' },
  ];
  
  for (const period of periods) {
    console.log(`\n--- ${period.name} ---`);
    try {
      const data = await getTrafficBySource({ startDate: period.start, endDate: period.end }, propertyId);
      
      // Find Pinterest specifically
      const pinterest = data.find(d => 
        d.source?.toLowerCase().includes('pinterest') || 
        d.sessionSource?.toLowerCase().includes('pinterest')
      );
      
      // Show top 5 sources
      console.log('Top traffic sources:');
      data.slice(0, 8).forEach((source, i) => {
        const sourceName = source.source || source.sessionSource || 'unknown';
        const sessions = source.sessions || source.activeUsers || 0;
        const isPinterest = sourceName.toLowerCase().includes('pinterest');
        console.log(`  ${i+1}. ${sourceName}: ${sessions} sessions ${isPinterest ? '📌' : ''}`);
      });
      
      if (pinterest) {
        console.log(`\n  Pinterest specifically: ${pinterest.sessions || pinterest.activeUsers} sessions`);
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
}

analyzeTrafficDrop();
