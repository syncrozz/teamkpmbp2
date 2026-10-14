import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ScheduleItem } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ScheduleList: React.FC = () => {
  const {
    schedules,
    updateSchedule,
    addSchedule,
    deleteSchedule,
    events,
    settings,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('14 Oct 2026');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:30 AM');
  const [newVenue, setNewVenue] = useState('Main Auditorium');
  const [newDesc, setNewDesc] = useState('');
  const [newEventId, setNewEventId] = useState('');

  // Collect distinct dates
  const dates = ['all', ...Array.from(new Set(schedules.map((s) => s.date)))];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addSchedule({
      title: newTitle.trim(),
      date: newDate.trim(),
      startTime: newStartTime.trim(),
      endTime: newEndTime.trim(),
      venue: newVenue.trim(),
      description: newDesc.trim(),
      associatedEventId: newEventId || undefined,
      status: 'published',
      phase: settings.activePhase,
    });

    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const filtered = schedules.filter((item) => {
    if (!isAdminMode && item.status !== 'published') return false;
    if (selectedDateFilter !== 'all' && item.date !== selectedDateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Contingent Master Schedule & Itinerary
          </h2>
          <p className="text-xs text-slate-500">
            Chronological timetable, sound checks, ceremony calls and competition slots
          </p>
        </div>

        {isAdminMode && (
          <button
            onClick={() => setIsAdding(true)}
            className="min-h-[36px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Schedule Slot</span>
          </button>
        )}
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDateFilter(d)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedDateFilter === d
                ? 'bg-slate-900 text-white font-medium shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {d === 'all' ? 'All Dates' : d}
          </button>
        ))}
      </div>

      {/* Add Schedule Form */}
      {isAdminMode && isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900">Add Schedule Slot</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Activity / Slot Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Band Rehearsal & Line Check"
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Link Event (Optional)
              </label>
              <select
                value={newEventId}
                onChange={(e) => setNewEventId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                <option value="">No linked event</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="e.g. 14 Oct 2026"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="e.g. Auditorium 1"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notes / Instructions
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Bring instrument leads and mic pack"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Add Slot
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Schedule Entries</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No activities match "${searchQuery}".`
              : 'No activities listed for this date filter.'}
          </p>
        </div>
      )}

      {/* Timeline Rows */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const associatedEvent = events.find((e) => e.id === item.associatedEventId);

          return (
            <div
              key={item.id}
              className={`p-4 bg-white border rounded-xl transition-all shadow-xs ${
                item.isUpdated ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Time Badge (Tabular Numerals) */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shrink-0 min-w-[90px]">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                      {item.date}
                    </span>
                    <span className="block text-xs font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {item.startTime}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      {item.isUpdated && (
                        <span className="flex items-center gap-1 text-amber-700 font-semibold text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Time Changed</span>
                        </span>
                      )}
                      {associatedEvent && (
                        <span className="text-blue-600 font-medium">
                          {associatedEvent.title}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      <InlineEdit
                        value={item.title}
                        onSave={(val) => updateSchedule(item.id, { title: val })}
                        as="span"
                      />
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <InlineEdit
                          value={`${item.startTime} – ${item.endTime}`}
                          onSave={(val) => {
                            const parts = val.split('–').map((p) => p.trim());
                            updateSchedule(item.id, {
                              startTime: parts[0] || item.startTime,
                              endTime: parts[1] || item.endTime,
                            });
                          }}
                          className="font-mono tabular-nums"
                          as="span"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <InlineEdit
                          value={item.venue}
                          onSave={(val) => updateSchedule(item.id, { venue: val })}
                          as="span"
                        />
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        <InlineEdit
                          value={item.description}
                          onSave={(val) => updateSchedule(item.id, { description: val })}
                          multiline
                          as="span"
                        />
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Controls */}
                {isAdminMode && (
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() =>
                        updateSchedule(item.id, { isUpdated: !item.isUpdated })
                      }
                      className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                        item.isUpdated
                          ? 'text-amber-700 bg-amber-100'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Toggle 'Time Changed' indicator"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        updateSchedule(item.id, {
                          status: item.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
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
                        if (window.confirm(`Delete schedule item "${item.title}"?`)) {
                          deleteSchedule(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                      title="Delete schedule item"
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
    </div>
  );
};
