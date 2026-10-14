import React, { useState } from 'react';
import { Link as LinkIcon, Check, Pencil, X, Sparkles } from 'lucide-react';
import { copySectionDirectLink, slugify, getEffectiveSlug } from '../../utils/slugRouting';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface SectionLinkButtonProps {
  slug: string;
  sectionKey?: string;
  titleForAutoSlug?: string;
  label?: string;
  className?: string;
}

export const SectionLinkButton: React.FC<SectionLinkButtonProps> = ({
  slug,
  sectionKey,
  titleForAutoSlug,
  label,
  className = '',
}) => {
  const { isAdminMode } = useAuth();
  const { settings, updateSettings } = useApp();
  const [copied, setCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const effectiveKey = sectionKey || slug;
  const currentSlug = getEffectiveSlug(effectiveKey, settings) || slug;
  const [customSlugInput, setCustomSlugInput] = useState(currentSlug);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copySectionDirectLink(currentSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomSlug = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanSlug = slugify(customSlugInput) || slug;
    await updateSettings({
      sectionSlugs: {
        ...(settings.sectionSlugs || {}),
        [effectiveKey]: cleanSlug,
      },
    });
    setIsEditingSlug(false);
  };

  const handleSyncWithTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (titleForAutoSlug) {
      setCustomSlugInput(slugify(titleForAutoSlug));
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        title={`Salin pautan terus bahagian ini (#${currentSlug})`}
        aria-label={`Salin pautan terus #${currentSlug}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
          copied
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-600 hover:text-blue-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-xs">Disalin!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            {label && <span>{label}</span>}
            <span className="text-[10px] text-slate-500 font-mono">#{currentSlug}</span>
          </>
        )}
      </button>

      {isAdminMode && !copied && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCustomSlugInput(currentSlug);
            setIsEditingSlug(!isEditingSlug);
          }}
          className="ml-1 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
          title="Ubah suai slug pautan ini"
          aria-label="Ubah suai slug pautan ini"
        >
          <Pencil className="w-3 h-3 text-blue-500" />
        </button>
      )}

      {/* Admin Slug Edit Popover */}
      {isAdminMode && isEditingSlug && (
        <div
          className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-blue-500/80 rounded-xl shadow-xl z-50 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Ubah Slug Bahagian</span>
            <button
              type="button"
              onClick={() => setIsEditingSlug(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">Slug Baharu:</span>
                {titleForAutoSlug && (
                  <button
                    type="button"
                    onClick={handleSyncWithTitle}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                    title="Jana slug automatik dari tajuk bahagian"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Ikut Tajuk</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-2 text-xs font-mono text-slate-400">#</span>
                <input
                  type="text"
                  value={customSlugInput}
                  onChange={(e) => setCustomSlugInput(slugify(e.target.value))}
                  placeholder={slug}
                  autoFocus
                  className="w-full pl-5 pr-2 py-1 text-xs font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Pautan: <span className="font-mono text-blue-600">#{slugify(customSlugInput) || slug}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingSlug(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCustomSlug}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
