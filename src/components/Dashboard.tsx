'use client';

import { useMemo } from 'react';
import { HabitStore, ViewPeriod, HabitStats } from '@/lib/types';
import { format, startOfWeek, addDays, isAfter } from 'date-fns';
import { getDailyStats, getMonthlyStats, getQuarterlyStats, getYearlyStats, getStreakDays, getOverallDailyRate } from '@/lib/stats';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

  const overallTrend = useMemo(() => {
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const start = addDays(currentWeekStart, -21);
    return Array.from({ length: 28 }, (_, i) => {
      const d = addDays(start, i);
      if (isAfter(d, today)) return null;
      const ds = format(d, 'yyyy-MM-dd');
      return { label: format(d, 'M/d'), rate: getOverallDailyRate(store, ds) };
    }).filter(Boolean) as { label: string; rate: number }[];
  }, [store]);

  return (
    <div className="space-y-10">
      {/* Philosophy banner - subtle, integrated */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#1e2330] to-[#272c38]/40 border border-emerald-500/10 px-6 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.06),transparent_70%)]" />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span>체력은 정신력</span>
            <span className="text-emerald-500/50">&rarr;</span>
            <span>정신력은 의사결정</span>
            <span className="text-emerald-500/50">&rarr;</span>
            <span>의사결정은 내 삶</span>
          </div>
          <span className="text-xs text-emerald-400/60 tracking-widest font-medium">지속가능한 삶을 위한 원칙</span>
        </div>
      </div>

      {/* Overall Trend + Compact Heatmap */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-3">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">전체 달성률 추이</h3>
          <div className="bg-[#272c38]/30 border border-[#313744]/40 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={overallTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30,35,48,0.95)',
                    border: '1px solid rgba(52,211,153,0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: number | undefined) => [`${value ?? 0}%`, '달성률']}
                />
                <Area type="monotone" dataKey="rate" stroke="#34d399" strokeWidth={2} fill="url(#overallGradient)" dot={{ fill: '#34d399', r: 2 }} activeDot={{ r: 4, fill: '#34d399' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="hidden md:block w-44 shrink-0">
          <WeeklyHeatmap store={store} compact />
        </div>
      </div>

      {/* Period Selector */}
      <div>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">기간별 추이</h3>
        <div className="flex gap-2 bg-[#272c38]/60 p-1 rounded-xl">
          {(Object.keys(PERIOD_LABELS) as ViewPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/15 to-[#272c38]/60 border border-emerald-500/15 rounded-xl p-4 text-center shadow-[inset_0_1px_0_rgba(52,211,153,0.06)]">
          <p className="text-3xl font-bold text-emerald-300">{overallRate}%</p>
          <p className="text-xs text-white/55 mt-1">전체 달성률</p>
        </div>
        <div className="bg-gradient-to-br from-[#313744]/80 to-[#272c38]/60 border border-[#313744] rounded-xl p-4 text-center shadow-[inset_0_1px_0_rgba(52,211,153,0.04)]">
          <p className="text-3xl font-bold text-emerald-200">{store.habits.length}</p>
          <p className="text-xs text-white/55 mt-1">추적 습관</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/15 to-[#272c38]/60 border border-violet-500/15 rounded-xl p-4 text-center shadow-[inset_0_1px_0_rgba(52,211,153,0.04)]">
          <p className="text-3xl font-bold text-violet-300">{streaks[0]?.streak || 0}</p>
          <p className="text-xs text-white/55 mt-1">최대 연속</p>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">연속 수행 기록</h3>
        <div className="space-y-2">
          {streaks.filter(s => s.streak > 0).length === 0 ? (
            <p className="text-sm text-white/60 text-center py-4">아직 연속 기록이 없습니다. 오늘부터 시작하세요!</p>
          ) : (
            streaks.filter(s => s.streak > 0).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-[#272c38]/50 rounded-xl">
                <span className="text-lg">{s.emoji}</span>
                <span className="flex-1 text-sm text-white/75">{s.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-emerald-300">{s.streak}</span>
                  <span className="text-xs text-white/70">일</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Per-habit stats */}
      <div>
        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">
          습관별 {PERIOD_LABELS[period]} 달성률
        </h3>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.habitId} className="bg-[#272c38]/50 border border-[#313744]/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stat.emoji}</span>
                  <span className="font-medium text-white/85">{stat.habitName}</span>
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
