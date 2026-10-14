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
import { SectionLinkButton } from '../common/SectionLinkButton';

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

  // Months map for parsing dates like "13 Okt 2026" or "14 Oct 2026"
  const MONTHS_MAP: Record<string, number> = {
    jan: 1, feb: 2, mac: 3, mar: 3, apr: 4, mei: 5, may: 5, jun: 6,
    jul: 7, ogos: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dis: 12, dec: 12,
  };

  const parseDateToComparable = (dateStr: string): number => {
    if (!dateStr) return 0;
    const parts = dateStr.trim().toLowerCase().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10) || 1;
      const monthKey = parts[1].slice(0, 3);
      const month = MONTHS_MAP[monthKey] || 1;
      const year = parseInt(parts[2], 10) || 2026;
      return new Date(year, month - 1, day).getTime();
    }
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toLowerCase();

    const isPM = clean.includes('pm') || clean.includes('ptg') || clean.includes('petang') || clean.includes('malam');
    const isAM = clean.includes('am') || clean.includes('pagi');

    const match = clean.match(/(\d{1,2})[:.](\d{2})/) || clean.match(/(\d{1,2})/);
    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  const TIME_OPTIONS = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:15 AM', '07:30 AM', '07:45 AM',
    '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM',
    '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
    '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
    '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM',
    '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM',
    '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM',
    '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
    '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM',
    '09:00 PM', '09:15 PM', '09:30 PM', '09:45 PM',
    '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  ];

  const DEFAULT_EVENT_DATES = [
    '13 Okt 2026',
    '14 Okt 2026',
    '15 Okt 2026',
    '16 Okt 2026',
    '17 Okt 2026',
  ];

  const time24To12 = (time24: string): string => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  };

  const time12To24 = (time12: string): string => {
    if (!time12) return '09:00';
    const clean = time12.trim().toLowerCase();
    const isPM = clean.includes('pm') || clean.includes('ptg') || clean.includes('petang') || clean.includes('malam');
    const isAM = clean.includes('am') || clean.includes('pagi');
    const match = clean.match(/(\d{1,2})[:.](\d{2})/);
    if (!match) return '09:00';
    let h = parseInt(match[1], 10);
    const m = match[2];
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const dateIsoToMalay = (isoStr: string): string => {
    if (!isoStr) return '';
    const [year, month, day] = isoStr.split('-').map(Number);
    const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];
    const mName = monthNames[(month || 10) - 1] || 'Okt';
    return `${day} ${mName} ${year}`;
  };

  const dateMalayToIso = (dateStr: string): string => {
    if (!dateStr) return '2026-10-14';
    const months: Record<string, string> = {
      jan: '01', feb: '02', mac: '03', mar: '03', apr: '04', mei: '05', may: '05',
      jun: '06', jul: '07', ogos: '08', aug: '08', sep: '09', okt: '10', oct: '10',
      nov: '11', dis: '12', dec: '12',
    };
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0');
      const mKey = parts[1].toLowerCase().slice(0, 3);
      const m = months[mKey] || '10';
      const year = parts[2];
      return `${year}-${m}-${day}`;
    }
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      const d = new Date(timestamp);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return '2026-10-14';
  };

  // Collect distinct dates sorted chronologically for filter tabs and dropdown
  const rawDates = Array.from(new Set(schedules.map((s) => s.date).filter(Boolean)));
  rawDates.sort((a, b) => parseDateToComparable(a) - parseDateToComparable(b));
  const dates = ['all', ...rawDates];

  const eventDatesList = Array.from(
    new Set([
      ...DEFAULT_EVENT_DATES,
      ...rawDates,
    ])
  );
  eventDatesList.sort((a, b) => parseDateToComparable(a) - parseDateToComparable(b));

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

  // Sort schedule slots strictly by chronological time:
  // 1st is the earliest (paling awal), and last at the bottom is the latest (paling lewat) on that day
  const sortedSchedules = [...filtered].sort((a, b) => {
    // 1. If viewing all dates, order by date first
    if (selectedDateFilter === 'all') {
      const dateA = parseDateToComparable(a.date);
      const dateB = parseDateToComparable(b.date);
      if (dateA !== dateB) {
        return dateA - dateB;
      }
    }

    // 2. Sort by startTime: earliest (paling awal) to latest (paling lewat)
    const timeA = parseTimeToMinutes(a.startTime);
    const timeB = parseTimeToMinutes(b.startTime);
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. Secondary sort by endTime
    const endA = parseTimeToMinutes(a.endTime);
    const endB = parseTimeToMinutes(b.endTime);
    if (endA !== endB) {
      return endA - endB;
    }

    // 4. Stable sort by title
    return a.title.localeCompare(b.title);
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SectionLinkButton slug="jadual" />

          {isAdminMode && (
            <button
              onClick={() => setIsAdding(true)}
              className="min-h-[34px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Schedule Slot</span>
            </button>
          )}
        </div>
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
            {/* Column 1: Tarikh dari Kalendar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tarikh (Date)</span>
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">{newDate}</span>
              </label>
              <input
                type="date"
                value={dateMalayToIso(newDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    setNewDate(dateIsoToMalay(e.target.value));
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer"
                title="Pilih tarikh dari kalendar"
              />
            </div>

            {/* Column 2: Masa Mula dari Senarai Drop Down */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Masa Mula (Start)</span>
                </span>
                <span className="text-[10px] text-blue-600 font-mono font-semibold">{newStartTime}</span>
              </label>
              <select
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer font-mono"
                title="Pilih masa mula daripada senarai drop down"
              >
                {!TIME_OPTIONS.includes(newStartTime) && (
                  <option value={newStartTime}>{newStartTime}</option>
                )}
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 3: Masa Tamat dari Senarai Drop Down */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masa Tamat (End)</span>
                </span>
                <span className="text-[10px] text-blue-600 font-mono font-semibold">{newEndTime}</span>
              </label>
              <select
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer font-mono"
                title="Pilih masa tamat daripada senarai drop down"
              >
                {!TIME_OPTIONS.includes(newEndTime) && (
                  <option value={newEndTime}>{newEndTime}</option>
                )}
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
      {sortedSchedules.length === 0 && (
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
        {sortedSchedules.map((item) => {
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
