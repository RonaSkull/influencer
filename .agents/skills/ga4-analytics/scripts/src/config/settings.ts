/**
 * Settings Module - Environment configuration for GA4 API
 * Supports both Service Account and OAuth authentication
 */

import { config } from 'dotenv';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';

// Load .env file from current working directory
config();

/**
 * Settings interface for GA4 API configuration
 */
export interface Settings {
  /** GA4 Property ID */
  propertyId: string;
  /** Auth type: 'service_account' or 'oauth' */
  authType: 'service_account' | 'oauth';
  /** Service account email (for service_account auth) */
  clientEmail?: string;
  /** Service account private key (for service_account auth) */
  privateKey?: string;
  /** OAuth client ID (for oauth auth) */
  oauthClientId?: string;
  /** OAuth client secret (for oauth auth) */
  oauthClientSecret?: string;
  /** OAuth access token (for oauth auth) */
  oauthAccessToken?: string;
  /** OAuth refresh token (for oauth auth) */
  oauthRefreshToken?: string;
  /** OAuth token expiry timestamp in ms (for oauth auth) */
  oauthTokenExpiry?: number;
  /** Default date range for reports (e.g., "30d", "7d") */
  defaultDateRange: string;
  /** Directory path for storing results */
  resultsDir: string;
  /** Search Console site URL (e.g., "https://example.com") */
  siteUrl: string;
}

/**
 * Validation result from validateSettings()
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Load OAuth credentials from Clawdbot credentials directory
 */
function loadOAuthCredentials(): { oauth?: any; tokens?: any } {
  const credDir = join(homedir(), '.clawdbot', 'credentials');
  const oauthPath = join(credDir, 'ga4-oauth.json');
  const tokensPath = join(credDir, 'ga4-tokens.json');
  
  let oauth = null;
  let tokens = null;
  
  if (existsSync(oauthPath)) {
    try {
      oauth = JSON.parse(readFileSync(oauthPath, 'utf-8'));
    } catch (e) {
      console.warn('Failed to load ga4-oauth.json');
    }
  }
  
  if (existsSync(tokensPath)) {
    try {
      tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));
    } catch (e) {
      console.warn('Failed to load ga4-tokens.json');
    }
  }
  
  return { oauth, tokens };
}

/**
 * Get current settings from environment variables and credential files
 */
export function getSettings(): Settings {
  const { oauth, tokens } = loadOAuthCredentials();
  
  // Determine auth type based on available credentials
  const hasServiceAccount = process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY;
  const hasOAuth = oauth && tokens && tokens.refresh_token;
  
  const authType: 'service_account' | 'oauth' = hasServiceAccount ? 'service_account' : 'oauth';
  
  const settings: Settings = {
    propertyId: process.env.GA4_PROPERTY_ID || '',
    authType,
    defaultDateRange: process.env.GA4_DEFAULT_DATE_RANGE || '30d',
    resultsDir: join(process.cwd(), 'results'),
    siteUrl: process.env.SEARCH_CONSOLE_SITE_URL || '',
  };
  
  if (authType === 'service_account') {
    settings.clientEmail = process.env.GA4_CLIENT_EMAIL || '';
    settings.privateKey = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  } else if (hasOAuth) {
    const installed = oauth.installed || oauth.web || oauth;
    settings.oauthClientId = installed.client_id;
    settings.oauthClientSecret = installed.client_secret;
    settings.oauthAccessToken = tokens.access_token;
    settings.oauthRefreshToken = tokens.refresh_token;
    settings.oauthTokenExpiry = tokens.expiry_date;
  }
  
  return settings;
}

/**
 * Validate that all required settings are present
 */
export function validateSettings(): ValidationResult {
  const settings = getSettings();
  const errors: string[] = [];

  if (!settings.propertyId) {
    errors.push('GA4_PROPERTY_ID is required - set it in .env or environment');
  }

  if (settings.authType === 'service_account') {
    if (!settings.clientEmail) {
      errors.push('GA4_CLIENT_EMAIL is required for service account auth');
    }
    if (!settings.privateKey) {
      errors.push('GA4_PRIVATE_KEY is required for service account auth');
    }
  } else if (settings.authType === 'oauth') {
    if (!settings.oauthRefreshToken) {
      errors.push('OAuth refresh token not found - run OAuth flow first');
    }
    if (!settings.oauthClientId || !settings.oauthClientSecret) {
      errors.push('OAuth client credentials not found in ~/.clawdbot/credentials/ga4-oauth.json');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
