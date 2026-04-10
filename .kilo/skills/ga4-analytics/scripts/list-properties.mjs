/**
 * List all GA4 properties accessible to the authenticated user
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

// Create OAuth2 client
const auth = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret,
  'http://localhost'
);

auth.setCredentials({
  refresh_token: tokens.refresh_token,
});

// Refresh token
const { credentials } = await auth.refreshAccessToken();
auth.setCredentials(credentials);

// List accounts and properties using Admin API
const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });

console.log('=== GA4 Accounts & Properties ===\n');

try {
  // List account summaries
  const response = await analyticsAdmin.accountSummaries.list();
  
  if (response.data.accountSummaries) {
    for (const account of response.data.accountSummaries) {
      console.log(`\n📊 Account: ${account.displayName} (${account.account})`);
      
      if (account.propertySummaries) {
        for (const prop of account.propertySummaries) {
          console.log(`   └─ Property: ${prop.displayName}`);
          console.log(`      Property ID: ${prop.property}`);
        }
      }
    }
  }
} catch (err) {
  console.error('Error listing properties:', err.message);
  
  // Try alternate method - just query a report to see if we get better error
  console.log('\nTrying to query directly with different property formats...');
}
