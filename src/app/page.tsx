'use client';

import { useState } from 'react';
import { ViewPeriod } from '@/lib/types';
import { useHabitStore } from '@/hooks/useHabitStore';
import Dashboard from '@/components/Dashboard';
import StatusBoard from '@/components/StatusBoard';
import Settings from '@/components/Settings';

type Module = 'board' | 'dashboard' | 'settings';

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
  const [activeModule, setActiveModule] = useState<Module>('board');
  const [period, setPeriod] = useState<ViewPeriod>('daily');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'board':
        return <StatusBoard store={store} onToggle={toggleHabit} onSaveMemo={setMemo} onDeleteMemo={deleteMemo} onSaveSleep={setSleep} />;
      case 'dashboard':
        return <Dashboard store={store} period={period} onPeriodChange={setPeriod} />;
      case 'settings':
        return <Settings store={store} onAdd={addHabit} onRemove={removeHabit} onUpdateFrequency={updateFrequency} />;
    }
  };

  const activeLabel = NAV_ITEMS.find((n) => n.key === activeModule)?.label ?? '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 bg-[#070707] fixed inset-y-0 left-0 z-40">
        <div className="px-5 pt-7 pb-10">
          <h1 className="text-lg font-bold text-white tracking-tight">
            Ritual <span className="text-emerald-400">&</span> Routine
          </h1>
          <p className="text-[9px] text-white/20 mt-1.5 tracking-[0.15em]">지속가능한 삶을 위한 원칙</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveModule(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeModule === item.key
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className={activeModule === item.key ? 'text-emerald-400' : 'text-white/30'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-8 border-t border-white/5">
          <div className="space-y-1.5 text-center">
            <p className="text-[10px] text-white/15">체력은 정신력.</p>
            <p className="text-[10px] text-white/15">정신력은 의사결정.</p>
            <p className="text-[10px] text-white/15">의사결정은 내 삶.</p>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#070707] border-r border-white/5 flex flex-col">
            <div className="px-5 pt-6 pb-6 flex items-center justify-between">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Ritual <span className="text-emerald-400">&</span> Routine
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-white/40 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveModule(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeModule === item.key
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span className={activeModule === item.key ? 'text-emerald-400' : 'text-white/30'}>{item.icon}</span>
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
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
          <div className="flex items-center gap-3 px-4 lg:px-10 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">{activeLabel}</h2>
          </div>
        </header>

        {/* Content area with breathing room */}
        <main className="flex-1 px-4 lg:px-10 pt-8 pb-12 max-w-5xl">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
