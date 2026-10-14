import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Bell,
  Sparkles,
  Image as ImageIcon,
  Menu,
  Calendar,
  FileText,
  Bus,
  Shield,
  ShieldCheck,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useApp();
  const { isAdminMode, exitAdminMode } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: settings.navLabels?.['home'] || 'Home', icon: Home },
    { id: 'announcements', label: settings.navLabels?.['announcements'] || 'Notices', icon: Bell },
    { id: 'schedule', label: settings.navLabels?.['schedule'] || 'Schedule', icon: Calendar },
    { id: 'travel', label: settings.navLabels?.['travel'] || 'Travel', icon: Bus },
  ];

  return (
    <>
      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe w-full max-w-full"
      >
        <div className="grid grid-cols-5 items-center h-14 w-full max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMoreOpen;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-0 w-full py-1 transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full px-1">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-0 w-full py-1 transition-colors cursor-pointer ${
              isMoreOpen || ['schedule', 'travel', 'documents'].includes(activeTab)
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet Body */}
          <div className="relative bg-white rounded-t-2xl shadow-xl border-t border-slate-200 p-5 max-h-[85vh] overflow-y-auto pb-safe">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                KPMBP Contingent Directory
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleTabClick('schedule')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  activeTab === 'schedule' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{settings.navLabels?.['schedule'] || 'Full Event Schedule'}</p>
                    <p className="text-xs text-slate-500">Timeline & Stage Slots</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleTabClick('travel')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  activeTab === 'travel' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{settings.navLabels?.['travel'] || 'Travel & Accommodation'}</p>
                    <p className="text-xs text-slate-500">Buses, Hostels & Rooming</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleTabClick('documents')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                  activeTab === 'documents' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{settings.navLabels?.['documents'] || 'Official Documents'}</p>
                    <p className="text-xs text-slate-500">Rulebooks & Consent Forms</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Admin Management Section */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              {isAdminMode ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">
                        🟢 Admin Mode Aktif
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-tight">
                    Tindakan pentadbiran dan ikon pensel kini boleh digunakan di seluruh portal.
                  </p>
                  <button
                    onClick={() => {
                      exitAdminMode();
                      setIsMoreOpen(false);
                    }}
                    className="w-full h-9 px-3 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar Mod Admin</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Akses Mod Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
