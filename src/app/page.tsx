'use client';

import { useState, useCallback } from 'react';
import { ViewPeriod } from '@/lib/types';
import { useHabitStore } from '@/hooks/useHabitStore';
import { useReadingStore } from '@/hooks/useReadingStore';
import { useGoalStore } from '@/hooks/useGoalStore';
import Dashboard from '@/components/Dashboard';
import StatusBoard from '@/components/StatusBoard';
import Settings from '@/components/Settings';
import ReadingLog from '@/components/ReadingLog';
import Goals from '@/components/Goals';
import PinnedPrinciples from '@/components/PinnedPrinciples';

type Module = 'board' | 'dashboard' | 'reading' | 'goals' | 'settings';

const NAV_ITEMS: { key: Module; label: string; icon: React.ReactNode }[] = [
  {
    key: 'board',
    label: '현황판',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'dashboard',
    label: '대시보드',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l4-6 4 4 4-8" />
      </svg>
    ),
  },
  {
    key: 'reading',
    label: '독서 기록',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'goals',
    label: '목표',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: '설정',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
      </svg>
    ),
  },
];

export default function Home() {
  const { store, addHabit, removeHabit, toggleHabit, setMemo, deleteMemo, setSleep, updateFrequency } = useHabitStore();
  const {
    store: readingStore,
    addBook, updateBook, removeBook,
    addNote, updateNote, removeNote,
    setNotion, disconnectNotion,
  } = useReadingStore();
  const {
    store: goalStore,
    addGoal, updateGoal, removeGoal,
  } = useGoalStore();
  const [activeModule, setActiveModule] = useState<Module>('board');
  const [period, setPeriod] = useState<ViewPeriod>('daily');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateToReading = useCallback(() => {
    setActiveModule('reading');
  }, []);

  if (!store || !readingStore || !goalStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e2330]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'board':
        return <StatusBoard store={store} onToggle={toggleHabit} onSaveMemo={setMemo} onDeleteMemo={deleteMemo} onSaveSleep={setSleep} onNavigateToReading={navigateToReading} />;
      case 'dashboard':
        return <Dashboard store={store} period={period} onPeriodChange={setPeriod} />;
      case 'reading':
        return (
          <ReadingLog
            readingStore={readingStore}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onRemoveBook={removeBook}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onRemoveNote={removeNote}
            onSetNotion={setNotion}
            onDisconnectNotion={disconnectNotion}
          />
        );
      case 'goals':
        return (
          <Goals
            goalStore={goalStore}
            onAdd={addGoal}
            onUpdate={updateGoal}
            onRemove={removeGoal}
          />
        );
      case 'settings':
        return <Settings store={store} onAdd={addHabit} onRemove={removeHabit} onUpdateFrequency={updateFrequency} />;
    }
  };

  const activeLabel = NAV_ITEMS.find((n) => n.key === activeModule)?.label ?? '';

  return (
    <div className="min-h-screen bg-[#1e2330] flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-emerald-500/[0.08] bg-[#181d28] fixed inset-y-0 left-0 z-40">
        {/* Metallic sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-emerald-900/[0.03] pointer-events-none" />

        <div className="relative px-5 pt-7 pb-10">
          <h1 className="text-lg font-bold text-white/90 tracking-tight">
            Ritual <span className="text-emerald-400">&</span> Routine
          </h1>
          <p className="text-[9px] text-emerald-400/30 mt-1.5 tracking-[0.15em]">지속가능한 삶을 위한 원칙</p>
        </div>

        <nav className="relative flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeModule === item.key
                  ? 'bg-emerald-500/12 text-emerald-400 shadow-[inset_0_1px_0_rgba(52,211,153,0.08)]'
                  : 'text-white/70 hover:text-white/75 hover:bg-white/[0.06]'
              }`}
            >
              <span className={activeModule === item.key ? 'text-emerald-400' : 'text-white/60'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative px-5 py-8 border-t border-emerald-500/[0.06]">
          <div className="space-y-1.5 text-center">
            <p className="text-[10px] text-emerald-300/20">체력은 정신력.</p>
            <p className="text-[10px] text-emerald-300/20">정신력은 의사결정.</p>
            <p className="text-[10px] text-emerald-300/20">의사결정은 내 삶.</p>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#181d28] border-r border-emerald-500/[0.08] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-emerald-900/[0.03] pointer-events-none" />
            <div className="relative px-5 pt-6 pb-6 flex items-center justify-between">
              <h1 className="text-lg font-bold text-white/90 tracking-tight">
                Ritual <span className="text-emerald-400">&</span> Routine
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-white/70 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="relative flex-1 px-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveModule(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeModule === item.key
                      ? 'bg-emerald-500/12 text-emerald-400'
                      : 'text-white/70 hover:text-white/75 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={activeModule === item.key ? 'text-emerald-400' : 'text-white/60'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#1e2330]/80 border-b border-emerald-500/[0.06]">
          <div className="flex items-center gap-3 px-4 lg:px-10 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-white/75 uppercase tracking-wider">{activeLabel}</h2>
          </div>
        </header>

        {/* Content area with optional right panel */}
        <div className="flex-1 flex">
          <main className="flex-1 px-4 lg:px-10 pt-8 pb-12 max-w-5xl">
            {renderModule()}
          </main>

          {/* Pinned Principles - right panel, visible on xl when on board */}
          {activeModule === 'board' && (
            <aside className="hidden xl:block w-72 shrink-0 border-l border-emerald-500/[0.06] bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-[#272c38]/30">
              <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-5">
                <PinnedPrinciples />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
