import React, { useState, useMemo } from 'react';
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
    updateSettings,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('14 Okt 2026');
  const [newStartTime, setNewStartTime] = useState('08:30 AM');
  const [newEndTime, setNewEndTime] = useState('10:00 AM');
  const [newVenue, setNewVenue] = useState('Stadium Utama SOAR IPMA');
  const [newDesc, setNewDesc] = useState('');
  const [newEventId, setNewEventId] = useState('');

  // Months map for parsing dates like "13 Okt 2026" or "14 Oct 2026"
  const MONTHS_MAP: Record<string, number> = {
    jan: 1, feb: 2, mac: 3, mar: 3, apr: 4, mei: 5, may: 5, jun: 6,
    jul: 7, ogos: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dis: 12, dec: 12,
  };

  const parseDateToComparable = (dateStr: string): number => {
    if (!dateStr) return 0;
    const clean = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
    }
    const parts = clean.toLowerCase().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10) || 1;
      const monthKey = parts[1].slice(0, 3);
      const month = MONTHS_MAP[monthKey] || 1;
      const year = parseInt(parts[2], 10) || 2026;
      return new Date(year, month - 1, day).getTime();
    }
    const timestamp = Date.parse(clean);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    // If range like "08:00 AM – 10:00 AM" was stored, take starting time
    const firstPart = timeStr.split(/[-–—]/)[0] || timeStr;
    const clean = firstPart.trim().toLowerCase();

    const isPM =
      clean.includes('pm') ||
      clean.includes('ptg') ||
      clean.includes('petang') ||
      clean.includes('malam') ||
      clean.includes('tgh') ||
      clean.includes('tengahari');
    const isAM = clean.includes('am') || clean.includes('pagi') || clean.includes('subuh');

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

  // Generate standardized, deduplicated 15-minute time slots from 06:00 AM to 11:30 PM
  const TIME_OPTIONS: string[] = useMemo(() => {
    const list: string[] = [];
    for (let h = 6; h <= 23; h++) {
      for (const m of ['00', '15', '30', '45']) {
        if (h === 23 && m === '45') continue;
        const ampm = h >= 12 ? 'PM' : 'AM';
        let displayH = h % 12;
        if (displayH === 0) displayH = 12;
        const formatted = `${String(displayH).padStart(2, '0')}:${m} ${ampm}`;
        if (!list.includes(formatted)) {
          list.push(formatted);
        }
      }
    }
    return list;
  }, []);

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

  // Deduplicate schedules by id to prevent any double item rendering
  const deduplicatedSchedules = useMemo(() => {
    const map = new Map<string, ScheduleItem>();
    for (const item of schedules) {
      if (item && item.id) {
        map.set(item.id, item);
      }
    }
    return Array.from(map.values());
  }, [schedules]);

  // Collect distinct dates sorted chronologically for filter tabs
  const rawDates = Array.from(new Set(deduplicatedSchedules.map((s) => s.date).filter(Boolean)));
  rawDates.sort((a, b) => parseDateToComparable(a) - parseDateToComparable(b));
  const dates = ['all', ...rawDates];

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

  const filtered = deduplicatedSchedules.filter((item) => {
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
  // 1st (paling atas) is the earliest (paling awal), and last (di senarai bawah) is the latest (paling lewat) on that day
  const sortedSchedules = [...filtered].sort((a, b) => {
    // 1. If viewing all dates, order by calendar date first
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

    // 3. Secondary sort by endTime: earliest ending to latest ending
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
      {/* Header section with admin inline editable title and subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            <InlineEdit
              value={settings.sectionTitles?.scheduleTitle || 'Contingent Master Schedule & Itinerary'}
              onSave={(val) =>
                updateSettings({
                  sectionTitles: {
                    ...settings.sectionTitles,
                    scheduleTitle: val,
                  },
                })
              }
              as="span"
            />
          </h2>
          <div className="text-xs text-slate-500">
            <InlineEdit
              value={
                settings.sectionTitles?.scheduleSubtitle ||
                'Chronological timetable, sound checks, ceremony calls and competition slots'
              }
              onSave={(val) =>
                updateSettings({
                  sectionTitles: {
                    ...settings.sectionTitles,
                    scheduleSubtitle: val,
                  },
                })
              }
              as="p"
            />
          </div>
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
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
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
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer"
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

          {/* Form row with single clean display for each date and time field */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Column 1: Tarikh dari Kalendar (Calendar Picker) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tarikh (Date) *</span>
              </label>
              <input
                type="date"
                value={dateMalayToIso(newDate)}
                onChange={(e) => {
                  if (e.target.value) {
                    setNewDate(dateIsoToMalay(e.target.value));
                  }
                }}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer"
                title="Pilih tarikh daripada kalendar"
              />
            </div>

            {/* Column 2: Masa Mula dari Senarai Drop Down (Dropdown Time Picker) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Masa Mula (Start) *</span>
              </label>
              <select
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                required
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

            {/* Column 3: Masa Tamat dari Senarai Drop Down (Dropdown Time Picker) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Masa Tamat (End) *</span>
              </label>
              <select
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                required
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
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
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

      {/* Timeline Rows sorted strictly by time: earliest 1st at the top, latest last at the bottom */}
      <div className="space-y-3">
        {sortedSchedules.map((item, index) => {
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
                  {/* Time Badge with Chronological Slot Indicator */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shrink-0 min-w-[95px]">
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                      {item.date}
                    </span>
                    <span className="block text-xs font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                      {item.startTime}
                    </span>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded">
                      Slot #{index + 1}
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
                            const parts = val.split(/[-–—]/).map((p) => p.trim());
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
                      className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
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
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
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
