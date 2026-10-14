import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { EventPhase } from '../../types';
import { Layers, Check } from 'lucide-react';

export const PhaseSwitcher: React.FC = () => {
  const { settings, setActivePhase } = useApp();
  const { isAdminMode } = useAuth();

  const phases: { id: EventPhase; label: string; desc: string }[] = [
    {
      id: 'PRE-FINAL',
      label: 'Pre-Final',
      desc: 'Preparation, briefings, checklists & convoy travel',
    },
    {
      id: 'FINAL / DURING EVENT',
      label: 'Final / Live Event',
      desc: 'Live stage schedules, mic checks, halls & live notices',
    },
    {
      id: 'POST-EVENT',
      label: 'Post-Event',
      desc: 'Results, awards gala, return logistics & archives',
    },
  ];

  if (!isAdminMode) {
    // Public visitor view: unobtrusive text badge
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
        <span className="font-medium text-slate-700">Active Phase:</span>
        <span className="text-blue-700 font-semibold">{settings.activePhase}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 my-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Event Phase Control (Admin Mode)</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Active: <strong className="text-blue-600">{settings.activePhase}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {phases.map((phase) => {
          const isActive = settings.activePhase === phase.id;
          return (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`p-2.5 text-left rounded-lg border transition-all ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{phase.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <p
                className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isActive ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {phase.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
