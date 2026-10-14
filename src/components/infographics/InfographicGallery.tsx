import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Infographic } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  X,
  Tag,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Download,
  Share2,
} from 'lucide-react';
import { storage, isFirebaseConfigured } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface PendingUpload {
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  topicId: string;
  eventId: string;
  tags: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export const InfographicGallery: React.FC = () => {
  const {
    infographics,
    addInfographic,
    updateInfographic,
    deleteInfographic,
    topics,
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        description: 'Contingent guide and visual briefing pack.',
        topicId: topics[0]?.id || '',
        eventId: '',
        tags: 'SOAR2026, Contingent',
        progress: 0,
        status: 'pending',
      };
    });

    setPendingUploads((prev) => [...prev, ...newPending]);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
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
    updatePendingUpload(index, { status: 'uploading', progress: 10 });

    try {
      let finalImageUrl = item.previewUrl;

      // Check if real Firebase Storage is configured
      if (isFirebaseConfigured && storage) {
        const storagePath = `infographics/${Date.now()}_${item.file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, item.file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const p = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              updatePendingUpload(index, { progress: p });
            },
            (error) => reject(error),
            async () => {
              finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } else {
        // Preview mode: convert file to persistent Data URL for local storage
        finalImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(item.file);
        });
        updatePendingUpload(index, { progress: 100 });
      }

      const tagsArray = item.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await addInfographic({
        title: item.title,
        description: item.description,
        imageUrl: finalImageUrl,
        topicId: item.topicId || undefined,
        eventId: item.eventId || undefined,
        tags: tagsArray,
        status: 'published',
        displayOrder: infographics.length + 1,
        sizeBytes: item.file.size,
      });

      updatePendingUpload(index, { status: 'completed', progress: 100 });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      updatePendingUpload(index, {
        status: 'error',
        errorMessage: e.message || 'Upload failed. Tap to retry.',
      });
      return false;
    }
  };

  const handleStartBatchUpload = async () => {
    setIsUploadingBatch(true);
    for (let i = 0; i < pendingUploads.length; i++) {
      if (pendingUploads[i].status !== 'completed') {
        await uploadSingleItem(pendingUploads[i], i);
      }
    }
    setIsUploadingBatch(false);

    // If all completed, close modal
    const allDone = pendingUploads.every((p) => p.status === 'completed');
    if (allDone) {
      setTimeout(() => {
        setPendingUploads([]);
        setIsUploadModalOpen(false);
      }, 600);
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

  return (
    <div className="space-y-5">
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
            className="min-h-[36px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Infographic</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => {
            setSelectedTopicFilter(null);
            setSelectedEventFilter(null);
          }}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            !selectedTopicFilter && !selectedEventFilter
              ? 'bg-slate-900 text-white font-medium shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          All Infographics
        </button>

        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedEventFilter(null);
              setSelectedTopicFilter(selectedTopicFilter === t.id ? null : t.id);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedTopicFilter === t.id
                ? 'bg-blue-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.title}
          </button>
        ))}

        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => {
              setSelectedTopicFilter(null);
              setSelectedEventFilter(selectedEventFilter === e.id ? null : e.id);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedEventFilter === e.id
                ? 'bg-indigo-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {e.title}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
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

      {/* Infographic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => {
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
                      // Resilient fallback
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
                    {isAdminMode && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span
                          className={`uppercase font-bold text-[10px] ${
                            item.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.status}
                        </span>
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

                  {/* Clean unboxed tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-slate-600">
                          #{tag}
                          {tIdx < item.tags.length - 1 && <span className="ml-1 text-slate-300">·</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveLightbox(item)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Enlarge</span>
                </button>

                {isAdminMode && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateInfographic(item.id, {
                          status: item.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
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
                        if (window.confirm(`Delete infographic "${item.title}"?`)) {
                          deleteInfographic(item.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      title="Delete infographic"
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
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Portal link copied to clipboard!');
                  }}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
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

      {/* Upload Infographic Modal (Batch Support) */}
      {isAdminMode && isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !isUploadingBatch && setIsUploadModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Contingent Posters & Infographics
                </h3>
                <p className="text-xs text-slate-500">
                  Select one or multiple images from your phone or computer
                </p>
              </div>
              <button
                onClick={() => !isUploadingBatch && setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
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

            {/* Drop / Trigger Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
            >
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Tap or click to browse files
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports JPG, PNG, WEBP, PDF infographics up to 15MB each
              </p>
            </div>

            {/* Selected Batch Items */}
            {pendingUploads.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {pendingUploads.length} File(s) Staged for Upload
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + Add More Files
                  </button>
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
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                        />

                        <div className="flex-1 space-y-2 min-w-0">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updatePendingUpload(idx, { title: e.target.value })}
                            placeholder="Poster Title *"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900 font-medium"
                          />

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updatePendingUpload(idx, { description: e.target.value })
                            }
                            placeholder="Description / Guide"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-900"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={item.topicId}
                              onChange={(e) => updatePendingUpload(idx, { topicId: e.target.value })}
                              className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-md text-slate-800"
                            >
                              <option value="">No Topic</option>
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
                              <option value="">No Event Link</option>
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
                            onClick={() => removePendingUpload(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
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
                          <span className="text-[10px] text-blue-600 font-semibold">
                            Uploading... {item.progress}%
                          </span>
                        </div>
                      )}

                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Uploaded & Persisted</span>
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
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartBatchUpload}
                disabled={isUploadingBatch || pendingUploads.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                {isUploadingBatch ? 'Uploading Files...' : `Upload & Publish (${pendingUploads.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
