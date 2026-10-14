import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { defaultQuickAccessItems } from '../../data/initialData';
import { QuickAccessItem } from '../../types';
import {
  Bell,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Bus,
  FileText,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  MapPin,
  Phone,
  MessageSquare,
  Video,
  Shield,
  Award,
  Compass,
  HelpCircle,
  Download,
  BookOpen,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Bell,
  Sparkles,
  Image: ImageIcon,
  Calendar,
  Bus,
  FileText,
  Globe,
  Link: LinkIcon,
  MapPin,
  Phone,
  MessageSquare,
  Video,
  Shield,
  Award,
  Compass,
  HelpCircle,
  Download,
  BookOpen,
};

const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; ring: string; dot: string; label: string }
> = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'hover:border-amber-300',
    ring: 'focus:ring-amber-500',
    dot: 'bg-amber-500',
    label: 'Amber',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'hover:border-blue-300',
    ring: 'focus:ring-blue-500',
    dot: 'bg-blue-500',
    label: 'Blue',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'hover:border-indigo-300',
    ring: 'focus:ring-indigo-500',
    dot: 'bg-indigo-500',
    label: 'Indigo',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'hover:border-emerald-300',
    ring: 'focus:ring-emerald-500',
    dot: 'bg-emerald-500',
    label: 'Emerald',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'hover:border-violet-300',
    ring: 'focus:ring-violet-500',
    dot: 'bg-violet-500',
    label: 'Violet',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'hover:border-slate-300',
    ring: 'focus:ring-slate-500',
    dot: 'bg-slate-500',
    label: 'Slate',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'hover:border-rose-300',
    ring: 'focus:ring-rose-500',
    dot: 'bg-rose-500',
    label: 'Rose',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'hover:border-cyan-300',
    ring: 'focus:ring-cyan-500',
    dot: 'bg-cyan-500',
    label: 'Cyan',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'hover:border-orange-300',
    ring: 'focus:ring-orange-500',
    dot: 'bg-orange-500',
    label: 'Orange',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'hover:border-teal-300',
    ring: 'focus:ring-teal-500',
    dot: 'bg-teal-500',
    label: 'Teal',
  },
};

const APP_TABS = [
  { id: 'announcements', label: 'Announcements (Notis Rasmi)' },
  { id: 'events', label: 'Featured Events (Acara Pertandingan)' },
  { id: 'infographics', label: 'Posters & Maps (Peta & Infografik)' },
  { id: 'schedule', label: 'Timeline (Jadual & Kronologi)' },
  { id: 'travel', label: 'Travel & Accommodation (Penginapan & Bas)' },
  { id: 'documents', label: 'Documents & Downloads (Buku & Borang)' },
  { id: 'topics', label: 'Topics Section (Topik Terperinci)' },
];

