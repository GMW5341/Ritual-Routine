'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { HabitStore, QuickMemo } from '@/lib/types';

const POS_KEY = 'ritual-routine-memo-pos';
const OPEN_KEY = 'ritual-routine-memo-open';

interface Props {
  store: HabitStore;
  onAdd: (date: string, text: string) => void;
  onRemove: (date: string, memoId: string) => void;
}

export default function FloatingMemo({ store, onAdd, onRemove }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const [draft, setDraft] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

  const record = store.records.find((r) => r.date === todayStr);
  const memos: QuickMemo[] = (record?.quickMemos ?? []).slice().sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );

  // Load saved state
  useEffect(() => {
    try {
      const savedPos = localStorage.getItem(POS_KEY);
      if (savedPos) {
        const p = JSON.parse(savedPos);
        // Clamp to current viewport
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 320, p.x)),
          y: Math.max(0, Math.min(window.innerHeight - 100, p.y)),
        });
      } else {
        setPos({ x: window.innerWidth - 340, y: window.innerHeight - 420 });
      }
    } catch {
      setPos({ x: window.innerWidth - 340, y: window.innerHeight - 420 });
    }
    const savedOpen = localStorage.getItem(OPEN_KEY);
    if (savedOpen === 'true') setIsOpen(true);
    setInitialized(true);
  }, []);

  // Save position
  useEffect(() => {
    if (initialized) localStorage.setItem(POS_KEY, JSON.stringify(pos));
  }, [pos, initialized]);

  // Save open state
  useEffect(() => {
    if (initialized) localStorage.setItem(OPEN_KEY, String(isOpen));
  }, [isOpen, initialized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && initialized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialized]);

  // Clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth - 320, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, prev.y)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = {
      isDragging: true,
      offsetX: e.clientX - pos.x,
      offsetY: e.clientY - pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragRef.current.offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragRef.current.offsetY)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.isDragging = false;
  }, []);

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(todayStr, trimmed);
    setDraft('');
    inputRef.current?.focus();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!initialized) return null;

  return (
    <>
      {/* FAB - shown when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-amber-500/90 hover:bg-amber-500 text-white rounded-full shadow-lg shadow-amber-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {memos.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {memos.length}
            </span>
          )}
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div
          className="fixed z-50 w-80"
          style={{ left: pos.x, top: pos.y }}
        >
          <div className="bg-[#1e2330]/95 backdrop-blur-xl border border-amber-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Drag Handle */}
            <div
              className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/15 cursor-grab active:cursor-grabbing select-none touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-white/25" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="4" cy="4" r="1.5" /><circle cx="4" cy="8" r="1.5" /><circle cx="4" cy="12" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" /><circle cx="10" cy="8" r="1.5" /><circle cx="10" cy="12" r="1.5" />
                </svg>
                <span className="text-xs font-medium text-amber-300/80">메모</span>
                {memos.length > 0 && (
                  <span className="text-[10px] text-white/40">{memos.length}</span>
                )}
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/40 hover:text-white/80 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="떠오르는 생각을 적어보세요..."
                  className="flex-1 bg-[#272c38]/60 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
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
              {memos.length > 0 ? (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto scrollbar-thin">
                  {memos.map((memo) => (
                    <div
                      key={memo.id}
                      className="group flex items-start gap-2 bg-[#272c38]/40 rounded-lg px-3 py-2 border border-[#313744]/30"
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
                            onClick={() => { onRemove(todayStr, memo.id); setDeletingId(null); }}
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
              ) : (
                <p className="text-[11px] text-white/30 text-center py-4">
                  메모가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
