import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, LogOut, Pencil, Check, X, Link as LinkIcon, Sparkles } from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { PlatformLogo } from '../common/PlatformLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { copySectionDirectLink, slugify, getEffectiveSlug } from '../../utils/slugRouting';

export const Header: React.FC = () => {
  const { isAdminMode, exitAdminMode } = useAuth();
  const { activeTab, setActiveTab, settings, updateSettings } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Inline editing state for nav buttons (Label & Slug)
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingSlug, setEditingSlug] = useState('');
  const [copiedTabId, setCopiedTabId] = useState<string | null>(null);

  const navItems = [
    { id: 'home', defaultLabel: 'Overview', defaultSlug: 'all' },
    { id: 'announcements', defaultLabel: 'Announcements', defaultSlug: 'pengumuman' },
    { id: 'schedule', defaultLabel: 'Schedule', defaultSlug: 'jadual' },
    { id: 'travel', defaultLabel: 'Travel & Stay', defaultSlug: 'penginapan' },
    { id: 'documents', defaultLabel: 'Documents', defaultSlug: 'dokumen' },
  ];

  const handleCopyTabLink = async (tabId: string, slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await copySectionDirectLink(slug);
    setCopiedTabId(tabId);
    setTimeout(() => setCopiedTabId(null), 2000);
  };

  const handleSaveTab = async (tabId: string) => {
    const trimmedLabel = editingLabel.trim();
    if (!trimmedLabel) {
      setEditingTabId(null);
      return;
    }
    const cleanSlug =
      slugify(editingSlug) || (tabId === 'home' ? 'all' : slugify(trimmedLabel));

    await updateSettings({
      navLabels: {
        ...(settings.navLabels || {}),
        [tabId]: trimmedLabel,
      },
      tabSlugs: {
        ...(settings.tabSlugs || {}),
        [tabId]: cleanSlug,
      },
    });
    setEditingTabId(null);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6 min-w-0">
          
          {/* Zone 1: Central Platform Logo Integration */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center text-left shrink-0 cursor-pointer focus:outline-none min-w-0"
            aria-label="Kembali ke Laman Utama"
          >
            <PlatformLogo />
          </button>

          {/* Zone 2: Navigation Buttons with Synchronized Slug & Pencil Edit in Admin Mode */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const label = settings.navLabels?.[item.id] || item.defaultLabel;
              const effectiveSlug = getEffectiveSlug(item.id, settings) || item.defaultSlug;
              const isActive = activeTab === item.id;
              const isEditing = editingTabId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="relative bg-white border border-blue-500 rounded-xl p-3 shadow-xl z-50 min-w-[250px] text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Ubah Tajuk & Slug</span>
                      <span className="text-blue-600 font-mono">#{item.id}</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                          Tajuk Butang:
                        </label>
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          placeholder={item.defaultLabel}
                          autoFocus
                          className="text-xs font-semibold text-slate-900 w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[10px] font-medium text-slate-600">
                            Slug URL:
                          </label>
                          <div className="flex items-center gap-1.5">
                            {item.id === 'home' && (
                              <button
                                type="button"
                                onClick={() => setEditingSlug('all')}
                                className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                              >
                                Set #all
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSlug(
                                  item.id === 'home' && !editingLabel.trim()
                                    ? 'all'
                                    : slugify(editingLabel)
                                )
                              }
                              className="text-[10px] text-slate-500 hover:text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Ikut Tajuk</span>
                            </button>
                          </div>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-xs font-mono text-slate-400">#</span>
                          <input
                            type="text"
                            value={editingSlug}
                            onChange={(e) => setEditingSlug(slugify(e.target.value))}
                            placeholder={item.defaultSlug}
                            className="text-xs font-mono text-slate-900 w-full pl-6 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">
                          Pautan:{' '}
                          <span className="font-mono text-blue-600">
                            #{slugify(editingSlug) || item.defaultSlug}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingTabId(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTab(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="relative inline-flex items-center group gap-1">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`whitespace-nowrap transition-colors cursor-pointer ${
                      isActive ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>

                  {/* Slug Link Button for Alignment with SectionLinkButton - only shown in admin mode */}
                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyTabLink(item.id, effectiveSlug, e)}
                      title={`Salin pautan terus #${effectiveSlug}`}
                      aria-label={`Salin pautan terus #${effectiveSlug}`}
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded transition-all cursor-pointer ${
                        copiedTabId === item.id
                          ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 border border-transparent hover:border-blue-200'
                      }`}
                    >
                      {copiedTabId === item.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Disalin!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-500" />
                          <span>#{effectiveSlug}</span>
                        </>
                      )}
                    </button>
                  )}

                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(item.id);
                        setEditingLabel(label);
                        setEditingSlug(effectiveSlug);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all inline-flex items-center justify-center opacity-80 group-hover:opacity-100 cursor-pointer"
                      title={`Ubah tajuk & slug butang "${label}"`}
                      aria-label={`Ubah tajuk & slug butang ${label}`}
                    >
                      <Pencil className="w-3 h-3 text-blue-500" />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Zone 3: PWA Install & Admin Mode Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton />
            {isAdminMode ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="min-h-[32px] sm:min-h-[36px] px-2 sm:px-3 py-1 bg-emerald-600 text-white rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="hidden sm:inline">Admin Mode</span>
                  <span className="sm:hidden">Admin</span>
                </div>
                <button
                  onClick={exitAdminMode}
                  className="min-h-[32px] sm:min-h-[36px] px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  title="Keluar dari Mod Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Akses Mod Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Mode Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
