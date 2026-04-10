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

// Check token info
console.log('=== Token Info ===');
try {
  const tokenInfo = await auth.getTokenInfo(tokens.access_token);
  console.log('Email:', tokenInfo.email);
  console.log('Scopes:', tokenInfo.scopes);
} catch (e) {
  console.log('Could not get token info:', e.message);
}

// Try to list GA4 account summaries
console.log('\n=== Attempting to list GA4 accounts ===');
const analyticsadmin = google.analyticsadmin({ version: 'v1beta', auth });

try {
  const res = await analyticsadmin.accountSummaries.list();
  console.log('Found', res.data.accountSummaries?.length || 0, 'accounts:');
  
  res.data.accountSummaries?.forEach(account => {
    console.log('\nAccount:', account.displayName, '(' + account.account + ')');
    account.propertySummaries?.forEach(prop => {
      console.log('  Property:', prop.displayName, '(' + prop.property + ')');
    });
  });
} catch (e) {
  console.log('Error listing accounts:', e.message);
  if (e.response?.data) {
    console.log('Details:', JSON.stringify(e.response.data, null, 2));
  }
}
