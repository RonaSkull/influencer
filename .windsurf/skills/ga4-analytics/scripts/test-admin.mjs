import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const auth = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret
);

auth.setCredentials(tokens);

console.log('Testing Analytics Admin API...');

const client = new AnalyticsAdminServiceClient({ authClient: auth });

try {
  const [accounts] = await client.listAccounts();
  console.log('SUCCESS! Found', accounts.length, 'accounts:');
  accounts.slice(0, 5).forEach(acc => {
    console.log(' -', acc.displayName, '(', acc.name, ')');
  });
} catch (err) {
  console.error('Admin API error:', err.message);
}
