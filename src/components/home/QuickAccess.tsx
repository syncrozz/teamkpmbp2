import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Bus,
  FileText,
  ChevronRight,
} from 'lucide-react';

export const QuickAccess: React.FC = () => {
  const { setActiveTab, announcements, events, infographics, schedules } = useApp();

  const cards = [
    {
      id: 'announcements',
      title: 'Announcements',
      desc: 'Urgent notices, memos & roll calls',
      count: announcements.filter((a) => a.status === 'published').length,
      icon: Bell,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'events',
      title: 'Featured Events',
      desc: 'Duo, Teater, Zapin, Band & Dakwah',
      count: events.filter((e) => e.status === 'published').length,
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'infographics',
      title: 'Posters & Maps',
      desc: 'Venue maps, grids & guidelines',
      count: infographics.filter((i) => i.status === 'published').length,
      icon: ImageIcon,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'schedule',
      title: 'Chronological Timeline',
      desc: 'Day-to-day slots & stage rehearsals',
      count: schedules.filter((s) => s.status === 'published').length,
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'travel',
      title: 'Travel & Accommodation',
      desc: 'Bus departure, hostels & key contacts',
      count: 'Hostel C/D',
      icon: Bus,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      id: 'documents',
      title: 'Documents & Downloads',
      desc: 'SOAR handbook, forms & riders',
      count: 'Official',
      icon: FileText,
      color: 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Quick Access Portal
        </h2>
        <span className="text-xs text-slate-500">Tap to jump directly</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => {
                setActiveTab(card.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {card.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                {typeof card.count === 'number' ? `${card.count} items` : card.count}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
