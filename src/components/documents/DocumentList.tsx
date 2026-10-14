import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentItem } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FileSpreadsheet,
  X,
  AlertCircle,
} from 'lucide-react';

export const DocumentList: React.FC = () => {
  const {
    documents,
    updateDocument,
    addDocument,
    deleteDocument,
    events,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'pdf' | 'doc' | 'sheet' | 'link'>('pdf');
  const [newSize, setNewSize] = useState('1.5 MB');
  const [newEventId, setNewEventId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addDocument({
      title: newTitle.trim(),
      description: newDesc.trim(),
      fileUrl: newUrl.trim() || '#',
      fileType: newType,
      fileSize: newSize.trim(),
      associatedEventId: newEventId || undefined,
      status: 'published',
    });

    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setIsAdding(false);
  };

  const filtered = documents.filter((item) => {
    if (!isAdminMode && item.status !== 'published') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Official Documents, Handbook & Forms
          </h2>
          <p className="text-xs text-slate-500">
            SOAR IPMA 2026 rulebooks, student indemnity consent forms and delegation manifests
          </p>
        </div>

        {isAdminMode && (
          <button
            onClick={() => setIsAdding(true)}
            className="min-h-[36px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document Record</span>
          </button>
        )}
      </div>

      {/* Add Document Form */}
      {isAdminMode && isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900">Add Official Document</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Competition Score Sheet & Rubric"
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Short Description
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="Purpose, target audience or filing notes..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                File / Link URL
              </label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://drive.google.com/... or file path"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'pdf' | 'doc' | 'sheet' | 'link')}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                <option value="pdf">PDF Document</option>
                <option value="sheet">Spreadsheet / Excel</option>
                <option value="doc">Word / Text Document</option>
                <option value="link">External Google Drive Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                File Size / Format
              </label>
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g. 2.4 MB"
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
              Save Document
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Documents Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? `No files match "${searchQuery}".` : 'No documents available yet.'}
          </p>
        </div>
      )}

      {/* Document Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-start justify-between gap-3 transition-all shadow-xs"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0 mt-0.5">
                {getDocIcon(item.fileType)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="uppercase font-semibold text-slate-700">{item.fileType}</span>
                  {item.fileSize && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>{item.fileSize}</span>
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

                <h3 className="text-sm font-bold text-slate-900">
                  <InlineEdit
                    value={item.title}
                    onSave={(val) => updateDocument(item.id, { title: val })}
                    as="span"
                  />
                </h3>

                <div className="text-xs text-slate-600">
                  <InlineEdit
                    value={item.description}
                    onSave={(val) => updateDocument(item.id, { description: val })}
                    multiline
                    as="p"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0 pt-0.5">
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (item.fileUrl === '#') {
                    e.preventDefault();
                    alert(`Official file "${item.title}" will be accessible once finalized by secretariat.`);
                  }
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                title="Download or open document"
              >
                {item.fileType === 'link' ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </a>

              {isAdminMode && (
                <>
                  <button
                    onClick={() =>
                      updateDocument(item.id, {
                        status: item.status === 'published' ? 'draft' : 'published',
                      })
                    }
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                    title={item.status === 'published' ? 'Hide document' : 'Publish document'}
                  >
                    {item.status === 'published' ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete document record "${item.title}"?`)) {
                        deleteDocument(item.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
