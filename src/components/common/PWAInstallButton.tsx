import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { BRANDING_CONFIG } from '../../config/branding';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'drawer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
          variant === 'drawer'
            ? 'w-full justify-center bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
        } ${className}`}
        title="Pasang aplikasi ini di telefon atau desktop anda"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Pasang Aplikasi</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            variant === 'drawer'
              ? 'w-full justify-center bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
          } ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pasang di iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 py-1">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Tekan butang <strong>Kongsi (Share)</strong> pada bar pelayar Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Tatal ke bawah dan pilih <strong>Tambah ke Skrin Utama (Add to Home Screen)</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </span>
                  <p>
                    Tekan <strong>Tambah (Add)</strong> di bucu atas kanan untuk memasang ikon {BRANDING_CONFIG.platformShortName}.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                Faham & Tutup
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
