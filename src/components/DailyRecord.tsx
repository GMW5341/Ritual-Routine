'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore, QuickMemo } from '@/lib/types';

interface Props {
  store: HabitStore;
  onAdd: (date: string, text: string) => void;
  onUpdate: (date: string, memoId: string, text: string) => void;
  onRemove: (date: string, memoId: string) => void;
}

export default function DailyRecord({ store, onAdd, onUpdate, onRemove }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const record = store.records.find((r) => r.date === selectedDate);
  const memos: QuickMemo[] = useMemo(
    () => (record?.quickMemos ?? []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [record?.quickMemos]
  );
  const completedHabits = store.habits.filter((h) => record?.completions[h.id] === true);

  // Reset edit state on date change
  useEffect(() => {
    setEditingId(null);
    setDeletingId(null);
  }, [selectedDate]);

  // Auto-resize textareas
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [draft]);

  useEffect(() => {
    if (editRef.current) {
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  }, [editDraft]);

  const navigateDate = (dir: -1 | 1) => {
    const d = new Date(selectedDate + 'T00:00:00');
    const next = dir === 1 ? addDays(d, 1) : subDays(d, 1);
    setSelectedDate(format(next, 'yyyy-MM-dd'));
  };

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(selectedDate, trimmed);
    setDraft('');
  };

  const startEdit = (memo: QuickMemo) => {
    setEditingId(memo.id);
    setEditDraft(memo.text);
    setDeletingId(null);
  };

  const handleUpdate = (memoId: string) => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    onUpdate(selectedDate, memoId, trimmed);
    setEditingId(null);
    setEditDraft('');
  };

  const handleRemove = (memoId: string) => {
    onRemove(selectedDate, memoId);
    setDeletingId(null);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Recent dates that have quickMemos
  const recentDates = useMemo(() => {
    return store.records
      .filter((r) => (r.quickMemos?.length ?? 0) > 0)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
  }, [store.records]);

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === todayStr;
  const isFuture = selectedDate > todayStr;

  return (
    <div className="space-y-8">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 text-white/55 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white/90">
            {format(dateObj, 'M월 d일 EEEE', { locale: ko })}
          </h2>
          <p className="text-xs text-white/45 mt-0.5">
            {isToday ? '오늘' : format(dateObj, 'yyyy년', { locale: ko })}
          </p>
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="p-2 text-white/55 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Today button */}
      {!isToday && (
        <div className="flex justify-center">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition-colors"
          >
            오늘로 이동
          </button>
        </div>
      )}

      {/* Habit completion summary */}
      {store.habits.length > 0 && !isFuture && (
        <div className="bg-[#272c38]/30 border border-[#313744]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/50 uppercase tracking-wider">이 날의 습관</span>
            <span className="text-xs text-white/60">
              {completedHabits.length}/{store.habits.length} 완료
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {store.habits.map((habit) => {
              const done = record?.completions[habit.id] === true;
              return (
                <div
                  key={habit.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    done
                      ? 'bg-emerald-500/15 text-emerald-300/80 ring-1 ring-emerald-500/20'
                      : 'bg-[#272c38]/60 text-white/40'
                  }`}
                >
                  <span className="text-sm">{habit.emoji}</span>
                  <span>{habit.name}</span>
                  {done && (
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Entry Input */}
      <div className="bg-[#272c38]/30 border border-[#313744]/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            <span className="text-sm font-medium text-white/80">기록 남기기</span>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="지금 이 순간의 생각을 기록하세요..."
          rows={3}
          className="w-full bg-[#1e2330]/60 border border-[#313744]/60 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">Ctrl+Enter로 저장</span>
          <button
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="px-5 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/40 text-white rounded-lg transition-colors"
          >
            기록
          </button>
        </div>
      </div>

      {/* Timeline */}
      {memos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium">
            {format(dateObj, 'M월 d일', { locale: ko })}의 타임라인
          </h3>
          <div className="relative pl-7">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-emerald-500/15" />

            <div className="space-y-4">
              {memos.map((memo) => (
                <div key={memo.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-7 top-1 w-[15px] flex justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 ring-2 ring-[#1e2330]" />
                  </div>

                  <div className="bg-[#272c38]/25 border border-[#313744]/30 rounded-lg p-3 hover:border-[#313744]/50 transition-colors">
                    {/* Time + Actions */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-emerald-400/60 tabular-nums font-medium">
                        {formatTime(memo.createdAt)}
                      </span>
                      {editingId !== memo.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(memo)}
                            className="text-[10px] text-white/40 hover:text-white/80 px-1.5 py-0.5 rounded transition-colors"
                          >
                            수정
                          </button>
                          {deletingId === memo.id ? (
                            <>
                              <button
                                onClick={() => handleRemove(memo.id)}
                                className="text-[10px] text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition-colors"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-[10px] text-white/50 hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors"
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeletingId(memo.id)}
                              className="text-[10px] text-white/40 hover:text-red-400 px-1.5 py-0.5 rounded transition-colors"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    {editingId === memo.id ? (
                      <div className="space-y-2">
                        <textarea
                          ref={editRef}
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault();
                              handleUpdate(memo.id);
                            }
                            if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          rows={2}
                          className="w-full bg-[#1e2330]/60 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 resize-none leading-relaxed"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[10px] text-white/60 hover:text-white/90 hover:bg-white/5 rounded-md transition-colors"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleUpdate(memo.id)}
                            disabled={!editDraft.trim() || editDraft.trim() === memo.text}
                            className="px-3 py-1 text-[10px] font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/40 text-white rounded-md transition-colors"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {memo.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {memos.length === 0 && (
        <p className="text-center text-xs text-white/30 py-4">
          이 날의 기록이 없습니다. 위에서 첫 기록을 남겨보세요.
        </p>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />

      {/* Recent Dates */}
      {recentDates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium">기록이 있는 날</h3>
          <div className="space-y-2">
            {recentDates.map((entry) => {
              const entryDate = new Date(entry.date + 'T00:00:00');
              const isSelected = entry.date === selectedDate;
              const count = entry.quickMemos?.length ?? 0;
              const preview = entry.quickMemos
                ?.slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.text ?? '';

              return (
                <button
                  key={entry.date}
                  onClick={() => setSelectedDate(entry.date)}
                  className={`w-full text-left rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-[#272c38]/30 border border-[#313744]/40 hover:bg-[#272c38]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${isSelected ? 'text-emerald-400' : 'text-white/65'}`}>
                      {format(entryDate, 'M월 d일 (E)', { locale: ko })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40">{count}개</span>
                      {entry.date === todayStr && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">오늘</span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-1 ${isSelected ? 'text-white/75' : 'text-white/55'}`}>
                    {preview}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
