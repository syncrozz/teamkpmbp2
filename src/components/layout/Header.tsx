import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, LogOut } from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';

export const Header: React.FC = () => {
  const { isAdminMode, exitAdminMode } = useAuth();
  const { activeTab, setActiveTab } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left shrink-0 cursor-pointer focus:outline-none"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              KPMBP Contingent Hub
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              SOAR 2026
            </span>
          </button>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'home' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'announcements' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'events' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('infographics')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'infographics' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Infographics
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'schedule' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'travel' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Travel & Stay
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`whitespace-nowrap transition-colors ${
                activeTab === 'documents' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Documents
            </button>
          </nav>

          {/* Zone 3: Admin Mode Action */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdminMode ? (
              <div className="flex items-center gap-2">
                <div className="min-h-[36px] px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs animate-in fade-in duration-150">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>🟢 Admin Mode Aktif</span>
                </div>
                <button
                  onClick={exitAdminMode}
                  className="min-h-[36px] px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  title="Keluar dari Mod Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Akses Mod Admin</span>
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
