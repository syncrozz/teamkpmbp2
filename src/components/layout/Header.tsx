import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, LogOut, Pencil, Check, X } from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { PlatformLogo } from '../common/PlatformLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Header: React.FC = () => {
  const { isAdminMode, exitAdminMode } = useAuth();
  const { activeTab, setActiveTab, settings, updateSettings } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Inline editing state for nav buttons
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');

  const navItems = [
    { id: 'home', defaultLabel: 'Overview' },
    { id: 'announcements', defaultLabel: 'Announcements' },
    { id: 'schedule', defaultLabel: 'Schedule' },
    { id: 'travel', defaultLabel: 'Travel & Stay' },
    { id: 'documents', defaultLabel: 'Documents' },
  ];

  const handleSaveTabLabel = async (tabId: string) => {
    const trimmed = editingLabel.trim();
    if (!trimmed) {
      setEditingTabId(null);
      return;
    }
    await updateSettings({
      navLabels: {
        ...(settings.navLabels || {}),
        [tabId]: trimmed,
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

          {/* Zone 2: Navigation Buttons with Pencil Edit in Admin Access Mode */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const label = settings.navLabels?.[item.id] || item.defaultLabel;
              const isActive = activeTab === item.id;
              const isEditing = editingTabId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-1 bg-white border border-blue-500 rounded-lg px-2 py-0.5 shadow-sm z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTabLabel(item.id);
                        if (e.key === 'Escape') setEditingTabId(null);
                      }}
                      autoFocus
                      className="text-xs font-semibold text-slate-900 w-24 sm:w-28 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTabLabel(item.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                      title="Simpan"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTabId(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      title="Batal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div key={item.id} className="relative inline-flex items-center group">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`whitespace-nowrap transition-colors cursor-pointer ${
                      isActive ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>

                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(item.id);
                        setEditingLabel(label);
                      }}
                      className="ml-1 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all inline-flex items-center justify-center opacity-80 group-hover:opacity-100 cursor-pointer"
                      title={`Ubah tajuk butang "${label}"`}
                      aria-label={`Ubah tajuk butang ${label}`}
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

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
