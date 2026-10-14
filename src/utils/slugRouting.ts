/**
 * Utility for Section Slugs, Direct Links & Dynamic Open Graph Image (OGI) Meta
 */

export const CANONICAL_SLUGS = [
  'overview',
  'infografik',
  'pengumuman',
  'jadual',
  'penginapan',
  'dokumen',
  'topik',
] as const;

export type CanonicalSlug = (typeof CANONICAL_SLUGS)[number];

export const SLUG_MAP: Record<string, CanonicalSlug> = {
  home: 'overview',
  overview: 'overview',
  infografik: 'infografik',
  infographics: 'infografik',
  announcements: 'pengumuman',
  pengumuman: 'pengumuman',
  schedule: 'jadual',
  jadual: 'jadual',
  travel: 'penginapan',
  penginapan: 'penginapan',
  documents: 'dokumen',
  dokumen: 'dokumen',
  topics: 'topik',
  topik: 'topik',
};

export const TAB_FROM_SLUG: Record<string, string> = {
  overview: 'home',
  home: 'home',
  infografik: 'home',
  infographics: 'home',
  pengumuman: 'announcements',
  announcements: 'announcements',
  jadual: 'schedule',
  schedule: 'schedule',
  penginapan: 'travel',
  travel: 'travel',
  dokumen: 'documents',
  documents: 'documents',
  topik: 'topics',
  topics: 'topics',
};

export interface SlugResolution {
  tab: string;
  slug: CanonicalSlug;
  scrollTargetId?: string;
  isRecognized: boolean;
}

/**
 * Resolves any hash / slug string (with or without #, uppercase or alias)
 */
export function resolveSlug(rawInput: string | null | undefined): SlugResolution {
  if (!rawInput) {
    return { tab: 'home', slug: 'overview', isRecognized: false };
  }

  const clean = rawInput.trim().replace(/^#+/, '').toLowerCase();
  if (!clean) {
    return { tab: 'home', slug: 'overview', isRecognized: false };
  }

  // Handle infografik specifically inside home tab
  if (clean === 'infografik' || clean === 'infographics') {
    return {
      tab: 'home',
      slug: 'infografik',
      scrollTargetId: 'infografik',
      isRecognized: true,
    };
  }

  if (TAB_FROM_SLUG[clean]) {
    const tab = TAB_FROM_SLUG[clean];
    const slug = SLUG_MAP[clean] || (clean as CanonicalSlug);
    return {
      tab,
      slug,
      scrollTargetId: clean,
      isRecognized: true,
    };
  }

  // Fallback to overview
  return { tab: 'home', slug: 'overview', isRecognized: false };
}

export const SECTION_METADATA: Record<CanonicalSlug, { title: string; description: string; sectionName: string }> = {
  overview: {
    sectionName: 'Overview',
    title: 'Overview Portal & Maklumat Utama — Kontinjen KPMBP',
    description: 'Portal rasmi rujukan pantas, ringkasan kontinjen dan info terkini Kontinjen KPMBP ke SOAR IPMA 2026.',
  },
  infografik: {
    sectionName: 'Infografik & Poster',
    title: 'Infografik & Peta Lokasi Rasmi — Kontinjen KPMBP',
    description: 'Panduan visual berkualiti tinggi, carta alir pertandingan, peta venue dan infografik SOP SOAR IPMA 2026.',
  },
  pengumuman: {
    sectionName: 'Hebahan & Notis',
    title: 'Hebahan & Notis Terkini — Kontinjen KPMBP',
    description: 'Notis rasmi, memo segera, panggilan taklimat dan hebahan teknikal sepanjang temasya SOAR IPMA 2026.',
  },
  jadual: {
    sectionName: 'Jadual Acara',
    title: 'Jadual & Atur Cara Acara — Kontinjen KPMBP',
    description: 'Susunan masa pertandingan, raptai, pendaftaran dan sesi penting mengikut fasa acara SOAR IPMA 2026.',
  },
  penginapan: {
    sectionName: 'Penginapan & Logistik',
    title: 'Penginapan & Pengangkutan Bas — Kontinjen KPMBP',
    description: 'Maklumat hotel penginapan, agihan bilik, waktu pergerakan bas kontinjen dan hotline kecemasan 24 jam.',
  },
  dokumen: {
    sectionName: 'Dokumen & Borang',
    title: 'Buku Program & Dokumen Rasmi — Kontinjen KPMBP',
    description: 'Muat turun buku program, borang teknikal kontinjen, pelepasan dan dokumen panduan rasmi.',
  },
  topik: {
    sectionName: 'Panduan Pasukan',
    title: 'Topik & Panduan Terperinci — Kontinjen KPMBP',
    description: 'Panduan terperinci kontinjen, tatatertib pasukan dan SOP pertandingan SOAR IPMA 2026.',
  },
};

/**
 * Updates page title and Open Graph Image (OGI) meta tags dynamically in document head
 */
export function updatePageOGIMeta(params: {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  slug?: string;
}) {
  if (typeof document === 'undefined') return;

  const title = params.title || 'Rujukan Team — SYNCROZZ KPMBP Contingent Hub';
  const description =
    params.description ||
    'Portal rujukan pantas dan maklumat rasmi kontinjen KPMBP ke SOAR IPMA 2026.';

  document.title = title;

  const setMeta = (attr: 'name' | 'property', key: string, content: string | null) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!content) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('property', 'og:title', title);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'description', description);
  setMeta('property', 'og:description', description);
  setMeta('name', 'twitter:description', description);

  if (typeof window !== 'undefined') {
    setMeta('property', 'og:url', window.location.href);
  }

  // Dynamic Open Graph Image (OGI)
  if (params.imageUrl) {
    setMeta('property', 'og:image', params.imageUrl);
    setMeta('name', 'twitter:image', params.imageUrl);
    setMeta('name', 'twitter:card', 'summary_large_image');
  } else {
    // If no specific image, we can clear or keep fallback
    setMeta('property', 'og:image', null);
    setMeta('name', 'twitter:image', null);
  }
}

/**
 * Generates and copies direct section link to clipboard
 */
export async function copySectionDirectLink(slug: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  const cleanSlug = slug.replace(/^#/, '');
  const url = `${window.location.origin}${window.location.pathname}#${cleanSlug}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // fallback for older browsers / iframe permissions
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
  return url;
}
