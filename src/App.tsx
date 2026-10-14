/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { AdminBar } from './components/admin/AdminBar';
import { HeroBanner } from './components/home/HeroBanner';
import { QuickAccess } from './components/home/QuickAccess';
import { AnnouncementList } from './components/announcements/AnnouncementList';
import { EventList } from './components/events/EventList';
import { InfographicGallery } from './components/infographics/InfographicGallery';
import { TopicSection } from './components/topics/TopicSection';
import { ScheduleList } from './components/schedule/ScheduleList';
import { TravelAccommodation } from './components/travel/TravelAccommodation';
import { DocumentList } from './components/documents/DocumentList';
import { ChevronRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Admin Mode Bar when activated */}
      <AdminBar />

      {/* Top Header */}
      <Header />

      {/* Hero Banner with Contingent Identity, Phase Switcher & Search */}
      <HeroBanner />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Quick Access Grid */}
            <QuickAccess />

            {/* Important Announcements Section */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Official Contingent Notices
                  </h2>
                  <p className="text-xs text-slate-500">
                    Latest memos, technical call-ups and urgent announcements
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('announcements');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>All Notices</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <AnnouncementList limit={3} showHeader={false} />
            </section>

            {/* Featured Competition Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Featured Contingent Events
                  </h2>
                  <p className="text-xs text-slate-500">
                    Symphonic Duo, Teater Islamik, Zapin, Band & Dakwah
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('events');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>All Events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <EventList />
            </section>

            {/* Visual Guides & Infographics Showcase */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Infographics & Venue Maps
                  </h2>
                  <p className="text-xs text-slate-500">
                    Venue wayfinding, stage specifications and emergency hotlines
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('infographics');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View Full Gallery</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <InfographicGallery />
            </section>

            {/* Dynamic Topics & Briefings Accordion */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Topics & Operational Guidelines
                  </h2>
                  <p className="text-xs text-slate-500">
                    Welfare, dress code, daily roll call, and competition rubrics
                  </p>
                </div>
              </div>

              <TopicSection />
            </section>
          </div>
        )}

        {activeTab === 'announcements' && <AnnouncementList />}

        {activeTab === 'events' && <EventList />}

        {activeTab === 'infographics' && <InfographicGallery />}

        {activeTab === 'schedule' && <ScheduleList />}

        {activeTab === 'travel' && <TravelAccommodation />}

        {activeTab === 'documents' && <DocumentList />}

        {activeTab === 'topics' && <TopicSection />}
      </main>

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-800">
              SYNCROZZ KPMBP Contingent Hub · SOAR IPMA 2026
            </p>
            <p className="text-[11px] text-slate-400">
              Simple by Default. Powerful When Needed. · Kolej Poly-Tech MARA Bangi
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
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
