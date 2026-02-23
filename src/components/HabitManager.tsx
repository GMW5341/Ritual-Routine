'use client';

import { useState } from 'react';
import { HabitStore } from '@/lib/types';

interface Props {
  store: HabitStore;
  onAdd: (name: string, emoji: string) => void;
  onRemove: (habitId: string) => void;
}

const EMOJI_OPTIONS = ['🧘', '📱', '✍️', '📚', '💪', '🚿', '🌟', '📝', '🎹', '🎨', '🏃', '🍎', '💤', '🧠', '🎯', '💊', '🌅', '🧹', '💰', '🗣️'];

export default function HabitManager({ store, onAdd, onRemove }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), emoji);
    setName('');
    setEmoji('🎯');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">습관 항목 관리</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showForm
              ? 'bg-white/10 text-white/70'
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
          }`}
        >
          {showForm ? '취소' : '+ 새 습관'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">아이콘 선택</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-emerald-500/30 ring-2 ring-emerald-400' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">습관 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 요가, 일기 쓰기..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-lg transition-colors"
          >
            추가하기
          </button>
        </form>
      )}

      {/* Habit List */}
      <div className="space-y-2">
        {store.habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
          >
            <span className="text-xl">{habit.emoji}</span>
            <span className="flex-1 text-white/80">{habit.name}</span>
            {confirmDelete === habit.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onRemove(habit.id);
                    setConfirmDelete(null);
                  }}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1 text-xs bg-white/10 text-white/60 rounded-lg hover:bg-white/20"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(habit.id)}
                className="p-1 text-white/30 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
