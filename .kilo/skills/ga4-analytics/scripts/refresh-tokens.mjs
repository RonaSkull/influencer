import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const credDir = join(homedir(), '.clawdbot', 'credentials');
const oauth = JSON.parse(readFileSync(join(credDir, 'ga4-oauth.json'), 'utf-8'));
const tokens = JSON.parse(readFileSync(join(credDir, 'ga4-tokens.json'), 'utf-8'));

const installed = oauth.installed || oauth.web || oauth;
const client = new google.auth.OAuth2(
  installed.client_id,
  installed.client_secret,
  'http://localhost'
);

client.setCredentials({
  refresh_token: tokens.refresh_token,
});

console.log('Refreshing tokens...');
const { credentials } = await client.refreshAccessToken();
console.log('New access token obtained');
console.log('Expires:', new Date(credentials.expiry_date).toLocaleString());

// Save new tokens
const updated = { ...tokens, ...credentials };
writeFileSync(join(credDir, 'ga4-tokens.json'), JSON.stringify(updated, null, 2));
console.log('Tokens saved!');
