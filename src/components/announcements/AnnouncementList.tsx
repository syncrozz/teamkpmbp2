import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Pin,
  Calendar,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const AnnouncementList: React.FC<{ limit?: number; showHeader?: boolean }> = ({
  limit,
  showHeader = true,
}) => {
  const {
    announcements,
    updateAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    addAnnouncement,
    events,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newEventId, setNewEventId] = useState('');
  const [newIsPinned, setNewIsPinned] = useState(false);

  // Filter announcements
  const filtered = announcements.filter((a) => {
    // Only published for public users; admin mode sees all
    if (!isAdminMode && a.status !== 'published') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSummary = a.summary.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      const matchCat = a.category.toLowerCase().includes(q);
      return matchTitle || matchSummary || matchContent || matchCat;
    }
    return true;
  });

  // Sort: pinned first, then newest
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const displayed = limit ? sorted.slice(0, limit) : sorted;

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    await addAnnouncement({
      title: newTitle.trim(),
      summary: newSummary.trim(),
      content: newContent.trim() || newSummary.trim(),
      category: newCategory,
      associatedEventId: newEventId || undefined,
      isPinned: newIsPinned,
      status: 'published',
    });

    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewEventId('');
    setNewIsPinned(false);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Announcements & Notices
            </h2>
            <p className="text-xs text-slate-500">
              Official memos, schedule revisions and technical updates
            </p>
          </div>

          {isAdminMode && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="min-h-[36px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Announcement</span>
            </button>
          )}
        </div>
      )}

      {/* Add New Announcement Form (Admin Mode) */}
      {isAdminMode && isAddingNew && (
        <form
          onSubmit={handleCreateAnnouncement}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900">
              Publish New Contingent Announcement
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Stage Rehearsal Call for Symphonic Duo"
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                <option value="Urgent Notice">Urgent Notice</option>
                <option value="Schedule">Schedule Rehearsal</option>
                <option value="Welfare">Welfare & Meals</option>
                <option value="Logistics">Logistics & Convoy</option>
                <option value="General">General Briefing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Link to Event (Optional)
              </label>
              <select
                value={newEventId}
                onChange={(e) => setNewEventId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                <option value="">No specific event</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Summary (Short preview for card) *
            </label>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              rows={2}
              required
              placeholder="A brief 1-2 sentence overview visible on the card."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Detailed Content
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              placeholder="Full details, instructions, room allocations, rules..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinCheck"
              checked={newIsPinned}
              onChange={(e) => setNewIsPinned(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="pinCheck" className="text-xs text-slate-700 cursor-pointer">
              Pin to top of list
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {displayed.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Announcements Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No announcements match "${searchQuery}". Try a different keyword.`
              : 'There are currently no published announcements for this phase.'}
          </p>
        </div>
      )}

      {/* Cards List */}
      <div className="space-y-3">
        {displayed.map((item) => {
          const associatedEvent = events.find((e) => e.id === item.associatedEventId);
          const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className={`p-4 bg-white border rounded-xl transition-all ${
                item.isPinned
                  ? 'border-blue-200 bg-blue-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Clean unboxed metadata with dot separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                    {item.isPinned && (
                      <span className="flex items-center gap-1 text-blue-700 font-semibold text-[11px]">
                        <Pin className="w-3 h-3 fill-blue-700 text-blue-700" />
                        <span>Pinned</span>
                      </span>
                    )}
                    {item.isPinned && <span aria-hidden="true" className="text-slate-300">·</span>}
                    <span className="font-medium text-slate-700">{item.category}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{formattedDate}</span>
                    {associatedEvent && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-blue-600 font-medium truncate max-w-[140px]">
                          {associatedEvent.title}
                        </span>
                      </>
                    )}
                    {isAdminMode && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span
                          className={`text-[10px] uppercase font-bold ${
                            item.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title (Inline Editable in Admin Mode) */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    <InlineEdit
                      value={item.title}
                      onSave={(val) => updateAnnouncement(item.id, { title: val })}
                      as="span"
                    />
                  </h3>

                  {/* Summary (Inline Editable in Admin Mode) */}
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                    <InlineEdit
                      value={item.summary}
                      onSave={(val) => updateAnnouncement(item.id, { summary: val })}
                      multiline
                      as="p"
                    />
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdminMode && (
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      onClick={() => togglePinAnnouncement(item.id)}
                      className={`min-h-[32px] min-w-[32px] p-1.5 rounded-lg transition-colors ${
                        item.isPinned
                          ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={item.isPinned ? 'Unpin announcement' : 'Pin announcement to top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        updateAnnouncement(item.id, {
                          status: item.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className="min-h-[32px] min-w-[32px] p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title={item.status === 'published' ? 'Unpublish (make draft)' : 'Publish announcement'}
                    >
                      {item.status === 'published' ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete announcement "${item.title}"?`)) {
                          deleteAnnouncement(item.id);
                        }
                      }}
                      className="min-h-[32px] min-w-[32px] p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Read Full Details Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAnnouncement(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>Read full notice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {item.imageUrl && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Includes infographic</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedAnnouncement(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600">
                  {selectedAnnouncement.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Published on{' '}
                {new Date(selectedAnnouncement.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {selectedAnnouncement.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full object-cover max-h-64"
                />
              </div>
            )}

            <div className="prose prose-sm text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-xl transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
