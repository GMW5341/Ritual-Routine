'use client';

import { useMemo } from 'react';
import { HabitStore, ViewPeriod, HabitStats } from '@/lib/types';
import { getDailyStats, getMonthlyStats, getQuarterlyStats, getYearlyStats, getStreakDays } from '@/lib/stats';
import TrendChart from './TrendChart';
import WeeklyHeatmap from './WeeklyHeatmap';

interface Props {
  store: HabitStore;
  period: ViewPeriod;
  onPeriodChange: (period: ViewPeriod) => void;
}

const PERIOD_LABELS: Record<ViewPeriod, string> = {
  daily: '일별',
  monthly: '월별',
  quarterly: '분기별',
  yearly: '연도별',
};

export default function Dashboard({ store, period, onPeriodChange }: Props) {
  const today = new Date();

  const stats: HabitStats[] = useMemo(() => {
    switch (period) {
      case 'daily':
        return getDailyStats(store, today, 14);
      case 'monthly':
        return getMonthlyStats(store, today, 6);
      case 'quarterly':
        return getQuarterlyStats(store, today);
      case 'yearly':
        return getYearlyStats(store, today);
    }
  }, [store, period]);

  const overallRate = useMemo(() => {
    if (stats.length === 0) return 0;
    return Math.round(stats.reduce((sum, s) => sum + s.overallRate, 0) / stats.length);
  }, [stats]);

  const streaks = useMemo(() => {
    return store.habits.map((h) => ({
      ...h,
      streak: getStreakDays(store, h.id, today),
    })).sort((a, b) => b.streak - a.streak);
  }, [store]);

  return (
    <div className="space-y-8">
      {/* Heatmap */}
      <WeeklyHeatmap store={store} />

      {/* Period Selector */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">기간별 추이</h3>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {(Object.keys(PERIOD_LABELS) as ViewPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-300">{overallRate}%</p>
          <p className="text-xs text-white/50 mt-1">전체 달성률</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-300">{store.habits.length}</p>
          <p className="text-xs text-white/50 mt-1">추적 습관</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-violet-300">{streaks[0]?.streak || 0}</p>
          <p className="text-xs text-white/50 mt-1">최대 연속</p>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">연속 수행 기록</h3>
        <div className="space-y-2">
          {streaks.filter(s => s.streak > 0).length === 0 ? (
            <p className="text-sm text-white/30 text-center py-4">아직 연속 기록이 없습니다. 오늘부터 시작하세요!</p>
          ) : (
            streaks.filter(s => s.streak > 0).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-lg">{s.emoji}</span>
                <span className="flex-1 text-sm text-white/70">{s.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-amber-300">{s.streak}</span>
                  <span className="text-xs text-white/40">일</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Per-habit stats */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
          습관별 {PERIOD_LABELS[period]} 달성률
        </h3>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.habitId} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stat.emoji}</span>
                  <span className="font-medium text-white/90">{stat.habitName}</span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    stat.overallRate >= 80
                      ? 'text-emerald-300'
                      : stat.overallRate >= 50
                      ? 'text-amber-300'
                      : 'text-red-300'
                  }`}
                >
                  {stat.overallRate}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stat.overallRate >= 80
                      ? 'bg-emerald-500'
                      : stat.overallRate >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${stat.overallRate}%` }}
                />
              </div>
              <TrendChart data={stat.periods} height={80} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
