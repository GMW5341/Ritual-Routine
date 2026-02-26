'use client';

import { useState } from 'react';
import { HabitStore, HabitFrequency } from '@/lib/types';

interface Props {
  store: HabitStore;
  onAdd: (name: string, emoji: string, frequency: HabitFrequency) => void;
  onRemove: (habitId: string) => void;
  onUpdateFrequency: (habitId: string, frequency: HabitFrequency) => void;
}

const EMOJI_OPTIONS = ['🧘', '📱', '✍️', '📚', '💪', '🚿', '🌟', '📝', '🎹', '🎨', '🏃', '🍎', '💤', '🧠', '🎯', '💊', '🌅', '🧹', '💰', '🗣️'];

const FREQ_LABELS: Record<HabitFrequency, string> = {
  daily: '매일',
  weekly: '주간',
  monthly: '월간',
};

const FREQ_COLORS: Record<HabitFrequency, string> = {
  daily: 'text-emerald-400/60 bg-emerald-500/10',
  weekly: 'text-blue-400/60 bg-blue-500/10',
  monthly: 'text-violet-400/60 bg-violet-500/10',
};

export default function HabitManager({ store, onAdd, onRemove, onUpdateFrequency }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), emoji, frequency);
    setName('');
    setEmoji('🎯');
    setFrequency('daily');
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
        <form onSubmit={handleSubmit} className="bg-[#272c38]/50 border border-[#313744]/50 rounded-xl p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/65 mb-2">아이콘 선택</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-emerald-500/30 ring-2 ring-emerald-400' : 'bg-[#272c38] hover:bg-[#313744]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/65 mb-2">습관 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 요가, 일기 쓰기..."
              className="w-full px-4 py-3 bg-[#272c38]/40 border border-[#313744]/60 rounded-lg text-white placeholder-white/35 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/65 mb-2">목표 주기</label>
            <div className="flex gap-2">
              {(Object.keys(FREQ_LABELS) as HabitFrequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    frequency === f
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#272c38] text-white/50 hover:text-white/70 hover:bg-[#313744]'
                  }`}
                >
                  {FREQ_LABELS[f]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40 mt-1.5">
              {frequency === 'daily' && '매일 수행을 목표로 합니다.'}
              {frequency === 'weekly' && '일주일에 1회 이상 수행을 목표로 합니다.'}
              {frequency === 'monthly' && '한 달에 1회 이상 수행을 목표로 합니다.'}
            </p>
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
            className="flex items-center gap-3 p-3 bg-[#272c38]/50 border border-[#313744]/50 rounded-xl"
          >
            <span className="text-xl">{habit.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-white/80 text-sm">{habit.name}</span>
              {/* Frequency selector inline */}
              <div className="flex gap-1 mt-1">
                {(Object.keys(FREQ_LABELS) as HabitFrequency[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => onUpdateFrequency(habit.id, f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                      habit.frequency === f
                        ? FREQ_COLORS[f]
                        : 'text-white/25 hover:text-white/40'
                    }`}
                  >
                    {FREQ_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            {confirmDelete === habit.id ? (
              <div className="flex gap-2 shrink-0">
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
                className="p-1 text-white/30 hover:text-red-400 transition-colors shrink-0"
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
