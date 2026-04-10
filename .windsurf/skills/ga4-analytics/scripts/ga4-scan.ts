import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';

const credDir = `${homedir()}/.clawdbot/credentials`;
const oauth = JSON.parse(readFileSync(`${credDir}/ga4-oauth.json`, 'utf-8'));
const tokens = JSON.parse(readFileSync(`${credDir}/ga4-tokens.json`, 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret, 'http://localhost');
auth.setCredentials(tokens);

const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

const sites = [
  { name: 'Hello Hayley', propertyId: '361561956' },
  { name: 'NY Melrose Family', propertyId: '312388993' },
  { name: 'We Heart This', propertyId: '347579229' },
  { name: 'WeHeartCozy', propertyId: '470376528' },
];

async function runReport(propertyId: string, dimensions: string[], metrics: string[], startDate: string, endDate: string, limit = 25) {
  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dimensions: dimensions.map(d => ({ name: d })),
      metrics: metrics.map(m => ({ name: m })),
      dateRanges: [{ startDate, endDate }],
      limit,
      orderBys: [{ metric: { metricName: metrics[0] }, desc: true }],
    },
  });
  
  return res.data.rows?.map(row => {
    const obj: Record<string, string> = {};
    dimensions.forEach((d, i) => obj[d] = row.dimensionValues![i]?.value || '');
    metrics.forEach((m, i) => obj[m] = row.metricValues![i]?.value || '');
    return obj;
  }) || [];
}

async function main() {
  const allData: Record<string, any> = {};
  
  for (const site of sites) {
    console.log(`\n📊 ${site.name} (${site.propertyId})...`);
    allData[site.name] = {};
    
    try {
      console.log('  → Top pages (current 30d)...');
      allData[site.name].topPagesCurrent = await runReport(
        site.propertyId,
        ['pagePath', 'pageTitle'],
        ['screenPageViews', 'activeUsers', 'bounceRate', 'averageSessionDuration', 'engagementRate'],
        '30daysAgo', 'today'
      );
      
      console.log('  → Top pages (previous 30d)...');
      allData[site.name].topPagesPrevious = await runReport(
        site.propertyId,
        ['pagePath', 'pageTitle'],
        ['screenPageViews', 'activeUsers', 'bounceRate', 'averageSessionDuration', 'engagementRate'],
        '60daysAgo', '31daysAgo'
      );
      
      console.log('  → Traffic sources (current 30d)...');
      allData[site.name].trafficSourcesCurrent = await runReport(
        site.propertyId,
        ['sessionSource', 'sessionMedium'],
        ['sessions', 'activeUsers', 'bounceRate', 'averageSessionDuration'],
        '30daysAgo', 'today'
      );
      
      console.log('  → Traffic sources (previous 30d)...');
      allData[site.name].trafficSourcesPrevious = await runReport(
        site.propertyId,
        ['sessionSource', 'sessionMedium'],
        ['sessions', 'activeUsers', 'bounceRate', 'averageSessionDuration'],
        '60daysAgo', '31daysAgo'
      );

      // Landing pages for engagement quality
      console.log('  → Landing pages (current 30d)...');
      allData[site.name].landingPagesCurrent = await runReport(
        site.propertyId,
        ['landingPage'],
        ['sessions', 'activeUsers', 'bounceRate', 'engagementRate', 'averageSessionDuration'],
        '30daysAgo', 'today'
      );

      console.log(`  ✅ Done`);
    } catch (err: any) {
      console.error(`  ❌ ${err.message}`);
      allData[site.name].error = err.message;
    }
  }
  
  writeFileSync('/tmp/ga4-scan-results.json', JSON.stringify(allData, null, 2));
  console.log(`\n✅ Saved to /tmp/ga4-scan-results.json`);
}

main().catch(console.error);
