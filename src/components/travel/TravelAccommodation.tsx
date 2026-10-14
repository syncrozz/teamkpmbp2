import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { InlineEdit } from '../common/InlineEdit';
import {
  Bus,
  Home,
  PhoneCall,
  MessageCircle,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { SectionLinkButton } from '../common/SectionLinkButton';

export const TravelAccommodation: React.FC = () => {
  const { travelInfo, updateTravelInfo } = useApp();
  const { isAdminMode } = useAuth();

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', phone: '' });
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [editingContact, setEditingContact] = useState({ name: '', role: '', phone: '' });
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const contactsList = travelInfo.emergencyContacts || [];

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim()) return;
    setIsSaving(true);
    try {
      const updated = [
        ...contactsList,
        {
          name: newContact.name.trim(),
          role: newContact.role.trim(),
          phone: newContact.phone.trim(),
        },
      ];
      await updateTravelInfo({ emergencyContacts: updated });
      setNewContact({ name: '', role: '', phone: '' });
      setIsAddingContact(false);
    } catch (err) {
      console.error('Failed to add contact:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (idx: number) => {
    const contact = contactsList[idx];
    if (!contact) return;
    setEditingContactIndex(idx);
    setEditingContact({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
    });
    setDeleteConfirmIndex(null);
    setIsAddingContact(false);
  };

  const handleSaveEdit = async (idx: number) => {
    if (!editingContact.name.trim() || !editingContact.role.trim() || !editingContact.phone.trim()) return;
    setIsSaving(true);
    try {
      const updated = [...contactsList];
      updated[idx] = {
        name: editingContact.name.trim(),
        role: editingContact.role.trim(),
        phone: editingContact.phone.trim(),
      };
      await updateTravelInfo({ emergencyContacts: updated });
      setEditingContactIndex(null);
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (idx: number) => {
    setIsSaving(true);
    try {
      const updated = contactsList.filter((_, i) => i !== idx);
      await updateTravelInfo({ emergencyContacts: updated });
      setDeleteConfirmIndex(null);
      if (editingContactIndex === idx) {
        setEditingContactIndex(null);
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveContact = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= contactsList.length) return;
    setIsSaving(true);
    try {
      const updated = [...contactsList];
      const item = updated.splice(fromIdx, 1)[0];
      updated.splice(toIdx, 0, item);
      await updateTravelInfo({ emergencyContacts: updated });
    } catch (err) {
      console.error('Failed to reorder contacts:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Logistics, Travel & Accommodation
          </h2>
          <p className="text-xs text-slate-500">
            Convoy departure points, bus allocations, hostel check-in and emergency contacts
          </p>
        </div>

        <SectionLinkButton slug="penginapan" />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Contingent Officers & Emergency Helplines
              </h3>
              {isAdminMode && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-md border border-amber-200">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Mod Admin</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Immediate contact for contingent welfare, health and security matters
            </p>
          </div>

          {isAdminMode && (
            <button
              type="button"
              onClick={() => {
                setIsAddingContact(true);
                setNewContact({ name: '', role: '', phone: '' });
                setEditingContactIndex(null);
                setDeleteConfirmIndex(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pegawai / Helpline</span>
            </button>
          )}
        </div>

        {/* Add Contact Form (Admin Mode) */}
        {isAdminMode && isAddingContact && (
          <div className="mb-4 p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/80">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                Tambah Pegawai / Talian Kecemasan Baharu
              </span>
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Peranan / Jawatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: Pegawai Kebajikan & Kesihatan"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Penuh Pegawai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: Cikgu Hazim"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  No. Telefon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: +60 12-345 6789"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-200/50">
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddContact}
                disabled={!newContact.name.trim() || !newContact.role.trim() || !newContact.phone.trim() || isSaving}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pegawai'}</span>
              </button>
            </div>
          </div>
        )}

        {contactsList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 mb-2">Tiada pegawai atau talian kecemasan disenaraikan buat masa ini.</p>
            {isAdminMode && (
              <button
                type="button"
                onClick={() => {
                  setIsAddingContact(true);
                  setNewContact({ name: '', role: '', phone: '' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pegawai Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {contactsList.map((contact, idx) => {
              const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;
              const isEditing = editingContactIndex === idx;
              const isDeleting = deleteConfirmIndex === idx;

              if (isEditing) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-blue-50/60 border-2 border-blue-400 rounded-xl flex flex-col justify-between space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                        Edit Pegawai #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingContactIndex(null)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Peranan / Jawatan
                        </label>
                        <input
                          type="text"
                          value={editingContact.role}
                          onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Nama Penuh
                        </label>
                        <input
                          type="text"
                          value={editingContact.name}
                          onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          No. Telefon
                        </label>
                        <input
                          type="text"
                          value={editingContact.phone}
                          onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-blue-200">
                      <button
                        type="button"
                        onClick={() => setEditingContactIndex(null)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        disabled={!editingContact.name.trim() || !editingContact.role.trim() || !editingContact.phone.trim() || isSaving}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-xs inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>{isSaving ? 'Simpan...' : 'Simpan'}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex flex-col justify-between space-y-3 transition-colors relative group"
                >
                  {/* Top Bar for Admin Controls */}
                  {isAdminMode && (
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                      <span className="text-[10px] font-medium text-slate-400">
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Reorder buttons */}
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveContact(idx, idx - 1)}
                            title="Pindah ke kiri / atas"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3 rotate-[-45deg] sm:rotate-0" />
                          </button>
                        )}
                        {idx < contactsList.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveContact(idx, idx + 1)}
                            title="Pindah ke kanan / bawah"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3 rotate-[-45deg] sm:rotate-0" />
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx)}
                          title="Edit maklumat pegawai"
                          className="px-1.5 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(idx)}
                          title="Padam pegawai ini"
                          className="px-1.5 py-0.5 text-[10px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Padam</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Confirmation Box */}
                  {isDeleting && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Padam pegawai ini?</span>
                      </div>
                      <p className="text-[10px] text-rose-600">
                        Tindakan ini akan memadam rekod &quot;{contact.name}&quot; dari portal.
                      </p>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(null)}
                          className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 rounded"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(idx)}
                          disabled={isSaving}
                          className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs"
                        >
                          {isSaving ? 'Memadam...' : 'Ya, Padam'}
                        </button>
                      </div>
                    </div>
                  )}

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
        )}
      </div>
    </div>
  );
};

