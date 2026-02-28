'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { HabitStore, QuickMemo } from '@/lib/types';

interface Props {
  store: HabitStore;
  onAdd: (date: string, text: string) => void;
  onRemove: (date: string, memoId: string) => void;
}

export default function MemoWidget({ store, onAdd, onRemove }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [draft, setDraft] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const record = store.records.find((r) => r.date === todayStr);
  const memos: QuickMemo[] = (record?.quickMemos ?? []).slice().sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(todayStr, trimmed);
    setDraft('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (memoId: string) => {
    onRemove(todayStr, memoId);
    setDeletingId(null);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <span className="text-xs text-white/70 font-medium">메모</span>
        {memos.length > 0 && (
          <span className="text-[10px] text-white/40">{memos.length}</span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="떠오르는 생각을 적어보세요..."
          className="flex-1 bg-[#272c38]/50 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
        />
        <button
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:bg-white/5 disabled:text-white/25 text-amber-400 rounded-lg transition-colors text-sm font-medium shrink-0"
        >
          +
        </button>
      </div>

      {/* Memo list */}
      {memos.length > 0 && (
        <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="group flex items-start gap-2 bg-[#272c38]/30 rounded-lg px-3 py-2 border border-[#313744]/30"
            >
              <span className="text-[10px] text-white/35 mt-0.5 shrink-0 tabular-nums">
                {formatTime(memo.createdAt)}
              </span>
              <p className="flex-1 text-xs text-white/65 leading-relaxed break-words min-w-0">
                {memo.text}
              </p>
              {deletingId === memo.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleRemove(memo.id)}
                    className="text-[10px] text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="text-[10px] text-white/50 hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(memo.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-all shrink-0 mt-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
