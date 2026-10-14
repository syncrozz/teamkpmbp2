import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { InlineEdit } from '../common/InlineEdit';
import { FooterLink } from '../../types';
import {
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';

const DEFAULT_FOOTER_TITLE = 'SYNCROZZ KPMBP Contingent Hub · SOAR IPMA 2026';
const DEFAULT_FOOTER_SUBTITLE =
  'Simple by Default. Powerful When Needed. · Kolej Poly-Tech MARA Bangi';
const DEFAULT_COMPLIANCE_TAG = 'SES v4.5 Compliant';

const DEFAULT_FOOTER_LINKS: FooterLink[] = [
  { id: 'fl-1', label: 'Emergency Helpline', targetType: 'tab', targetValue: 'travel' },
  { id: 'fl-2', label: 'Handbook', targetType: 'tab', targetValue: 'documents' },
];

const AVAILABLE_TABS = [
  { id: 'home', label: 'Overview / Utama' },
  { id: 'announcements', label: 'Announcements / Pengumuman' },
  { id: 'schedule', label: 'Schedule / Jadual' },
  { id: 'travel', label: 'Travel & Accommodation / Penginapan' },
  { id: 'documents', label: 'Documents / Dokumen' },
];

export const Footer: React.FC = () => {
  const { isAdminMode } = useAuth();
  const { settings, updateSettings, setActiveTab } = useApp();

  const footerConfig = settings.footer || {};
  const footerTitle = footerConfig.title ?? DEFAULT_FOOTER_TITLE;
  const footerSubtitle = footerConfig.subtitle ?? DEFAULT_FOOTER_SUBTITLE;
  const footerLinks: FooterLink[] =
    footerConfig.links && footerConfig.links.length > 0
      ? footerConfig.links
      : DEFAULT_FOOTER_LINKS;
  const complianceTag = footerConfig.complianceTag ?? DEFAULT_COMPLIANCE_TAG;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(footerTitle);
  const [draftSubtitle, setDraftSubtitle] = useState(footerSubtitle);
  const [draftTag, setDraftTag] = useState(complianceTag);
  const [draftLinks, setDraftLinks] = useState<FooterLink[]>(footerLinks);

  // Link adding/editing within modal
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkType, setNewLinkType] = useState<'tab' | 'url'>('tab');
  const [newLinkTarget, setNewLinkTarget] = useState('travel');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Quick Add Link direct from footer bar
  const [quickAddModal, setQuickAddModal] = useState(false);

  const openModal = () => {
    setDraftTitle(footerTitle);
    setDraftSubtitle(footerSubtitle);
    setDraftTag(complianceTag);
    setDraftLinks([...footerLinks]);
    setEditingLinkId(null);
    setIsAddingLink(false);
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    await updateSettings({
      footer: {
        title: draftTitle.trim() || DEFAULT_FOOTER_TITLE,
        subtitle: draftSubtitle.trim() || DEFAULT_FOOTER_SUBTITLE,
        complianceTag: draftTag.trim() || DEFAULT_COMPLIANCE_TAG,
        links: draftLinks,
      },
    });
    setIsModalOpen(false);
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Adakah anda pasti mahu memulihkan kandungan footer kepada nilai asal?')) {
      await updateSettings({
        footer: {
          title: DEFAULT_FOOTER_TITLE,
          subtitle: DEFAULT_FOOTER_SUBTITLE,
          complianceTag: DEFAULT_COMPLIANCE_TAG,
          links: DEFAULT_FOOTER_LINKS,
        },
      });
      setDraftTitle(DEFAULT_FOOTER_TITLE);
      setDraftSubtitle(DEFAULT_FOOTER_SUBTITLE);
      setDraftTag(DEFAULT_COMPLIANCE_TAG);
      setDraftLinks([...DEFAULT_FOOTER_LINKS]);
      setIsModalOpen(false);
    }
  };

  const handleAddLinkToDraft = () => {
    const trimmed = newLinkLabel.trim();
    if (!trimmed) return;
    const newLink: FooterLink = {
      id: `fl-${Date.now()}`,
      label: trimmed,
      targetType: newLinkType,
      targetValue: newLinkTarget.trim(),
    };
    setDraftLinks((prev) => [...prev, newLink]);
    setNewLinkLabel('');
    setNewLinkType('tab');
    setNewLinkTarget('travel');
    setIsAddingLink(false);
  };

  const handleDirectAddLink = async () => {
    const trimmed = newLinkLabel.trim();
    if (!trimmed) return;
    const newLink: FooterLink = {
      id: `fl-${Date.now()}`,
      label: trimmed,
      targetType: newLinkType,
      targetValue: newLinkTarget.trim(),
    };
    const updatedLinks = [...footerLinks, newLink];
    await updateSettings({
      footer: {
        ...footerConfig,
        title: footerTitle,
        subtitle: footerSubtitle,
        complianceTag,
        links: updatedLinks,
      },
    });
    setNewLinkLabel('');
    setNewLinkType('tab');
    setNewLinkTarget('travel');
    setQuickAddModal(false);
  };

  const handleDeleteDirectLink = async (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Padam pautan ini daripada footer?')) {
      const updatedLinks = footerLinks.filter((l) => l.id !== linkId);
      await updateSettings({
        footer: {
          ...footerConfig,
          title: footerTitle,
          subtitle: footerSubtitle,
          complianceTag,
          links: updatedLinks,
        },
      });
    }
  };

  const handleDeleteDraftLink = (linkId: string) => {
    setDraftLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const handleMoveDraftLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftLinks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...draftLinks];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setDraftLinks(next);
  };

  const handleLinkClick = (link: FooterLink) => {
    if (link.targetType === 'tab') {
      setActiveTab(link.targetValue);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.targetType === 'url') {
      if (link.targetValue.startsWith('http')) {
        window.open(link.targetValue, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link.targetValue;
      }
    }
  };

  return (
    <>
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 w-full max-w-full relative transition-all">
        {/* Admin Bar for Footer (Visible only in Admin Mode) */}
        {isAdminMode && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold text-amber-900">Mod Admin Footer:</span>
                <span className="text-amber-800 hidden sm:inline">
                  Anda boleh klik terus pada teks untuk edit segera, atau buka panel pengurusan penuh.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAddModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pautan</span>
                </button>
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded shadow-xs transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ubah Kandungan Footer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Brand & Subtitle */}
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-semibold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <InlineEdit
                value={footerTitle}
                onSave={async (val) => {
                  await updateSettings({
                    footer: {
                      ...footerConfig,
                      title: val,
                    },
                  });
                }}
                className="font-semibold text-slate-800 hover:text-slate-900 transition-colors"
                as="p"
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <InlineEdit
                value={footerSubtitle}
                onSave={async (val) => {
                  await updateSettings({
                    footer: {
                      ...footerConfig,
                      subtitle: val,
                    },
                  });
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                as="p"
              />
            </div>
          </div>

          {/* Right Side: Links & Compliance Tag */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-4 text-xs">
            {footerLinks.map((link, idx) => (
              <React.Fragment key={link.id || idx}>
                {idx > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
                <div className="inline-flex items-center gap-1 group relative">
                  <button
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-slate-900 transition-colors underline-offset-2 hover:underline cursor-pointer flex items-center gap-1"
                    title={link.targetType === 'url' ? `Buka ${link.targetValue}` : `Pergi ke tab ${link.targetValue}`}
                  >
                    <span>{link.label}</span>
                    {link.targetType === 'url' && (
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-70" />
                    )}
                  </button>

                  {/* Admin Quick Action for Link */}
                  {isAdminMode && (
                    <div className="inline-flex items-center gap-0.5 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal();
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                        title="Edit pautan ini"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDirectLink(link.id, e)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded cursor-pointer"
                        title="Padam pautan ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}

            {/* Compliance Tag */}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="text-slate-400 inline-flex items-center gap-1">
              <InlineEdit
                value={complianceTag}
                onSave={async (val) => {
                  await updateSettings({
                    footer: {
                      ...footerConfig,
                      complianceTag: val,
                    },
                  });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                as="span"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Add Link Modal */}
      {quickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Tambah Pautan Footer Baharu
              </h3>
              <button
                type="button"
                onClick={() => setQuickAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Paparan Pautan (Label)
                </label>
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="Contoh: Bilik Gerakan, Helpdesk, Borang Rider..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jenis Sasaran
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="quickTargetType"
                      checked={newLinkType === 'tab'}
                      onChange={() => {
                        setNewLinkType('tab');
                        setNewLinkTarget('travel');
                      }}
                    />
                    <span>Tab Aplikasi</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="quickTargetType"
                      checked={newLinkType === 'url'}
                      onChange={() => {
                        setNewLinkType('url');
                        setNewLinkTarget('https://');
                      }}
                    />
                    <span>Pautan Luar (URL)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {newLinkType === 'tab' ? 'Pilih Tab Sasaran' : 'Masukkan Alamat Web (URL)'}
                </label>
                {newLinkType === 'tab' ? (
                  <select
                    value={newLinkTarget}
                    onChange={(e) => setNewLinkTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    {AVAILABLE_TABS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="url"
                    value={newLinkTarget}
                    onChange={(e) => setNewLinkTarget(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setQuickAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDirectAddLink}
                disabled={!newLinkLabel.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Tambah ke Footer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Footer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Tetapan Kandungan Footer (Admin)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah tajuk, keterangan institusi, pautan pantas, dan teg pematuhan footer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Primary Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tajuk Utama Footer
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={DEFAULT_FOOTER_TITLE}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subtitle / Institution */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-tajuk / Maklumat Institusi
                </label>
                <input
                  type="text"
                  value={draftSubtitle}
                  onChange={(e) => setDraftSubtitle(e.target.value)}
                  placeholder={DEFAULT_FOOTER_SUBTITLE}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Compliance Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teg Pematuhan / Versi (Compliance / Version Tag)
                </label>
                <input
                  type="text"
                  value={draftTag}
                  onChange={(e) => setDraftTag(e.target.value)}
                  placeholder={DEFAULT_COMPLIANCE_TAG}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Links Management Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Senarai Pautan Footer ({draftLinks.length})
                  </label>
                  {!isAddingLink && (
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(true)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Pautan</span>
                    </button>
                  )}
                </div>

                {/* Form to Add New Link to Draft */}
                {isAddingLink && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3 space-y-3">
                    <div className="text-xs font-medium text-slate-800">Tambah Pautan Baharu</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Label Pautan</label>
                        <input
                          type="text"
                          value={newLinkLabel}
                          onChange={(e) => setNewLinkLabel(e.target.value)}
                          placeholder="cth: Handbook"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Jenis</label>
                        <select
                          value={newLinkType}
                          onChange={(e) => {
                            const val = e.target.value as 'tab' | 'url';
                            setNewLinkType(val);
                            setNewLinkTarget(val === 'tab' ? 'travel' : 'https://');
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="tab">Tab Aplikasi</option>
                          <option value="url">Pautan Luar (URL)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">
                        {newLinkType === 'tab' ? 'Tab Sasaran' : 'URL Sasaran'}
                      </label>
                      {newLinkType === 'tab' ? (
                        <select
                          value={newLinkTarget}
                          onChange={(e) => setNewLinkTarget(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        >
                          {AVAILABLE_TABS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="url"
                          value={newLinkTarget}
                          onChange={(e) => setNewLinkTarget(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingLink(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLinkToDraft}
                        disabled={!newLinkLabel.trim()}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                )}

                {/* List of current draft links */}
                <div className="space-y-1.5">
                  {draftLinks.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold text-slate-800">{link.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase font-mono">
                          {link.targetType === 'tab' ? `Tab: ${link.targetValue}` : `URL`}
                        </span>
                        {link.targetType === 'url' && (
                          <span className="text-[11px] text-slate-400 truncate max-w-xs">
                            {link.targetValue}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveDraftLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Alih ke atas"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDraftLink(idx, 'down')}
                          disabled={idx === draftLinks.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Alih ke bawah"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraftLink(link.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Padam pautan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {draftLinks.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">
                      Tiada pautan footer. Klik &quot;Tambah Pautan&quot; untuk menambah.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Pulihkan footer asal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pulihkan Asal</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
