import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { InlineEdit } from '../common/InlineEdit';
import {
  Bus,
  Home,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

export const TravelAccommodation: React.FC = () => {
  const { travelInfo, updateTravelInfo } = useApp();
  const { isAdminMode } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Logistics, Travel & Accommodation
        </h2>
        <p className="text-xs text-slate-500">
          Convoy departure points, bus allocations, hostel check-in and emergency contacts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departure & Convoy Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Convoy Transport & Departure
              </h3>
              <p className="text-[11px] text-slate-500">Official chartered coach logistics</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Muster & Assembly Point
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                <InlineEdit
                  value={travelInfo.meetingPoint}
                  onSave={(val) => updateTravelInfo({ meetingPoint: val })}
                  as="div"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Departure Time
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                <InlineEdit
                  value={travelInfo.departureTime}
                  onSave={(val) => updateTravelInfo({ departureTime: val })}
                  as="div"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Coach Details & Escort
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                <InlineEdit
                  value={travelInfo.transportationDetails}
                  onSave={(val) => updateTravelInfo({ transportationDetails: val })}
                  multiline
                  as="div"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accommodation & Hostels Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hostel & Rooming Guidance
              </h3>
              <p className="text-[11px] text-slate-500">Residential colleges, check-in & keys</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Hostel Complex & Blocks
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                <InlineEdit
                  value={travelInfo.accommodationVenue}
                  onSave={(val) => updateTravelInfo({ accommodationVenue: val })}
                  as="div"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Check-in & Key Distribution
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                <InlineEdit
                  value={travelInfo.checkInInstructions}
                  onSave={(val) => updateTravelInfo({ checkInInstructions: val })}
                  multiline
                  as="div"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Rooming Assignments Policy
              </span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                <InlineEdit
                  value={travelInfo.roomAssignmentsNotice}
                  onSave={(val) => updateTravelInfo({ roomAssignmentsNotice: val })}
                  multiline
                  as="div"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Contingent Officers & Emergency Helplines
            </h3>
            <p className="text-xs text-slate-500">
              Immediate contact for contingent welfare, health and security matters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {travelInfo.emergencyContacts.map((contact, idx) => {
            const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;

            return (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                    {contact.role}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {contact.name}
                  </h4>
                  <p className="text-xs font-mono font-medium text-slate-600 mt-1">
                    {contact.phone}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-medium text-slate-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    <PhoneCall className="w-3 h-3 text-slate-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
