'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ritual-routine-principles';

const DEFAULT_PRINCIPLES = [
  '체력은 정신력. 정신력은 의사결정. 의사결정은 내 삶.',
  '지속가능한 삶을 위한 원칙.',
];

export default function PinnedPrinciples() {
  const [principles, setPrinciples] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setPrinciples(JSON.parse(raw));
    } else {
      setPrinciples(DEFAULT_PRINCIPLES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRINCIPLES));
    }
    setLoaded(true);
  }, []);

  const save = (updated: string[]) => {
    setPrinciples(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setDraft(principles[idx]);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null || !draft.trim()) return;
    const updated = [...principles];
    updated[editingIdx] = draft.trim();
    save(updated);
    setEditingIdx(null);
    setDraft('');
  };

  const handleDelete = (idx: number) => {
    save(principles.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    if (!newDraft.trim()) return;
    save([...principles, newDraft.trim()]);
    setNewDraft('');
    setAdding(false);
  };

  if (!loaded) return null;

  return (
    <div className="relative">
      {/* Header with pin icon */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="relative">
          <svg className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-xs font-bold text-white/55 uppercase tracking-[0.15em]">MY PRINCIPLES</span>
      </div>

      <div className="space-y-2.5">
        {principles.map((p, i) => (
          <div key={i} className="group relative">
            {editingIdx === i ? (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-white/[0.06] border border-emerald-500/30 rounded-lg px-3 py-2.5 text-sm text-white/80 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                    if (e.key === 'Escape') setEditingIdx(null);
                  }}
                />
                <div className="flex gap-1.5">
                  <button onClick={handleSaveEdit} className="px-2.5 py-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/30 transition-colors">
                    저장
                  </button>
                  <button onClick={() => setEditingIdx(null)} className="px-2.5 py-1 text-[10px] text-white/40 rounded-md hover:bg-white/5 transition-colors">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.04] via-[#272c38]/30 to-[#313744]/20 p-3.5 hover:border-emerald-500/20 transition-all">
                {/* Decorative pin line */}
                <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-emerald-500/50 via-emerald-400/20 to-transparent" />
                <p className="text-[13px] text-white/65 leading-relaxed pl-2 pr-7 font-light">{p}</p>
                {/* Edit/delete on hover */}
                <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                  <button
                    onClick={() => handleEdit(i)}
                    className="p-1 text-white/30 hover:text-emerald-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={newDraft}
            onChange={(e) => setNewDraft(e.target.value)}
            placeholder="새로운 원칙을 적어주세요..."
            className="w-full bg-[#272c38]/40 border border-emerald-500/15 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder-white/30 resize-none focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
              if (e.key === 'Escape') { setAdding(false); setNewDraft(''); }
            }}
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleAdd}
              disabled={!newDraft.trim()}
              className="px-2.5 py-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-500/30 transition-colors disabled:opacity-30"
            >
              추가
            </button>
            <button
              onClick={() => { setAdding(false); setNewDraft(''); }}
              className="px-2.5 py-1 text-[10px] text-white/40 rounded-md hover:bg-white/5 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 w-full py-2.5 border border-dashed border-emerald-500/15 rounded-lg text-[11px] text-white/35 hover:text-emerald-400/60 hover:border-emerald-500/30 transition-all"
        >
          + 원칙 추가
        </button>
      )}

      {/* Decorative bottom element */}
      <div className="mt-6 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
          <span className="text-[9px] text-emerald-400/30 tracking-[0.2em]">RITUAL</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />
        </div>
      </div>
    </div>
  );
}