export const QuickAccess: React.FC = () => {
  const { setActiveTab, announcements, events, infographics, schedules, settings, updateSettings } =
    useApp();
  const { isAdminMode } = useAuth();

  // Active items: settings or initial fallback
  const items: QuickAccessItem[] =
    settings.quickAccessItems && settings.quickAccessItems.length > 0
      ? settings.quickAccessItems
      : defaultQuickAccessItems;

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickAccessItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    desc: string;
    targetType: 'tab' | 'url';
    targetValue: string;
    iconName: string;
    colorTheme: string;
    customCount: string;
  }>({
    title: '',
    desc: '',
    targetType: 'tab',
    targetValue: 'announcements',
    iconName: 'Bell',
    colorTheme: 'blue',
    customCount: '',
  });

  // State for Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<QuickAccessItem | null>(null);

  // Compute footer badge for a card
  const getBadgeText = (item: QuickAccessItem) => {
    if (item.customCount && item.customCount.trim()) {
      return item.customCount;
    }
    if (item.targetType === 'url') {
      return 'Pautan Luar';
    }
    if (item.targetValue === 'announcements') {
      const count = announcements.filter((a) => a.status === 'published').length;
      return `${count} items`;
    }
    if (item.targetValue === 'events') {
      const count = events.filter((e) => e.status === 'published').length;
      return `${count} items`;
    }
    if (item.targetValue === 'infographics') {
      const count = infographics.filter((i) => i.status === 'published').length;
      return `${count} items`;
    }
    if (item.targetValue === 'schedule') {
      const count = schedules.filter((s) => s.status === 'published').length;
      return `${count} items`;
    }
    if (item.targetValue === 'travel') {
      return 'Hostel C/D';
    }
    if (item.targetValue === 'documents') {
      return 'Official';
    }
    return 'Portal Ahli';
  };

  // Card click handler
  const handleCardClick = (item: QuickAccessItem) => {
    if (item.targetType === 'url') {
      if (item.targetValue) {
        let url = item.targetValue.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setActiveTab(item.targetValue);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      desc: '',
      targetType: 'tab',
      targetValue: 'announcements',
      iconName: 'Bell',
      colorTheme: 'blue',
      customCount: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: QuickAccessItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      desc: item.desc,
      targetType: item.targetType || 'tab',
      targetValue: item.targetValue || 'announcements',
      iconName: item.iconName || 'Bell',
      colorTheme: item.colorTheme || 'blue',
      customCount: item.customCount || '',
    });
    setIsModalOpen(true);
  };

  // Save Modal (Create or Update)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const currentList =
      settings.quickAccessItems && settings.quickAccessItems.length > 0
        ? [...settings.quickAccessItems]
        : [...defaultQuickAccessItems];

    if (editingItem) {
      // Edit existing
      const updated = currentList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formData.title.trim(),
              desc: formData.desc.trim(),
              targetType: formData.targetType,
              targetValue: formData.targetValue.trim(),
              iconName: formData.iconName,
              colorTheme: formData.colorTheme,
              customCount: formData.customCount.trim() || undefined,
            }
          : item
      );
      await updateSettings({ quickAccessItems: updated });
    } else {
      // Add new
      const newItem: QuickAccessItem = {
        id: `portal-${Date.now()}`,
        title: formData.title.trim(),
        desc: formData.desc.trim(),
        targetType: formData.targetType,
        targetValue: formData.targetValue.trim(),
        iconName: formData.iconName,
        colorTheme: formData.colorTheme,
        customCount: formData.customCount.trim() || undefined,
        displayOrder: currentList.length + 1,
      };
      await updateSettings({ quickAccessItems: [...currentList, newItem] });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const currentList =
      settings.quickAccessItems && settings.quickAccessItems.length > 0
        ? settings.quickAccessItems
        : defaultQuickAccessItems;

    const updated = currentList.filter((item) => item.id !== itemToDelete.id);
    await updateSettings({ quickAccessItems: updated });
    setItemToDelete(null);
  };

  // Reset to default
  const handleResetToDefault = async () => {
    if (
      window.confirm(
        'Adakah anda pasti ingin menetapkan semula semua portal Quick Access kepada susunan 6 portal asal?'
      )
    ) {
      await updateSettings({ quickAccessItems: defaultQuickAccessItems });
    }
  };

  return (
    <div className="py-6">
      {/* Header with Title and Admin Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Quick Access Portal
          </h2>
          {isAdminMode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              Admin Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdminMode && (
            <>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Tambah Portal Baru ke Quick Access"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Portal</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Tetapkan semula kepada portal lalai"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Set Semula</span>
              </button>
            </>
          )}

          <span className="text-xs text-slate-500">
            {isAdminMode ? 'Klik kad untuk buka, butang untuk edit/padam' : 'Tap to jump directly'}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {items.map((card) => {
          const Icon = ICON_MAP[card.iconName] || Globe;
          const color = COLOR_MAP[card.colorTheme] || COLOR_MAP.blue;
          const badgeText = getBadgeText(card);

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              className={`p-3 bg-white border border-slate-200 rounded-xl hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer relative ${color.border}`}
            >
              <div>
                {/* Card Top: Icon & Action Controls */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {isAdminMode ? (
                    /* Admin Action Buttons (Edit & Delete) */
                    <div
                      className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 shadow-2xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(card);
                        }}
                        title={`Ubah portal "${card.title}"`}
                        className="p-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(card);
                        }}
                        title={`Padam portal "${card.title}"`}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : card.targetType === 'url' ? (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-all" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>

                {/* Card Title & Desc */}
                <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer Badge */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="line-clamp-1">{badgeText}</span>
                {card.targetType === 'url' && (
                  <ExternalLink className="w-2.5 h-2.5 text-slate-300 shrink-0 ml-1" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Portal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  {editingItem ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingItem ? 'Kemaskini Portal Quick Access' : 'Tambah Portal Quick Access Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pautan pantas di bahagian utama untuk akses segera ahli kontinjen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tajuk Portal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Announcements, Bilik Gerakan, Live Stream"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerangan Ringkas
                </label>
                <input
                  type="text"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Contoh: Notis segera, panggilan berbaris & maklumat venue"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Sasaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        targetType: 'tab',
                        targetValue: formData.targetType === 'tab' ? formData.targetValue : 'announcements',
                      })
                    }
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      formData.targetType === 'tab'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Tab Dalam Aplikasi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        targetType: 'url',
                        targetValue: formData.targetType === 'url' ? formData.targetValue : '',
                      })
                    }
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      formData.targetType === 'url'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Pautan Luar (URL)
                  </button>
                </div>
              </div>

              {/* Target Value Input */}
              {formData.targetType === 'tab' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Tab Sasaran
                  </label>
                  <select
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {APP_TABS.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Pautan Luar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    placeholder="https://chat.whatsapp.com/... atau https://maps.google.com/..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Pautan ini akan dibuka dalam tab pelayar baru apabila ditekan oleh pengguna.
                  </p>
                </div>
              )}

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const CurrIcon = ICON_MAP[iconKey];
                    const isSelected = formData.iconName === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconName: iconKey })}
                        title={iconKey}
                        className={`p-2 flex flex-col items-center justify-center rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <CurrIcon className="w-4 h-4" />
                        <span className="text-[9px] mt-1 truncate max-w-full">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tema Warna
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(COLOR_MAP).map((cKey) => {
                    const c = COLOR_MAP[cKey];
                    const isSelected = formData.colorTheme === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorTheme: cKey })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span>{c.label}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Badge Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Lencana Kaki (Pilihan)
                </label>
                <input
                  type="text"
                  value={formData.customCount}
                  onChange={(e) => setFormData({ ...formData, customCount: e.target.value })}
                  placeholder="Contoh: 'Hostel C/D', 'Rasmi', '24 Jam' (kosongkan untuk kiraan automatik)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Jika dikosongkan, bilangan item aktif akan dipaparkan secara automatik.
                </p>
              </div>

              {/* Live Preview */}
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Pratonton Kad:
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs">
                  {(() => {
                    const PreviewIcon = ICON_MAP[formData.iconName] || Globe;
                    const previewColor = COLOR_MAP[formData.colorTheme] || COLOR_MAP.blue;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-lg ${previewColor.bg} ${previewColor.text}`}>
                            <PreviewIcon className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900">
                          {formData.title || 'Tajuk Portal'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formData.desc || 'Penerangan ringkas portal'}
                        </p>
                        <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                          {formData.customCount ||
                            (formData.targetType === 'url' ? 'Pautan Luar' : '3 items')}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Padam Portal Ini?</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan mengeluarkan portal dari Quick Access.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs">
              <p className="font-semibold text-slate-800">{itemToDelete.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{itemToDelete.desc}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Ya, Padam Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
