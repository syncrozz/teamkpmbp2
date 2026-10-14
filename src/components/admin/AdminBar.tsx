import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, X, Plus, Cloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminBar: React.FC = () => {
  const { isAdminMode, exitAdminMode } = useAuth();
  const { setActiveTab, isCloudSyncActive, cloudSyncLastUpdated } = useApp();

  if (!isAdminMode) return null;

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs px-4 py-2 border-b border-emerald-900 transition-all shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold text-emerald-300">🟢 Admin Mode Aktif</span>
          <span className="text-emerald-500 hidden sm:inline">·</span>
          <div className="flex items-center gap-1 text-[11px] text-emerald-200/90">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync Antara Peranti: {isCloudSyncActive ? 'Aktif (Cloud Firestore)' : 'Menyambung...'}</span>
            {cloudSyncLastUpdated && (
              <span className="text-emerald-400/80 text-[10px]">({cloudSyncLastUpdated})</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Notis Baru</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Muat Naik Poster</span>
          </button>
          <button
            onClick={exitAdminMode}
            className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Keluar dari Mod Admin"
          >
            <X className="w-3 h-3" />
            <span>Keluar Mod Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
