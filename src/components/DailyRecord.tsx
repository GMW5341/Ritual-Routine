'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';

interface Props {
  store: HabitStore;
  onSave: (date: string, memo: string) => void;
  onDelete: (date: string) => void;
}

export default function DailyRecord({ store, onSave, onDelete }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const record = store.records.find((r) => r.date === selectedDate);
  const savedMemo = record?.memo ?? '';

  const dailyHabits = store.habits.filter((h) => h.frequency === 'daily');
  const completedHabits = store.habits.filter((h) => record?.completions[h.id] === true);

  // Sync draft when date changes
  useEffect(() => {
    setDraft(savedMemo);
    setEditing(false);
    setConfirmDelete(false);
  }, [selectedDate, savedMemo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [draft, editing]);

  const navigateDate = (dir: -1 | 1) => {
    const d = new Date(selectedDate + 'T00:00:00');
    const next = dir === 1 ? addDays(d, 1) : subDays(d, 1);
    setSelectedDate(format(next, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(selectedDate, trimmed);
    }
    setEditing(false);
  };

  const handleDelete = () => {
    onDelete(selectedDate);
    setDraft('');
    setConfirmDelete(false);
    setEditing(false);
  };

  // Recent entries with memos
  const recentEntries = useMemo(() => {
    return store.records
      .filter((r) => !!r.memo)
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

      {/* Diary Writing Area */}
      <div className="bg-[#272c38]/30 border border-[#313744]/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium text-white/80">일일 기록</span>
          </div>
          {savedMemo && !editing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="px-2.5 py-1 text-xs text-white/45 hover:text-white/90 hover:bg-white/[0.06] rounded-md transition-colors"
              >
                수정
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1 text-xs text-white/60 hover:bg-white/5 rounded-md transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-2.5 py-1 text-xs text-white/60 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          )}
        </div>

        {editing || !savedMemo ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setDraft(savedMemo);
                  setEditing(false);
                }
              }}
              placeholder="오늘 하루를 기록해보세요. 느낀 점, 배운 것, 감사한 일..."
              rows={6}
              className="w-full bg-[#1e2330]/60 border border-[#313744]/60 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 resize-none leading-relaxed"
              autoFocus={editing}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30">Esc로 취소</span>
              <div className="flex items-center gap-2">
                {editing && (
                  <button
                    onClick={() => {
                      setDraft(savedMemo);
                      setEditing(false);
                    }}
                    className="px-3 py-1.5 text-xs text-white/60 hover:text-white/90 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!draft.trim() || draft.trim() === savedMemo}
                  className="px-5 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/40 text-white rounded-lg transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-white/[0.02] rounded-lg p-3 -m-3 transition-colors min-h-[80px]"
            onClick={() => setEditing(true)}
          >
            {savedMemo}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium">최근 기록</h3>
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const entryDate = new Date(entry.date + 'T00:00:00');
              const isSelected = entry.date === selectedDate;
              const entryCompletedCount = store.habits.filter(
                (h) => entry.completions[h.id] === true
              ).length;

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
                      {entryCompletedCount > 0 && (
                        <span className="text-[10px] text-white/40">
                          {entryCompletedCount}/{store.habits.length}
                        </span>
                      )}
                      {entry.date === todayStr && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">오늘</span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? 'text-white/75' : 'text-white/55'}`}>
                    {entry.memo}
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
