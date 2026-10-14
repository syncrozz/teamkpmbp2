import { useEffect } from 'react';
import { BRANDING_CONFIG } from '../config/branding';

/**
 * SYNCROZZ CENTRAL BRANDING & SEO SYNCHRONIZATION HOOK
 * Ensures document head, Open Graph, Twitter cards, and PWA Service Worker
 * stay 100% in sync with BRANDING_CONFIG without manual scattered edits.
 */
export function useBrandingMeta() {
  useEffect(() => {
    // 1. Document Title
    document.title = BRANDING_CONFIG.platformName;

    // 2. Helper to set or create meta tag
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string | null) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!content) {
        if (element) element.remove();
        return;
      }
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Helper to set or create link tag
    const setLinkTag = (rel: string, href: string | null, extraAttrs?: Record<string, string>) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!href) {
        if (element) element.remove();
        return;
      }
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
      if (extraAttrs) {
        Object.entries(extraAttrs).forEach(([k, v]) => element?.setAttribute(k, v));
      }
    };

    // 4. Standard Metadata
    setMetaTag('name', 'description', BRANDING_CONFIG.platformDescription);
    setMetaTag('name', 'theme-color', BRANDING_CONFIG.themeColor);
    setMetaTag('name', 'application-name', BRANDING_CONFIG.platformShortName);
    setMetaTag('name', 'apple-mobile-web-app-title', BRANDING_CONFIG.platformShortName);
    setMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
    setMetaTag('name', 'mobile-web-app-capable', 'yes');
    setMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'default');

    // 5. OpenGraph & Twitter Cards
    setMetaTag('property', 'og:title', BRANDING_CONFIG.platformName);
    setMetaTag('property', 'og:description', BRANDING_CONFIG.platformDescription);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', BRANDING_CONFIG.platformShortName);
    if (typeof window !== 'undefined') {
      setMetaTag('property', 'og:url', window.location.href);
    }
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', BRANDING_CONFIG.platformName);
    setMetaTag('name', 'twitter:description', BRANDING_CONFIG.platformDescription);

    // 6. Central OGI Integration (Section 6)
    // If ogImageUrl is set, inject og:image & twitter:image; if pending/null, omit cleanly without fake image
    if (BRANDING_CONFIG.ogImageUrl) {
      setMetaTag('property', 'og:image', BRANDING_CONFIG.ogImageUrl);
      setMetaTag('name', 'twitter:image', BRANDING_CONFIG.ogImageUrl);
    } else {
      setMetaTag('property', 'og:image', null);
      setMetaTag('name', 'twitter:image', null);
    }

    // 7. Icons & Manifest Links
    setLinkTag('manifest', '/manifest.json');
    if (BRANDING_CONFIG.faviconUrl) {
      setLinkTag('icon', BRANDING_CONFIG.faviconUrl);
    }
    if (BRANDING_CONFIG.appleTouchIconUrl) {
      setLinkTag('apple-touch-icon', BRANDING_CONFIG.appleTouchIconUrl);
    }

    // 8. Service Worker Registration for Offline Resilience
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.info('[PWA] Service Worker registration skipped in current mode:', err);
      });
    }
  }, []);
}
