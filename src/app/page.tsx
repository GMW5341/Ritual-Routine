'use client';

import { useState } from 'react';
import { ViewPeriod } from '@/lib/types';
import { useHabitStore } from '@/hooks/useHabitStore';
import DailyTracker from '@/components/DailyTracker';
import Dashboard from '@/components/Dashboard';
import HabitManager from '@/components/HabitManager';
import WeeklyHeatmap from '@/components/WeeklyHeatmap';
import StatusBoard from '@/components/StatusBoard';

type MobileTab = 'today' | 'board' | 'dashboard' | 'manage';

export default function Home() {
  const { store, addHabit, removeHabit, toggleHabit } = useHabitStore();
  const [mobileTab, setMobileTab] = useState<MobileTab>('today');
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Ritual <span className="text-emerald-400">&</span> Routine
              </h1>
              <p className="text-[10px] text-white/25 mt-0.5 tracking-[0.2em] hidden sm:block">
                체력은 정신력 &middot; 정신력은 의사결정 &middot; 의사결정은 내 삶
              </p>
            </div>
            {/* Desktop nav - hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
              <span className="px-3 py-1.5 text-xs text-emerald-400 font-medium">All Panels</span>
            </nav>
          </div>

          {/* Mobile tab navigation */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl mt-3 lg:hidden">
            {([
              { key: 'today' as MobileTab, label: '오늘' },
              { key: 'board' as MobileTab, label: '현황판' },
              { key: 'dashboard' as MobileTab, label: '대시보드' },
              { key: 'manage' as MobileTab, label: '관리' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMobileTab(key)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  mobileTab === key
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

      {/* ===== DESKTOP LAYOUT (lg+) ===== */}
      <main className="hidden lg:block max-w-screen-2xl mx-auto px-8 py-6">
        {/* Top: Status Board - full width */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">현황판</h2>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <StatusBoard store={store} onToggle={toggleHabit} />
          </div>
        </section>

        {/* Bottom: 3-column grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Daily Tracker */}
          <div className="col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">오늘의 수행</h2>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-6">
              <DailyTracker
                store={store}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onToggle={toggleHabit}
              />
              {/* Philosophy */}
              <div className="border-t border-white/5 pt-6">
                <div className="text-center space-y-1.5">
                  <p className="text-[11px] text-white/30">체력은 정신력.</p>
                  <p className="text-[11px] text-white/30">정신력은 의사결정.</p>
                  <p className="text-[11px] text-white/30">의사결정은 내 삶.</p>
                  <p className="text-[11px] text-white/40 font-medium mt-3 tracking-wider">지속가능한 삶을 위한 원칙.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Dashboard */}
          <div className="col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-emerald-500 rounded-full" />
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">대시보드</h2>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <Dashboard store={store} period={period} onPeriodChange={setPeriod} />
            </div>
          </div>

          {/* Right: Heatmap + Manage */}
          <div className="col-span-3 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">히트맵</h2>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <WeeklyHeatmap store={store} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">습관 관리</h2>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <HabitManager store={store} onAdd={addHabit} onRemove={removeHabit} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <main className="lg:hidden max-w-lg mx-auto w-full px-4 py-6">
        {mobileTab === 'today' && (
          <div className="space-y-8">
            <DailyTracker
              store={store}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onToggle={toggleHabit}
            />
            <WeeklyHeatmap store={store} />
            <div className="border-t border-white/5 pt-8 pb-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-white/40 leading-relaxed">체력은 정신력.</p>
                <p className="text-sm text-white/40 leading-relaxed">정신력은 의사결정.</p>
                <p className="text-sm text-white/40 leading-relaxed">의사결정은 내 삶.</p>
                <p className="text-sm text-white/50 font-medium mt-4 tracking-wider">지속가능한 삶을 위한 원칙.</p>
              </div>
            </div>
          </div>
        )}

        {mobileTab === 'board' && (
          <StatusBoard store={store} onToggle={toggleHabit} />
        )}

        {mobileTab === 'dashboard' && (
          <Dashboard store={store} period={period} onPeriodChange={setPeriod} />
        )}

        {mobileTab === 'manage' && (
          <HabitManager store={store} onAdd={addHabit} onRemove={removeHabit} />
        )}
      </main>
    </div>
  );
}
