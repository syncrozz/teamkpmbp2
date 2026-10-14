/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AdminBar } from './components/admin/AdminBar';
import { HeroBanner } from './components/home/HeroBanner';
import { QuickAccess } from './components/home/QuickAccess';
import { AnnouncementList } from './components/announcements/AnnouncementList';
import { InfographicGallery } from './components/infographics/InfographicGallery';
import { TopicSection } from './components/topics/TopicSection';
import { ScheduleList } from './components/schedule/ScheduleList';
import { TravelAccommodation } from './components/travel/TravelAccommodation';
import { DocumentList } from './components/documents/DocumentList';
import { InlineEdit } from './components/common/InlineEdit';
import { ChevronRight } from 'lucide-react';
import {
  SLUG_MAP,
  SECTION_METADATA,
  updatePageOGIMeta,
  resolveSlug,
  CanonicalSlug,
} from './utils/slugRouting';
import { SectionLinkButton } from './components/common/SectionLinkButton';

const MainContent: React.FC = () => {
  const { isAdminMode } = useAuth();
  const { activeTab, setActiveTab, settings, updateSettings, infographics, announcements } = useApp();

  // Ref to always access the latest activeTab without re-subscribing or looping
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Listen to hash changes in browser URL (slug deep-linking & smooth scroll)
  useEffect(() => {
    const handleHash = () => {
      const resolution = resolveSlug(window.location.hash);
      if (resolution.tab && resolution.tab !== activeTabRef.current) {
        setActiveTab(resolution.tab);
      }

      // Smooth scroll to target if user specifically requested an anchor (e.g. #infografik)
      if (resolution.scrollTargetId) {
        setTimeout(() => {
          const el = document.getElementById(resolution.scrollTargetId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };

    // Only inspect hash on initial mount if a hash is present in URL
    if (window.location.hash) {
      handleHash();
    }

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveTab]);

  // Sync hash and dynamic OGI metadata when active tab changes
  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#/, '').toLowerCase();
    let targetSlug: CanonicalSlug = 'overview';

    if (activeTab === 'home') {
      targetSlug =
        currentHash === 'infografik' || currentHash === 'infographics'
          ? 'infografik'
          : 'overview';
    } else {
      targetSlug = SLUG_MAP[activeTab] || 'overview';
    }

    if (window.location.hash !== `#${targetSlug}`) {
      window.history.replaceState(null, '', `#${targetSlug}`);
    }

    // Determine representative image for OGI (Open Graph Image)
    const publishedInfographics = infographics.filter(
      (i) => i.status === 'published' && i.imageUrl
    );
    const fallbackImage =
      publishedInfographics[0]?.imageUrl || infographics[0]?.imageUrl || null;

    let representativeImage: string | null = null;
    if (activeTab === 'home' || targetSlug === 'infografik') {
      representativeImage = fallbackImage;
    } else if (activeTab === 'announcements') {
      const withImg = announcements.find((a) => a.status === 'published' && a.imageUrl);
      representativeImage = withImg?.imageUrl || fallbackImage;
    } else {
      representativeImage = fallbackImage;
    }

    const meta = SECTION_METADATA[targetSlug] || SECTION_METADATA.overview;

    updatePageOGIMeta({
      title: `${meta.title} · ${settings.contingentName || 'SYNCROZZ KPMBP'}`,
      description: meta.description,
      imageUrl: representativeImage,
      slug: targetSlug,
    });
  }, [activeTab, infographics, announcements, settings.contingentName]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 w-full max-w-full overflow-x-hidden">
      {/* Admin Mode Bar when activated */}
      <AdminBar />

      {/* Top Header */}
      <Header />

      {/* Hero Banner with Contingent Identity, Phase Switcher & Search */}
      <HeroBanner />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 min-w-0">
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Primary Hero Section: Visual Guides & Infographics Showcase */}
            <section id="infografik" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    <InlineEdit
                      value={settings.sectionTitles?.infographicsTitle || 'Infographics & Venue Maps'}
                      onSave={(val) =>
                        updateSettings({
                          sectionTitles: {
                            ...settings.sectionTitles,
                            infographicsTitle: val,
                          },
                        })
                      }
                      as="span"
                    />
                  </h2>
                  <div className="text-xs text-slate-500">
                    <InlineEdit
                      value={settings.sectionTitles?.infographicsSubtitle || 'Venue wayfinding, stage specifications and emergency hotlines'}
                      onSave={(val) =>
                        updateSettings({
                          sectionTitles: {
                            ...settings.sectionTitles,
                            infographicsSubtitle: val,
                          },
                        })
                      }
                      as="p"
                    />
                  </div>
                </div>

                <SectionLinkButton slug="infografik" />
              </div>

              <InfographicGallery showHeader={false} />
            </section>

            {/* Quick Access Grid */}
            <QuickAccess />

            {/* Important Announcements Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    <InlineEdit
                      value={settings.sectionTitles?.announcementsTitle || 'Official Contingent Notices'}
                      onSave={(val) =>
                        updateSettings({
                          sectionTitles: {
                            ...settings.sectionTitles,
                            announcementsTitle: val,
                          },
                        })
                      }
                      as="span"
                    />
                  </h2>
                  <div className="text-xs text-slate-500">
                    <InlineEdit
                      value={settings.sectionTitles?.announcementsSubtitle || 'Latest memos, technical call-ups and urgent announcements'}
                      onSave={(val) =>
                        updateSettings({
                          sectionTitles: {
                            ...settings.sectionTitles,
                            announcementsSubtitle: val,
                          },
                        })
                      }
                      as="p"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('announcements');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{settings.sectionTitles?.allNoticesLabel || 'All Notices'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {isAdminMode && (
                    <InlineEdit
                      value={settings.sectionTitles?.allNoticesLabel || 'All Notices'}
                      onSave={(val) =>
                        updateSettings({
                          sectionTitles: {
                            ...settings.sectionTitles,
                            allNoticesLabel: val,
                          },
                        })
                      }
                      onlyIcon
                    />
                  )}
                </div>
              </div>

              <AnnouncementList limit={3} showHeader={false} />
            </section>

          </div>
        )}

        {activeTab === 'announcements' && (
          <section id="pengumuman" className="scroll-mt-20">
            <AnnouncementList />
          </section>
        )}

        {activeTab === 'schedule' && (
          <section id="jadual" className="scroll-mt-20">
            <ScheduleList />
          </section>
        )}

        {activeTab === 'travel' && (
          <section id="penginapan" className="scroll-mt-20">
            <TravelAccommodation />
          </section>
        )}

        {activeTab === 'documents' && (
          <section id="dokumen" className="scroll-mt-20">
            <DocumentList />
          </section>
        )}

        {activeTab === 'topics' && (
          <section id="topik" className="scroll-mt-20">
            <TopicSection />
          </section>
        )}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 w-full max-w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-800">
              SYNCROZZ KPMBP Contingent Hub · SOAR IPMA 2026
            </p>
            <p className="text-[11px] text-slate-400">
              Simple by Default. Powerful When Needed. · Kolej Poly-Tech MARA Bangi
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs">
            <button
              onClick={() => setActiveTab('travel')}
              className="hover:text-slate-900 transition-colors"
            >
              Emergency Helpline
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setActiveTab('documents')}
              className="hover:text-slate-900 transition-colors"
            >
              Handbook
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-400">SES v4.5 Compliant</span>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
