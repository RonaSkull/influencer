/**
 * GA4 API Client - Singleton wrapper for BetaAnalyticsDataClient
 * Also includes Search Console and Indexing API clients
 * Supports both Service Account and OAuth authentication
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { searchconsole } from '@googleapis/searchconsole';
import { indexing } from '@googleapis/indexing';
import { google, Auth } from 'googleapis';
import { getSettings, validateSettings } from '../config/settings.js';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Singleton client instances
let clientInstance: BetaAnalyticsDataClient | null = null;
let searchConsoleClientInstance: ReturnType<typeof searchconsole> | null = null;
let indexingClientInstance: ReturnType<typeof indexing> | null = null;
let oauth2ClientInstance: Auth.OAuth2Client | null = null;

/**
 * Get OAuth2 client for OAuth authentication
 */
function getOAuth2Client(): Auth.OAuth2Client {
  if (oauth2ClientInstance) {
    return oauth2ClientInstance;
  }
  
  const settings = getSettings();
  
  oauth2ClientInstance = new google.auth.OAuth2(
    settings.oauthClientId,
    settings.oauthClientSecret,
    'http://localhost'
  );
  
  oauth2ClientInstance.setCredentials({
    access_token: settings.oauthAccessToken,
    refresh_token: settings.oauthRefreshToken,
    expiry_date: settings.oauthTokenExpiry,
  });
  
  // Set up auto-refresh callback to save new tokens
  oauth2ClientInstance.on('tokens', (newTokens) => {
    const tokensPath = join(homedir(), '.clawdbot', 'credentials', 'ga4-tokens.json');
    try {
      const existing = JSON.parse(readFileSync(tokensPath, 'utf-8'));
      const updated = { ...existing, ...newTokens };
      writeFileSync(tokensPath, JSON.stringify(updated, null, 2));
      console.log('GA4 OAuth tokens auto-refreshed and saved');
    } catch (e) {
      console.warn('Failed to save refreshed tokens:', e);
    }
  });
  
  return oauth2ClientInstance;
}

/**
 * Get the GA4 Analytics Data API client (singleton)
 *
 * @returns The BetaAnalyticsDataClient instance
 * @throws Error if credentials are invalid
 */
export function getClient(): BetaAnalyticsDataClient {
  if (clientInstance) {
    return clientInstance;
  }

  const validation = validateSettings();
  if (!validation.valid) {
    throw new Error(`Invalid GA4 credentials: ${validation.errors.join(', ')}`);
  }

  const settings = getSettings();

  if (settings.authType === 'service_account') {
    // Service Account authentication
    clientInstance = new BetaAnalyticsDataClient({
      credentials: {
        client_email: settings.clientEmail,
        private_key: settings.privateKey,
      },
    });
  } else {
    // OAuth authentication
    const auth = getOAuth2Client();
    clientInstance = new BetaAnalyticsDataClient({
      authClient: auth as any,
    });
  }

  return clientInstance;
}

/**
 * Get the GA4 property ID formatted for API calls
 *
 * @returns Property ID with "properties/" prefix
 */
export function getPropertyId(): string {
  const settings = getSettings();
  return `properties/${settings.propertyId}`;
}

/**
 * Reset the client singleton (useful for testing or when credentials change)
 */
export function resetClient(): void {
  clientInstance = null;
  searchConsoleClientInstance = null;
  indexingClientInstance = null;
  oauth2ClientInstance = null;
}

/**
 * Get Google Auth client for Search Console and Indexing APIs
 */
function getGoogleAuth(): Auth.GoogleAuth | Auth.OAuth2Client {
  const settings = getSettings();
  
  if (settings.authType === 'service_account') {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: settings.clientEmail,
        private_key: settings.privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/indexing',
      ],
    });
  } else {
    return getOAuth2Client();
  }
}

/**
 * Get the Search Console API client (singleton)
 *
 * @returns The Search Console client instance
 * @throws Error if credentials are invalid
 */
export function getSearchConsoleClient(): ReturnType<typeof searchconsole> {
  if (searchConsoleClientInstance) {
    return searchConsoleClientInstance;
  }

  const validation = validateSettings();
  if (!validation.valid) {
    throw new Error(`Invalid credentials: ${validation.errors.join(', ')}`);
  }

  const auth = getGoogleAuth();
  searchConsoleClientInstance = searchconsole({ version: 'v1', auth: auth as any });

  return searchConsoleClientInstance;
}

/**
 * Get the Indexing API client (singleton)
 *
 * @returns The Indexing client instance
 * @throws Error if credentials are invalid
 */
export function getIndexingClient(): ReturnType<typeof indexing> {
  if (indexingClientInstance) {
    return indexingClientInstance;
  }

  const validation = validateSettings();
  if (!validation.valid) {
    throw new Error(`Invalid credentials: ${validation.errors.join(', ')}`);
  }

  const auth = getGoogleAuth();
  indexingClientInstance = indexing({ version: 'v3', auth: auth as any });

  return indexingClientInstance;
}

/**
 * Get the Search Console site URL
 *
 * @returns Site URL from settings
 */
export function getSiteUrl(): string {
  const settings = getSettings();
  return settings.siteUrl;
}
