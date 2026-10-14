import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Infographic } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  X,
  Tag,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Loader2,
  Link as LinkIcon,
  FileImage,
  Edit2,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { updatePageOGIMeta } from '../../utils/slugRouting';
import { storage, isFirebaseConfigured, auth } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface PendingUpload {
  file?: File;
  previewUrl: string;
  title: string;
  description: string;
  topicId: string;
  eventId: string;
  tags: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  isExternalUrl?: boolean;
}

interface InfographicGalleryProps {
  limit?: number;
  showHeader?: boolean;
  showFilters?: boolean;
}

/**
 * Optimizes image file to fit within browser storage and Firestore limits (<1MB)
 * while preserving high visual clarity.
 */
const optimizeImageFile = async (file: File, maxDimension = 1100, quality = 0.78): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let dataUrl = canvas.toDataURL('image/webp', quality);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      // Guarantee size is safe for Firestore cloud storage (<750KB)
      if (dataUrl.length > 750000) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      }
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
};

export const InfographicGallery: React.FC<InfographicGalleryProps> = ({
  limit,
  showHeader = true,
  showFilters = true,
}) => {
  const {
    infographics,
    addInfographic,
    updateInfographic,
    deleteInfographic,
    reorderInfographic,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    reorderTopic,
    events,
    selectedEventFilter,
    setSelectedEventFilter,
    selectedTopicFilter,
    setSelectedTopicFilter,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [activeLightbox, setActiveLightbox] = useState<Infographic | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Topic/Tag inline management state for filter bar buttons
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagTitle, setNewTagTitle] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');
  const [tagActionNotice, setTagActionNotice] = useState<string | null>(null);

  // Tab mode in upload modal: 'file' | 'url'
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [directTitleInput, setDirectTitleInput] = useState('');
  const [directDescInput, setDirectDescInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handlers for Tag / Button management
  const handleAddNewTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newTagTitle.trim();
    if (!title) return;
    try {
      await addTopic({
        title,
        description: `Kategori rujukan untuk ${title}`,
        iconName: 'Bookmark',
        displayOrder: topics.length + 1,
        status: 'published',
        featured: false,
      });
      setNewTagTitle('');
      setIsAddingTag(false);
      setTagActionNotice(`Tag "${title}" berjaya ditambah!`);
      setTimeout(() => setTagActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  const handleSaveEditTag = async (id: string) => {
    const title = editingTopicTitle.trim();
    if (!title) return;
    try {
      await updateTopic(id, { title });
      setEditingTopicId(null);
      setEditingTopicTitle('');
      setTagActionNotice(`Tag berjaya dikemaskini kepada "${title}"!`);
      setTimeout(() => setTagActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to update tag:', err);
    }
  };

  const handleDeleteTag = async (id: string, title: string) => {
    if (window.confirm(`Adakah anda pasti ingin memadam tag / butang topik "${title}"?`)) {
      try {
        if (selectedTopicFilter === id) {
          setSelectedTopicFilter(null);
        }
        await deleteTopic(id);
        setTagActionNotice(`Tag "${title}" telah dipadam.`);
        setTimeout(() => setTagActionNotice(null), 3000);
      } catch (err) {
        console.error('Failed to delete tag:', err);
      }
    }
  };

  const handleReorderTag = async (id: string, direction: 'up' | 'down') => {
    try {
      await reorderTopic(id, direction);
      setTagActionNotice(`Susunan tag dikemaskini.`);
      setTimeout(() => setTagActionNotice(null), 2000);
    } catch (err) {
      console.error('Failed to reorder tag:', err);
    }
  };

  // File selection handler
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const newPending: PendingUpload[] = filesArray.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        file,
        previewUrl,
        title: cleanTitle,
        description: 'Panduan visual dan infografik kontinjen.',
        topicId: topics[0]?.id || '',
        eventId: '',
        tags: 'SOAR2026, Kontinjen',
        progress: 0,
        status: 'pending',
      };
    });

    setPendingUploads((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    const cleanTitle = directTitleInput.trim() || 'Infografik Kontinjen';
    const newPendingItem: PendingUpload = {
      previewUrl: directUrlInput.trim(),
      title: cleanTitle,
      description: directDescInput.trim() || 'Panduan visual dan infografik kontinjen.',
      topicId: topics[0]?.id || '',
      eventId: '',
      tags: 'SOAR2026, Peta',
      progress: 0,
      status: 'pending',
      isExternalUrl: true,
    };
    setPendingUploads((prev) => [...prev, newPendingItem]);
    setDirectUrlInput('');
    setDirectTitleInput('');
    setDirectDescInput('');
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads((prev) => {
      const copy = [...prev];
      if (copy[index].file) {
        URL.revokeObjectURL(copy[index].previewUrl);
      }
      copy.splice(index, 1);
      return copy;
    });
  };

  const updatePendingUpload = (index: number, updates: Partial<PendingUpload>) => {
    setPendingUploads((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const uploadSingleItem = async (item: PendingUpload, index: number): Promise<boolean> => {
    updatePendingUpload(index, { status: 'uploading', progress: 15 });

    try {
      let finalImageUrl = item.previewUrl;

      // If it's a file, handle upload or optimization
      if (item.file) {
        let storageUploaded = false;

        // 1. Try Firebase Storage if authenticated
        if (isFirebaseConfigured && storage && auth?.currentUser) {
          try {
            const safeName = item.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storagePath = `infographics/${Date.now()}_${safeName}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, item.file);

            await new Promise<void>((resolve, reject) => {
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                  updatePendingUpload(index, { progress: Math.max(15, Math.min(90, p)) });
                },
                (error) => reject(error),
                async () => {
                  try {
                    finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    storageUploaded = true;
                    resolve();
                  } catch (e) {
                    reject(e);
                  }
                }
              );
            });
          } catch (storageErr) {
            console.warn('[Firebase Storage] Falling back to high-quality local storage:', storageErr);
            storageUploaded = false;
          }
        }

        // 2. If storage was not used or failed (e.g. unauthenticated PIN admin mode)
        if (!storageUploaded || !finalImageUrl) {
          updatePendingUpload(index, { progress: 50 });
          finalImageUrl = await optimizeImageFile(item.file);
          updatePendingUpload(index, { progress: 90 });
        }
      }

      const tagsArray = item.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addInfographic({
        title: item.title.trim() || 'Infografik Kontinjen',
        description: item.description.trim() || 'Panduan visual dan infografik kontinjen.',
        imageUrl: finalImageUrl,
        topicId: item.topicId ? item.topicId : '',
        eventId: item.eventId ? item.eventId : '',
        tags: tagsArray,
        status: 'published',
        displayOrder: infographics.length + 1,
        sizeBytes: item.file?.size || 250000,
      });

      updatePendingUpload(index, { status: 'completed', progress: 100 });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Upload single item failed:', err);
      updatePendingUpload(index, {
        status: 'error',
        errorMessage: e.message || 'Gagal memuat naik. Sila cuba lagi.',
      });
      return false;
    }
  };

  const handleStartBatchUpload = async () => {
    if (pendingUploads.length === 0) return;
    setIsUploadingBatch(true);

    let allSucceeded = true;
    for (let i = 0; i < pendingUploads.length; i++) {
      if (pendingUploads[i].status !== 'completed') {
        const ok = await uploadSingleItem(pendingUploads[i], i);
        if (!ok) allSucceeded = false;
      }
    }

    setIsUploadingBatch(false);

    if (allSucceeded) {
      setTimeout(() => {
        setPendingUploads([]);
        setIsUploadModalOpen(false);
      }, 700);
    }
  };

  // Filter gallery
  const filtered = infographics.filter((item) => {
    if (!isAdminMode && item.status !== 'published') return false;
    if (selectedTopicFilter && item.topicId !== selectedTopicFilter) return false;
    if (selectedEventFilter && item.eventId !== selectedEventFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    }
    return true;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopyNotice('Pautan berjaya disalin ke papan keratan!');
      setTimeout(() => setCopyNotice(null), 2500);
    } catch {
      setCopyNotice('Pautan: ' + window.location.href);
      setTimeout(() => setCopyNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {copyNotice && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in">
          {copyNotice}
        </div>
      )}

      {/* Optional Inner Header (when rendered standalone) */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Infographics, Posters & Venue Maps
            </h2>
            <p className="text-xs text-slate-500">
              High-resolution visual guidelines, wayfinding charts and event schedules
            </p>
          </div>

          {isAdminMode && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="min-h-[36px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Infographic</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Bar */}
      {showFilters && (
        <div className="space-y-2">
          {/* Action notification toast */}
          {tagActionNotice && (
            <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center justify-between animate-in fade-in">
              <span>{tagActionNotice}</span>
              <button
                type="button"
                onClick={() => setTagActionNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 ml-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* All filter button */}
            <button
              type="button"
              onClick={() => {
                setSelectedTopicFilter(null);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                !selectedTopicFilter
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All
            </button>

            {/* Topic buttons with Admin edit/delete/reorder support */}
            {topics.map((t, idx) => {
              const isSelected = selectedTopicFilter === t.id;
              const isEditing = editingTopicId === t.id;

              if (isEditing) {
                return (
                  <form
                    key={t.id}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveEditTag(t.id);
                    }}
                    className="inline-flex items-center gap-1 bg-white border-2 border-blue-500 rounded-lg px-2 py-0.5 shadow-sm"
                  >
                    <input
                      type="text"
                      value={editingTopicTitle}
                      onChange={(e) => setEditingTopicTitle(e.target.value)}
                      placeholder="Nama tag..."
                      className="text-xs text-slate-800 font-medium bg-transparent focus:outline-none w-28 py-0.5"
                      autoFocus
                    />
                    <button
                      type="submit"
                      title="Simpan nama tag"
                      className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTopicId(null)}
                      title="Batal"
                      className="p-1 hover:bg-slate-100 text-slate-400 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={t.id}
                  className={`inline-flex items-center rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 border-slate-200 hover:bg-slate-200/90 text-slate-700'
                  }`}
                >
                  {/* Left reorder (<) button in Admin Mode */}
                  {isAdminMode && idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderTag(t.id, 'up');
                      }}
                      title="Susun ke kiri (<)"
                      className={`p-1 pl-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'text-blue-200 hover:text-white'
                          : 'text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}

                  {/* Main Tag Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTopicFilter(isSelected ? null : t.id);
                    }}
                    className="px-2.5 py-1.5 font-medium whitespace-nowrap cursor-pointer flex items-center gap-1"
                  >
                    <span>{t.title}</span>
                  </button>

                  {/* Admin inline controls: Edit (pencil), Delete (trash), Reorder Right (>) */}
                  {isAdminMode && (
                    <div className="flex items-center pr-1 gap-0.5 border-l border-black/10 ml-0.5">
                      {/* Edit Tag Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTopicId(t.id);
                          setEditingTopicTitle(t.title);
                        }}
                        title={`Edit / Tukar nama tag "${t.title}"`}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'hover:bg-blue-700 text-blue-100 hover:text-white'
                            : 'hover:bg-slate-300 text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Delete Tag Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(t.id, t.title);
                        }}
                        title={`Padam tag "${t.title}"`}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'hover:bg-red-600 text-blue-100 hover:text-white'
                            : 'hover:bg-red-100 text-slate-400 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Right reorder (>) button */}
                      {idx < topics.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderTag(t.id, 'down');
                          }}
                          title="Susun ke kanan (>)"
                          className={`p-1 pr-1.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-blue-200 hover:text-white'
                              : 'text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* + Tambah Tag Button in Admin Mode */}
            {isAdminMode && (
              <>
                {isAddingTag ? (
                  <form
                    onSubmit={handleAddNewTag}
                    className="inline-flex items-center gap-1.5 bg-white border-2 border-blue-600 rounded-lg px-2.5 py-1 shadow-sm"
                  >
                    <input
                      type="text"
                      value={newTagTitle}
                      onChange={(e) => setNewTagTitle(e.target.value)}
                      placeholder="Nama tag baru..."
                      className="text-xs text-slate-800 font-medium bg-transparent focus:outline-none w-32"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newTagTitle.trim()}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      + Tambah
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTag(false);
                        setNewTagTitle('');
                      }}
                      className="p-1 hover:bg-slate-100 text-slate-400 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Tambah butang / tag topik baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Tag</span>
                  </button>
                )}
              </>
            )}

            {/* Action buttons: Muat Naik Poster (Admin) */}
            {isAdminMode && !showHeader && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Muat Naik Poster</span>
                </button>
              </div>
            )}
          </div>

          {/* Admin Tag Management Helper Info */}
          {isAdminMode && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-blue-50/60 border border-blue-100 rounded-md px-2.5 py-1">
              <Tag className="w-3 h-3 text-blue-600 shrink-0" />
              <span>
                <strong>Panduan Admin Tag:</strong> Klik <Edit2 className="w-2.5 h-2.5 inline text-blue-600 mx-0.5" /> untuk edit nama, <Trash2 className="w-2.5 h-2.5 inline text-red-500 mx-0.5" /> untuk padam, <ChevronLeft className="w-2.5 h-2.5 inline mx-0.5" /><ChevronRight className="w-2.5 h-2.5 inline mx-0.5" /> untuk susun butang ke kiri/kanan, atau klik <strong>+ Tambah Tag</strong> untuk tag baru.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {displayed.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Infographics Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No visual posters match "${searchQuery}".`
              : 'No infographics published for the active filter.'}
          </p>
        </div>
      )}

      {/* Original Infographic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.map((item, index) => {
          const associatedTopic = topics.find((t) => t.id === item.topicId);
          const associatedEvent = events.find((e) => e.id === item.eventId);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Image Viewport with Scrim & Zoom action */}
                <div
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setActiveLightbox(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-xs font-medium text-white flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Resolution</span>
                    </span>
                  </div>

                  {/* Admin Reorder Controls Overlay (< and >) */}
                  {isAdminMode && (
                    <div
                      className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-900/85 backdrop-blur-xs p-1 rounded-lg border border-slate-700 shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderInfographic(item.id, 'left');
                        }}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Susun ke Kiri (<)"
                      >
                        &lt;
                      </button>
                      <span className="text-[10px] font-bold text-blue-300 px-1.5">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderInfographic(item.id, 'right');
                        }}
                        disabled={index === displayed.length - 1}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Susun ke Kanan (>)"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    {associatedTopic && (
                      <span className="text-blue-600 font-semibold">{associatedTopic.title}</span>
                    )}
                    {associatedEvent && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-indigo-600 font-medium">{associatedEvent.title}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    <InlineEdit
                      value={item.title}
                      onSave={(val) => updateInfographic(item.id, { title: val })}
                      as="span"
                    />
                  </h3>

                  <div className="text-xs text-slate-600 leading-relaxed">
                    <InlineEdit
                      value={item.description}
                      onSave={(val) => updateInfographic(item.id, { description: val })}
                      multiline
                      as="p"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveLightbox(item)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Enlarge</span>
                </button>

                {isAdminMode && (
                  <div className="flex items-center gap-1.5">
                    {/* Reorder Buttons < and > */}
                    <div className="flex items-center gap-0.5 bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
                      <button
                        type="button"
                        onClick={() => reorderInfographic(item.id, 'left')}
                        disabled={index === 0}
                        className="h-6 w-6 flex items-center justify-center text-xs font-black text-slate-800 bg-white hover:bg-blue-600 hover:text-white rounded shadow-2xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Susun kad ke kiri (<)"
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderInfographic(item.id, 'right')}
                        disabled={index === displayed.length - 1}
                        className="h-6 w-6 flex items-center justify-center text-xs font-black text-slate-800 bg-white hover:bg-blue-600 hover:text-white rounded shadow-2xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Susun kad ke kanan (>)"
                      >
                        &gt;
                      </button>
                    </div>

                    <span className="text-slate-300">|</span>

                    <button
                      onClick={() =>
                        updateInfographic(item.id, {
                          status: item.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                      title={item.status === 'published' ? 'Hide item' : 'Publish item'}
                    >
                      {item.status === 'published' ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Padam infografik "${item.title}"?`)) {
                          deleteInfographic(item.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                      title="Padam infografik"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="truncate pr-4">
                <h3 className="text-sm font-semibold truncate">{activeLightbox.title}</h3>
                <p className="text-xs text-slate-400 truncate">{activeLightbox.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeLightbox.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={activeLightbox.title}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={handleShare}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-6 flex items-center justify-center bg-black/40">
              <img
                src={activeLightbox.imageUrl}
                alt={activeLightbox.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Infographic Modal (Batch Support & Link Support) */}
      {isAdminMode && isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isUploadingBatch && setIsUploadModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Muat Naik Infografik & Poster Kontinjen
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih fail imej dari peranti atau masukkan pautan imej luaran
                </p>
              </div>
              <button
                onClick={() => !isUploadingBatch && setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Fail Peranti / Pautan URL */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  uploadMode === 'file'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <FileImage className="w-4 h-4" />
                <span>Pilih Fail Imej</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  uploadMode === 'url'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Pautkan URL Imej</span>
              </button>
            </div>

            {/* Hidden multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Drop / Trigger Area for Files */}
            {uploadMode === 'file' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-blue-50/30 hover:bg-blue-50/60"
              >
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Ketik atau klik untuk pilih fail poster
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Menyokong JPG, PNG, WEBP dengan pengoptimuman automatik
                </p>
              </div>
            )}

            {/* Direct Image URL Form */}
            {uploadMode === 'url' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pautan Imej (URL) *
                  </label>
                  <input
                    type="url"
                    value={directUrlInput}
                    onChange={(e) => setDirectUrlInput(e.target.value)}
                    placeholder="https://example.com/peta-venue.png"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tajuk Poster *
                  </label>
                  <input
                    type="text"
                    value={directTitleInput}
                    onChange={(e) => setDirectTitleInput(e.target.value)}
                    placeholder="Contoh: Peta Kampus & Lokasi Dewan Utama"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penerangan Ringkas
                  </label>
                  <input
                    type="text"
                    value={directDescInput}
                    onChange={(e) => setDirectDescInput(e.target.value)}
                    placeholder="Panduan kedudukan dewan dan laluan kontinjen..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  disabled={!directUrlInput.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  + Tambah ke Senarai Muat Naik
                </button>
              </div>
            )}

            {/* Selected Batch Items */}
            {pendingUploads.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {pendingUploads.length} Fail Disediakan Untuk Muat Naik
                  </span>
                  {uploadMode === 'file' && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      + Tambah Lagi Fail
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {pendingUploads.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />

                        <div className="flex-1 space-y-2 min-w-0">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updatePendingUpload(idx, { title: e.target.value })}
                            placeholder="Tajuk Poster *"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900 font-medium"
                          />

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updatePendingUpload(idx, { description: e.target.value })
                            }
                            placeholder="Penerangan / Panduan"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={item.topicId}
                              onChange={(e) => updatePendingUpload(idx, { topicId: e.target.value })}
                              className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md text-slate-800"
                            >
                              <option value="">Tiada Topik</option>
                              {topics.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.title}
                                </option>
                              ))}
                            </select>

                            <select
                              value={item.eventId}
                              onChange={(e) => updatePendingUpload(idx, { eventId: e.target.value })}
                              className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md text-slate-800"
                            >
                              <option value="">Tiada Pautan Acara</option>
                              {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                  {ev.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {!isUploadingBatch && (
                          <button
                            type="button"
                            onClick={() => removePendingUpload(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {item.status === 'uploading' && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 transition-all duration-200"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Memproses fail... {item.progress}%
                          </span>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Berjaya Dimuat Naik & Diterbitkan</span>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <div className="text-[11px] text-rose-600 font-medium">
                          {item.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploadingBatch}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartBatchUpload}
                disabled={isUploadingBatch || pendingUploads.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isUploadingBatch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Memuat Naik...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Muat Naik & Terbitkan ({pendingUploads.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
