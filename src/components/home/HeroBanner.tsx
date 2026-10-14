import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { InlineEdit } from '../common/InlineEdit';
import { Search, Bell, Clock, RefreshCw } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings, updateSettings, searchQuery, setSearchQuery, resetToInitialData } = useApp();
  const { isAdminMode } = useAuth();

  const formattedDate = new Date(settings.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="border-b border-slate-200 bg-white">
      {/* Important Notice Banner */}
      {settings.noticeBanner?.enabled && (
        <div className="bg-blue-50/70 border-b border-blue-100 text-blue-900 px-4 py-2 text-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
              <Bell className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <div className="font-medium truncate min-w-0">
                <InlineEdit
                  value={settings.noticeBanner.text}
                  onSave={(val) =>
                    updateSettings({
                      noticeBanner: {
                        enabled: true,
                        text: val,
                      },
                    })
                  }
                  as="span"
                />
              </div>
            </div>
            {isAdminMode && (
              <button
                onClick={() =>
                  updateSettings({
                    noticeBanner: {
                      ...settings.noticeBanner!,
                      enabled: !settings.noticeBanner?.enabled,
                    },
                  })
                }
                className="text-[10px] text-blue-700 underline shrink-0 hover:text-blue-900 whitespace-nowrap"
              >
                Toggle Notice
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Header Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            {/* Event Name & Phase Tag */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <InlineEdit
                value={settings.eventName}
                onSave={(val) => updateSettings({ eventName: val })}
                className="font-semibold text-blue-600 uppercase tracking-wide"
                as="span"
              />
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Updated {formattedDate}</span>
              </div>
            </div>

            {/* Portal Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              <InlineEdit
                value={settings.contingentName}
                onSave={(val) => updateSettings({ contingentName: val })}
                as="span"
              />
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-slate-600">
              <InlineEdit
                value={settings.tagline}
                onSave={(val) => updateSettings({ tagline: val })}
                as="span"
              />
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedules, notices, events..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-colors placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Admin Quick Reset Helper in Admin Mode */}
        {isAdminMode && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="break-words">Penyegerakan awan: Cloud Firestore aktif (sync masa nyata antara peranti)</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all portal content to official KPMBP defaults?')) {
                  resetToInitialData();
                }
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
