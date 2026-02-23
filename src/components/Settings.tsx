'use client';

import { HabitStore, HabitFrequency } from '@/lib/types';
import HabitManager from './HabitManager';

interface Props {
  store: HabitStore;
  onAdd: (name: string, emoji: string, frequency: HabitFrequency) => void;
  onRemove: (habitId: string) => void;
  onUpdateFrequency: (habitId: string, frequency: HabitFrequency) => void;
}

export default function Settings({ store, onAdd, onRemove, onUpdateFrequency }: Props) {
  return (
    <div className="space-y-8">
      {/* Section: Habit Management */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">습관 항목 관리</h3>
        </div>
        <HabitManager store={store} onAdd={onAdd} onRemove={onRemove} onUpdateFrequency={onUpdateFrequency} />
      </div>

      {/* Section: Data */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6M12 9v6" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">데이터</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-sm text-white/70">총 기록된 일수</p>
              <p className="text-xs text-white/30 mt-0.5">습관 수행을 기록한 날</p>
            </div>
            <span className="text-lg font-bold text-white/80">{store.records.length}일</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
            <div>
              <p className="text-sm text-white/70">추적 중인 습관</p>
              <p className="text-xs text-white/30 mt-0.5">현재 활성 습관 수</p>
            </div>
            <span className="text-lg font-bold text-white/80">{store.habits.length}개</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="pt-4 border-t border-white/5 text-center">
        <p className="text-[11px] text-white/20">Ritual & Routine v1.0</p>
        <p className="text-[10px] text-white/15 mt-1">지속가능한 삶을 위한 원칙</p>
      </div>
    </div>
  );
}
