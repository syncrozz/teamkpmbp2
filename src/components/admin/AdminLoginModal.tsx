import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { verifyPin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateAndSubmit = (inputVal: string) => {
    const res = verifyPin(inputVal);
    if (res.success) {
      setPin('');
      setError(null);
      onClose();
    } else {
      setError(res.error || 'PIN keselamatan tidak sah. Sila cuba lagi.');
      setPin('');
      // Focus back immediately so user can re-type without clicking
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numeric digits, max 4
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(numericOnly);
    setError(null);

    // Auto submit upon 4th digit entry
    if (numericOnly.length === 4) {
      validateAndSubmit(numericOnly);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 0) return;
    validateAndSubmit(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-pin-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-pin-title" className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>🔒 Akses Mod Admin</span>
              </h3>
              <p className="text-xs text-slate-500 italic mt-0.5">
                Sila masukkan 4-digit PIN keselamatan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={handleInputChange}
              placeholder="Masukkan 4-digit PIN"
              autoComplete="off"
              className="w-full h-12 text-center text-xl font-bold tracking-[0.4em] text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:bg-white transition-all placeholder:text-slate-400 placeholder:text-xs placeholder:tracking-normal placeholder:font-normal"
            />
          </div>

          {/* Simple error notification */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Alternative manual submit button */}
          <button
            type="submit"
            disabled={pin.length === 0}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <span>🔑 Sahkan PIN Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
