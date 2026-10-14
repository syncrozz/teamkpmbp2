import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';
import { copySectionDirectLink, CanonicalSlug } from '../../utils/slugRouting';

interface SectionLinkButtonProps {
  slug: CanonicalSlug;
  label?: string;
  className?: string;
}

export const SectionLinkButton: React.FC<SectionLinkButtonProps> = ({
  slug,
  label = 'Salin Link',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copySectionDirectLink(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Salin pautan terus bahagian ini (#${slug})`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
        copied
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
          : 'bg-white border-slate-200 text-slate-600 hover:text-blue-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">Disalin!</span>
        </>
      ) : (
        <>
          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-mono">#{slug}</span>
        </>
      )}
    </button>
  );
};
