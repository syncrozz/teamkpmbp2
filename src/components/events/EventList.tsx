import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { EventItem } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Sparkles,
  MapPin,
  Clock,
  User,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
} from 'lucide-react';

export const EventList: React.FC = () => {
  const {
    events,
    updateEvent,
    addEvent,
    deleteEvent,
    announcements,
    infographics,
    searchQuery,
    setActiveTab,
    setSelectedEventFilter,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // New Event form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Music & Instrument');
  const [newDesc, setNewDesc] = useState('');
  const [newGuidelines, setNewGuidelines] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newLeader, setNewLeader] = useState('');

  // Collect unique categories for filter tabs
  const categories = ['all', ...Array.from(new Set(events.map((e) => e.category)))];

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addEvent({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      guidelines: newGuidelines.trim(),
      venue: newVenue.trim() || 'TBA',
      scheduleTime: newScheduleTime.trim() || 'TBA',
      contingentLeader: newLeader.trim() || 'KPMBP Team Lead',
      status: 'published',
      featured: true,
      displayOrder: events.length + 1,
    });

    setNewTitle('');
    setNewDesc('');
    setNewGuidelines('');
    setNewVenue('');
    setNewScheduleTime('');
    setNewLeader('');
    setIsAddingEvent(false);
  };

  const filtered = events.filter((item) => {
    if (!isAdminMode && item.status !== 'published') return false;
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            KPMBP Competition Events & Categories
          </h2>
          <p className="text-xs text-slate-500">
            Rules, allocated venues, sound check slots and stage guidelines
          </p>
        </div>

        {isAdminMode && (
          <button
            onClick={() => setIsAddingEvent(true)}
            className="min-h-[36px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event Category</span>
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategoryFilter === cat
                ? 'bg-slate-900 text-white font-medium shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Add Event Form (Admin Mode) */}
      {isAdminMode && isAddingEvent && (
        <form
          onSubmit={handleCreateEvent}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900">Add New Event Entry</span>
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Nasyid / Islamic Choir"
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Vocal Performance"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="Synopsis, artistic vision or format..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Competition Guidelines & Time Limits
            </label>
            <textarea
              value={newGuidelines}
              onChange={(e) => setNewGuidelines(e.target.value)}
              rows={2}
              placeholder="Duration limits, prop rules, instrument specifications..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="e.g. Auditorium 2"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Schedule Time Slot
              </label>
              <input
                type="text"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                placeholder="e.g. Day 2 · 02:00 PM"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contingent Leader / Captain
              </label>
              <input
                type="text"
                value={newLeader}
                onChange={(e) => setNewLeader(e.target.value)}
                placeholder="e.g. Amira Syazwani"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Save Event Entry
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Events Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No competition events match "${searchQuery}".`
              : 'No events found in this category.'}
          </p>
        </div>
      )}

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isExpanded = expandedEventId === item.id;
          const relatedAnn = announcements.filter((a) => a.associatedEventId === item.id);
          const relatedInfo = infographics.filter((i) => i.eventId === item.id);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-xs"
            >
              <div>
                {/* Header & Category */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-blue-600">{item.category}</span>
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

                  {isAdminMode && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateEvent(item.id, {
                            status: item.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                        title={item.status === 'published' ? 'Hide event' : 'Publish event'}
                      >
                        {item.status === 'published' ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete event entry "${item.title}"?`)) {
                            deleteEvent(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title (Inline Editable) */}
                <h3 className="text-base font-bold text-slate-900">
                  <InlineEdit
                    value={item.title}
                    onSave={(val) => updateEvent(item.id, { title: val })}
                    as="span"
                  />
                </h3>

                {/* Description (Inline Editable) */}
                <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  <InlineEdit
                    value={item.description}
                    onSave={(val) => updateEvent(item.id, { description: val })}
                    multiline
                    as="p"
                  />
                </div>

                {/* Meta Strip: Venue & Time */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Venue:</span>
                    <InlineEdit
                      value={item.venue}
                      onSave={(val) => updateEvent(item.id, { venue: val })}
                      className="font-medium text-slate-800"
                      as="span"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Slot:</span>
                    <InlineEdit
                      value={item.scheduleTime}
                      onSave={(val) => updateEvent(item.id, { scheduleTime: val })}
                      className="font-medium text-slate-800"
                      as="span"
                    />
                  </div>

                  {item.contingentLeader && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500">Lead:</span>
                      <InlineEdit
                        value={item.contingentLeader}
                        onSave={(val) => updateEvent(item.id, { contingentLeader: val })}
                        className="font-medium text-slate-800"
                        as="span"
                      />
                    </div>
                  )}
                </div>

                {/* Expandable Guidelines */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Competition Rules & Guidelines
                      </h4>
                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <InlineEdit
                          value={item.guidelines}
                          onSave={(val) => updateEvent(item.id, { guidelines: val })}
                          multiline
                          as="div"
                        />
                      </div>
                    </div>

                    {/* Related Notices & Infographics */}
                    {(relatedAnn.length > 0 || relatedInfo.length > 0) && (
                      <div className="pt-2">
                        <p className="text-[11px] font-semibold text-slate-700 mb-1">
                          Linked Contingent Resources:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {relatedAnn.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setActiveTab('announcements')}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{a.title}</span>
                            </button>
                          ))}
                          {relatedInfo.map((inf) => (
                            <button
                              key={inf.id}
                              onClick={() => {
                                setSelectedEventFilter(item.id);
                                setActiveTab('infographics');
                              }}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[10px] font-medium flex items-center gap-1"
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{inf.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Expand Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setExpandedEventId(isExpanded ? null : item.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Hide rules & guidelines' : 'View competition guidelines'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
