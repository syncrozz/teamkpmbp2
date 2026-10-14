import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, X, Pencil, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminBar: React.FC<{ onOpenQuickCreate?: () => void }> = () => {
  const { isAdminMode, setIsAdminMode, user } = useAuth();
  const { setActiveTab } = useApp();

  if (!isAdminMode) return null;

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-400">Admin Mode Active:</span>
          <span className="text-slate-300 hidden sm:inline">
            Click any blue pencil icon to edit content inline.
          </span>
          <span className="text-slate-400 text-[11px] font-mono">
            ({user?.email})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New Notice</span>
          </button>
          <button
            onClick={() => setActiveTab('infographics')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Upload Poster</span>
          </button>
          <button
            onClick={() => setIsAdminMode(false)}
            className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="Exit inline editing mode"
          >
            <X className="w-3 h-3" />
            <span>Exit Admin Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
