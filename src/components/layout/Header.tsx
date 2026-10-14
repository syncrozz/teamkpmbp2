import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, ShieldCheck, LogIn, LogOut, CheckCircle } from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';

export const Header: React.FC = () => {
  const { user, isAdmin, isAdminMode, setIsAdminMode, logout } = useAuth();
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

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    isAdminMode
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isAdminMode ? 'Click to exit inline edit mode' : 'Click to enable inline pencil editing'}
                >
                  {isAdminMode ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Admin Mode On</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Enable Editing</span>
                    </>
                  )}
                </button>
                <button
                  onClick={logout}
                  className="min-h-[36px] p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title={`Signed in as ${user?.email}. Click to sign out.`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Access</span>
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
