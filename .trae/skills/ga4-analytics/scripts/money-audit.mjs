import { google } from 'googleapis';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret);
auth.setCredentials(tokens);

const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });

async function getTopPages(propertyId, days = 30) {
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 50,
      }
    });
    return res.data.rows || [];
  } catch (error) {
    console.error(`Error fetching top pages for ${propertyId}:`, error.message);
    return [];
  }
}

async function getSiteMetrics(propertyId, days = 30) {
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'newUsers' },
          { name: 'engagementRate' },
        ],
      }
    });
    return res.data.rows?.[0] || null;
  } catch (error) {
    console.error(`Error fetching metrics for ${propertyId}:`, error.message);
    return null;
  }
}

async function getTrafficSources(propertyId, days = 30) {
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 20,
      }
    });
    return res.data.rows || [];
  } catch (error) {
    console.error(`Error fetching traffic sources for ${propertyId}:`, error.message);
    return [];
  }
}

async function getLandingPages(propertyId, days = 30) {
  try {
    const res = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'landingPage' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 30,
      }
    });
    return res.data.rows || [];
  } catch (error) {
    console.error(`Error fetching landing pages for ${propertyId}:`, error.message);
    return [];
  }
}

// Main execution
const properties = [
  { id: '361561956', name: 'Hello Hayley', domain: 'hellohayley.com' },
  { id: '347579229', name: 'We Heart This', domain: 'weheartthis.com' },
  { id: '352646496', name: 'Moms Make Cents', domain: 'momsmakecents.com' },
  { id: '312388993', name: 'NY Melrose Family', domain: 'nymelrosefamily.com' },
];

console.log('🔍 MONEY LEFT ON THE TABLE AUDIT');
console.log('📅 Last 30 Days\n');
console.log('═'.repeat(80));

const allData = [];

for (const prop of properties) {
  console.log(`\n\n🌐 ${prop.name.toUpperCase()} (${prop.domain})`);
  console.log('─'.repeat(80));
  
  const metrics = await getSiteMetrics(prop.id, 30);
  const topPages = await getTopPages(prop.id, 30);
  const sources = await getTrafficSources(prop.id, 30);
  const landingPages = await getLandingPages(prop.id, 30);
  
  const data = {
    property: prop,
    metrics: null,
    topPages: [],
    sources: [],
    landingPages: [],
    timestamp: new Date().toISOString(),
  };
  
  if (metrics) {
    const values = metrics.metricValues;
    data.metrics = {
      pageViews: parseInt(values[0].value),
      activeUsers: parseInt(values[1].value),
      sessions: parseInt(values[2].value),
      newUsers: parseInt(values[3].value),
      engagementRate: parseFloat(values[4].value),
    };
    
    console.log('\n📊 Overall Metrics:');
    console.log(`   Page Views:     ${data.metrics.pageViews.toLocaleString()}`);
    console.log(`   Active Users:   ${data.metrics.activeUsers.toLocaleString()}`);
    console.log(`   Sessions:       ${data.metrics.sessions.toLocaleString()}`);
    console.log(`   New Users:      ${data.metrics.newUsers.toLocaleString()}`);
    console.log(`   Engagement:     ${(data.metrics.engagementRate * 100).toFixed(2)}%`);
  }
  
  if (sources.length > 0) {
    console.log('\n🚀 Top 10 Traffic Sources:');
    data.sources = sources.slice(0, 10).map(row => ({
      source: row.dimensionValues[0].value,
      medium: row.dimensionValues[1].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
    }));
    
    data.sources.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.source} / ${s.medium}: ${s.sessions.toLocaleString()} sessions`);
    });
  }
  
  if (topPages.length > 0) {
    console.log('\n📄 Top 15 Pages (by Views):');
    data.topPages = topPages.slice(0, 15).map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      avgDuration: parseFloat(row.metricValues[2].value),
      bounceRate: parseFloat(row.metricValues[3].value),
    }));
    
    data.topPages.forEach((page, idx) => {
      console.log(`   ${idx + 1}. ${page.path}`);
      console.log(`      ${page.title}`);
      console.log(`      ${page.views.toLocaleString()} views | ${page.users.toLocaleString()} users | ${(page.bounceRate * 100).toFixed(1)}% bounce`);
    });
  }
  
  if (landingPages.length > 0) {
    console.log('\n🚪 Top 10 Landing Pages:');
    data.landingPages = landingPages.slice(0, 10).map(row => ({
      path: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      bounceRate: parseFloat(row.metricValues[2].value),
      avgDuration: parseFloat(row.metricValues[3].value),
    }));
    
    data.landingPages.forEach((lp, idx) => {
      console.log(`   ${idx + 1}. ${lp.path}`);
      console.log(`      ${lp.sessions.toLocaleString()} sessions | ${(lp.bounceRate * 100).toFixed(1)}% bounce`);
    });
  }
  
  allData.push(data);
  
  // Save individual file
  const outputDir = join(__dirname, '../results/audits');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, `money-audit-${prop.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`);
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved to: ${outputPath.replace(homedir(), '~')}`);
}

// Save combined data
const combinedPath = join(__dirname, '../results/audits', `money-audit-combined-${new Date().toISOString().split('T')[0]}.json`);
writeFileSync(combinedPath, JSON.stringify(allData, null, 2));

console.log('\n\n✅ Audit data collection complete!');
console.log(`📦 Combined data: ${combinedPath.replace(homedir(), '~')}`);
