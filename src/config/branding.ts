/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SYNCROZZ BRANDING & ASSET CONFIGURATION ARCHITECTURE
 * Centralized Single Source of Truth for Platform Assets & Identity.
 *
 * Official Asset Source:
 * https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/TeamKPMBP/
 */

export interface BrandingAssetConfig {
  // Identity
  platformName: string;
  platformShortName: string; // Keep <= 12 characters for mobile PWA home screen
  platformDescription: string;
  themeColor: string;
  backgroundColor: string;

  // Central Asset References (Authoritative remote URLs with local fallback in public/)
  logoUrl: string | null;
  appIconUrl: string | null;
  faviconUrl: string | null;
  pwaIcon192Url: string | null;
  pwaIcon512Url: string | null;
  appleTouchIconUrl: string | null;
  ogImageUrl: string | null;
}

export const AUTHORITATIVE_ASSET_BASE_URL =
  'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/TeamKPMBP';

export const BRANDING_CONFIG: BrandingAssetConfig = {
  // Platform Identity
  platformName: 'SYNCROZZ Team KPMBP Contingent Hub',
  platformShortName: 'Team KPMBP',
  platformDescription:
    'Mobile-first public information portal for KPMBP participants attending SOAR IPMA 2026 with real-time announcements, schedules, and operational guidelines.',
  themeColor: '#e60020', // Official Team KPMBP Red
  backgroundColor: '#ffffff',

  // Official Branding Assets from https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/TeamKPMBP/
  logoUrl: `${AUTHORITATIVE_ASSET_BASE_URL}/web-app-manifest-512x512.png`,
  appIconUrl: `${AUTHORITATIVE_ASSET_BASE_URL}/android-chrome-512x512.png`,
  faviconUrl: '/favicon.svg',
  pwaIcon192Url: `${AUTHORITATIVE_ASSET_BASE_URL}/android-chrome-192x192.png`,
  pwaIcon512Url: `${AUTHORITATIVE_ASSET_BASE_URL}/android-chrome-512x512.png`,
  appleTouchIconUrl: `${AUTHORITATIVE_ASSET_BASE_URL}/apple-touch-icon.png`,
  ogImageUrl: `${AUTHORITATIVE_ASSET_BASE_URL}/web-app-manifest-512x512.png`,
};

/**
 * Helper to check whether official branding assets have been plugged in
 */
export const isAssetReady = {
  logo: Boolean(BRANDING_CONFIG.logoUrl),
  appIcon: Boolean(BRANDING_CONFIG.appIconUrl),
  ogImage: Boolean(BRANDING_CONFIG.ogImageUrl),
};
