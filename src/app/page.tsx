'use client';

import { useState } from 'react';
import { ViewPeriod } from '@/lib/types';
import { useHabitStore } from '@/hooks/useHabitStore';
import DailyTracker from '@/components/DailyTracker';
import Dashboard from '@/components/Dashboard';
import HabitManager from '@/components/HabitManager';
import WeeklyHeatmap from '@/components/WeeklyHeatmap';

type Tab = 'today' | 'dashboard' | 'manage';

export default function Home() {
  const { store, addHabit, removeHabit, toggleHabit } = useHabitStore();
  const [tab, setTab] = useState<Tab>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [period, setPeriod] = useState<ViewPeriod>('daily');

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Ritual <span className="text-emerald-400">&</span> Routine
            </h1>
            <p className="text-xs text-white/30 mt-1 tracking-widest">지속가능한 삶을 위한 원칙</p>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {([
              { key: 'today' as Tab, label: '오늘' },
              { key: 'dashboard' as Tab, label: '대시보드' },
              { key: 'manage' as Tab, label: '관리' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {tab === 'today' && (
          <div className="space-y-8">
            <DailyTracker
              store={store}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onToggle={toggleHabit}
            />
            <WeeklyHeatmap store={store} />
            {/* Philosophy */}
            <div className="border-t border-white/5 pt-8 pb-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-white/40 leading-relaxed">
                  체력은 정신력.
                </p>
                <p className="text-sm text-white/40 leading-relaxed">
                  정신력은 의사결정.
                </p>
                <p className="text-sm text-white/40 leading-relaxed">
                  의사결정은 내 삶.
                </p>
                <p className="text-sm text-white/50 font-medium mt-4 tracking-wider">
                  지속가능한 삶을 위한 원칙.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <Dashboard store={store} period={period} onPeriodChange={setPeriod} />
        )}

        {tab === 'manage' && (
          <HabitManager store={store} onAdd={addHabit} onRemove={removeHabit} />
        )}
      </main>
    </div>
  );
}
