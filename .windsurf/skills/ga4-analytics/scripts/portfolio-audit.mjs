import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(installed.client_id, installed.client_secret, 'http://localhost');
auth.setCredentials(tokens);

// Force refresh
const { credentials } = await auth.refreshAccessToken();
auth.setCredentials(credentials);
// Save refreshed tokens
writeFileSync(join(credDir, 'ga4-tokens.json'), JSON.stringify({ ...tokens, ...credentials }, null, 2));

const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

const SITES = [
  { name: 'Hello Hayley', pid: '361561956' },
  { name: 'Living Tickled', pid: '352643224' },
  { name: 'Moms Make Cents', pid: '352646496' },
  { name: 'Melrose Family', pid: '312388993' },
  { name: 'Polish And Patterns', pid: '470379682' },
  { name: 'Savor & Sprinkle', pid: '477410718' },
  { name: 'Styled Locks', pid: '477442222' },
  { name: 'The Makeup Mood', pid: '477439384' },
  { name: 'The Sourdough Sisters', pid: '477426865' },
  { name: 'Today Mommy', pid: '352650803' },
  { name: 'We Heart Cozy', pid: '470376528' },
  { name: 'We Heart Decorating', pid: '470328831' },
  { name: 'We Heart Desserts', pid: '470328832' },
  { name: 'We Heart Hairstyles', pid: '470365375' },
  { name: 'We Heart Makeup', pid: '470367406' },
  { name: 'We Heart Nail Designs', pid: '470349789' },
  { name: 'We Love Decorating', pid: '470363504' },
  { name: 'We Heart This', pid: '347579229' },
  { name: 'Bloom & Brick', pid: '477434645' },
  { name: 'Dash of Homemade', pid: '477437580' },
  { name: 'Gloss & Hair', pid: '477450807' },
  { name: 'Graceful Vows', pid: '477435859' },
  { name: 'Travel Cami', pid: '328534754' },
];

async function pullSite(name, pid) {
  try {
    const res = await analyticsData.properties.runReport({
      property: `properties/${pid}`,
      requestBody: {
        dateRanges: [
          { startDate: '30daysAgo', endDate: 'today' },
          { startDate: '60daysAgo', endDate: '31daysAgo' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
        ],
      },
    });
    
    const rows = res.data.rows || [];
    // With 2 date ranges and no dimensions, we get 2 rows: [current, previous]
    const cur = rows[0];
    const prev = rows[1];
    const v = (row, i) => row ? parseInt(row.metricValues?.[i]?.value || '0') : 0;
    
    return {
      name,
      sessions: v(cur, 0),
      pageviews: v(cur, 1),
      users: v(cur, 2),
      prevSessions: v(prev, 0),
      prevPageviews: v(prev, 1),
      prevUsers: v(prev, 2),
    };
  } catch (e) {
    return { name, error: e.message?.slice(0, 120) };
  }
}

console.log('Pulling GA4 data for all 23 properties...\n');

const results = [];
for (const site of SITES) {
  const data = await pullSite(site.name, site.pid);
  results.push(data);
  const status = data.error ? `❌ ${data.error}` : `✅ ${data.sessions.toLocaleString()} sessions`;
  console.log(`  ${site.name}: ${status}`);
}

results.sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

console.log('\n=== PORTFOLIO RANKING (Last 30 Days vs Previous 30) ===\n');
console.log('Site'.padEnd(25) + 'Sessions'.padStart(10) + 'Pageviews'.padStart(12) + 'Users'.padStart(10) + '  Prev Sess'.padStart(12) + '  Change'.padStart(10));
console.log('-'.repeat(80));

for (const r of results) {
  if (r.error) { console.log(`${r.name.padEnd(25)} ERROR`); continue; }
  const change = r.prevSessions > 0 ? Math.round(((r.sessions - r.prevSessions) / r.prevSessions) * 100) : 0;
  const ch = change >= 0 ? `+${change}%` : `${change}%`;
  console.log(
    r.name.padEnd(25) +
    r.sessions.toLocaleString().padStart(10) +
    r.pageviews.toLocaleString().padStart(12) +
    r.users.toLocaleString().padStart(10) +
    r.prevSessions.toLocaleString().padStart(12) +
    ch.padStart(10)
  );
}

// Save JSON for further analysis
writeFileSync('/tmp/portfolio-audit.json', JSON.stringify(results, null, 2));
console.log('\nData saved to /tmp/portfolio-audit.json');
