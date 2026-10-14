import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  required?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  placeholder?: string;
  onlyIcon?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  multiline = false,
  className = '',
  inputClassName = '',
  label,
  required = true,
  as: Component = 'span',
  placeholder = 'Click to edit...',
  onlyIcon = false,
}) => {
  const { isAdminMode } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Sync draft if external value changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
      setError(null);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraft(value);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setDraft(value);
    setError(null);
    setIsEditing(false);
  };

  const handleCommit = async () => {
    const trimmed = draft.trim();
    if (required && !trimmed) {
      setError('Field cannot be empty');
      return;
    }

    if (trimmed === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to save changes. Please retry.');
      // Keep draft text intact for user retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCommit();
    }
  };

  // If not admin mode or not editing, render standard element with optional pencil
  if (!isAdminMode) {
    if (onlyIcon) return null;
    return <Component className={className}>{value || placeholder}</Component>;
  }

  if (isEditing) {
    return (
      <div
        className="inline-flex flex-col w-full my-1 relative z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {label && (
          <span className="text-[11px] font-medium text-slate-500 mb-1">
            {label}
          </span>
        )}
        <div className="flex items-start gap-1.5 w-full">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              rows={3}
              className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y transition-all ${inputClassName}`}
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className={`w-full px-2.5 py-1 text-sm text-slate-900 bg-white border border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${inputClassName}`}
              placeholder={placeholder}
            />
          )}

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleCommit}
              disabled={isSaving}
              title="Save (Enter)"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              title="Cancel (Esc)"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>
        )}
      </div>
    );
  }

  if (onlyIcon) {
    return (
      <button
        type="button"
        onClick={handleStartEdit}
        title={label ? `Ubah ${label}` : 'Ubah teks'}
        className={`opacity-75 hover:opacity-100 min-h-[28px] min-w-[28px] p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all shrink-0 inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    );
  }

  if (Component === 'span') {
    return (
      <span className={`inline-flex items-center gap-1.5 group relative ${className}`}>
        <span>{value || placeholder}</span>
        <button
          type="button"
          onClick={handleStartEdit}
          title="Edit inline"
          className="opacity-75 group-hover:opacity-100 min-h-[32px] min-w-[32px] p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all shrink-0 inline-flex items-center justify-center"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  return (
    <Component className={`inline-flex items-center gap-1.5 group relative ${className}`}>
      <span>{value || placeholder}</span>
      <button
        type="button"
        onClick={handleStartEdit}
        title="Edit inline"
        className="opacity-75 group-hover:opacity-100 min-h-[32px] min-w-[32px] p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all shrink-0 inline-flex items-center justify-center"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </Component>
  );
};
