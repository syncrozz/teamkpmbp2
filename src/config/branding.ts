/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SYNCROZZ BRANDING & ASSET CONFIGURATION ARCHITECTURE
 * Centralized Single Source of Truth for Platform Assets & Identity.
 *
 * STANDARD:
 * - Function First + Architecture Ready + Asset Ready + Easy Swap + No Fabrication.
 * - When official assets (Logo, App Icon, OGI, Favicon) are provided, update this file ONLY.
 * - All consumers (HTML head, PWA manifest, UI components, social cards) read from here.
 * - Zero structural rebuild or business logic edits required upon asset replacement.
 */

export interface BrandingAssetConfig {
  // Identity
  platformName: string;
  platformShortName: string; // Keep <= 12 characters for mobile PWA home screen
  platformDescription: string;
  themeColor: string;
  backgroundColor: string;

  // Central Asset References (null = Pending / Not yet provided by user)
  logoUrl: string | null;
  appIconUrl: string | null;
  faviconUrl: string | null;
  pwaIcon192Url: string | null;
  pwaIcon512Url: string | null;
  appleTouchIconUrl: string | null;
  ogImageUrl: string | null; // Central OGI reference: empty until official asset provided
}

export const BRANDING_CONFIG: BrandingAssetConfig = {
  // Platform Identity
  platformName: 'SYNCROZZ KPMBP Contingent Hub',
  platformShortName: 'Rujukan Team',
  platformDescription:
    'Mobile-first public information portal for KPMBP participants attending SOAR IPMA 2026 with real-time announcements, schedules, and operational guidelines.',
  themeColor: '#2563eb', // Contingent Blue
  backgroundColor: '#ffffff',

  // Official Branding Assets
  // STATUS: Pending Official Provision (Set direct URL or path when provided by user)
  logoUrl: null, // e.g. '/assets/branding/logo.png' or direct remote asset URL
  appIconUrl: null, // e.g. '/assets/branding/app-icon.png'
  faviconUrl: '/favicon.ico', // Standard favicon integration point
  pwaIcon192Url: '/icons/icon-192.png', // PWA 192x192 integration point
  pwaIcon512Url: '/icons/icon-512.png', // PWA 512x512 integration point
  appleTouchIconUrl: '/icons/apple-touch-icon.png', // iOS Safari 180x180 integration point
  ogImageUrl: null, // OGI Central Reference: Pending official asset (No fake OGI)
};

/**
 * Helper to check whether official branding assets have been plugged in
 */
export const isAssetReady = {
  logo: Boolean(BRANDING_CONFIG.logoUrl),
  appIcon: Boolean(BRANDING_CONFIG.appIconUrl),
  ogImage: Boolean(BRANDING_CONFIG.ogImageUrl),
};
