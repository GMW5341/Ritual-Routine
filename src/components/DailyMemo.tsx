'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';

interface Props {
  store: HabitStore;
  date: string; // YYYY-MM-DD
  onSave: (date: string, memo: string) => void;
  onDelete: (date: string) => void;
}

export default function DailyMemo({ store, date, onSave, onDelete }: Props) {
  const record = store.records.find((r) => r.date === date);
  const savedMemo = record?.memo ?? '';

  const [draft, setDraft] = useState(savedMemo);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft when date or savedMemo changes
  useEffect(() => {
    setDraft(savedMemo);
    setEditing(false);
    setConfirmDelete(false);
  }, [date, savedMemo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [draft, editing]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(date, trimmed);
    }
    setEditing(false);
  };

  const handleDelete = () => {
    onDelete(date);
    setDraft('');
    setConfirmDelete(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDraft(savedMemo);
      setEditing(false);
    }
  };

  const dateObj = new Date(date + 'T00:00:00');
  const dateLabel = format(dateObj, 'M월 d일 (E)', { locale: ko });

  const hasMemo = !!savedMemo;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs text-white/40">{dateLabel} 메모</span>
        </div>
        {hasMemo && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded-md transition-colors"
            >
              수정
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  확인
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-[10px] text-white/40 hover:bg-white/5 rounded-md transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-2 py-1 text-[10px] text-white/40 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {editing || !hasMemo ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="오늘의 생각, 느낀 점, 기록하고 싶은 것..."
            rows={3}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 resize-none leading-relaxed"
            autoFocus={editing}
          />
          <div className="flex items-center justify-end gap-2">
            {editing && (
              <button
                onClick={() => {
                  setDraft(savedMemo);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
              >
                취소
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!draft.trim() || draft.trim() === savedMemo}
              className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <div
          className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-white/70 transition-colors"
          onClick={() => setEditing(true)}
        >
          {savedMemo}
        </div>
      )}
    </div>
  );
}
