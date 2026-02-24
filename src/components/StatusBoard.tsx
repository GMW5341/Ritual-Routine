'use client';

import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore, SleepRecord } from '@/lib/types';
import { getOverallDailyRate } from '@/lib/stats';
import DailyMemo from './DailyMemo';
import SleepTracker from './SleepTracker';

interface Props {
  store: HabitStore;
  onToggle: (date: string, habitId: string) => void;
  onSaveMemo: (date: string, memo: string) => void;
  onDeleteMemo: (date: string) => void;
  onSaveSleep: (date: string, sleep: SleepRecord) => void;
  onNavigateToReading?: () => void;
}

type BoardMode = 'week' | 'month';

export default function StatusBoard({ store, onToggle, onSaveMemo, onDeleteMemo, onSaveSleep, onNavigateToReading }: Props) {
  const [mode, setMode] = useState<BoardMode>('week');
  const [baseDate, setBaseDate] = useState(new Date());

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayRate = getOverallDailyRate(store, todayStr);
  const todayRecord = store.records.find((r) => r.date === todayStr);
  const dailyHabits = store.habits.filter((h) => h.frequency === 'daily');
  const todayCompleted = dailyHabits.filter((h) => todayRecord?.completions[h.id] === true).length;

  const days = useMemo(() => {
    if (mode === 'week') {
      const start = startOfWeek(baseDate, { weekStartsOn: 1 });
      const end = endOfWeek(baseDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(baseDate);
      const end = endOfMonth(baseDate);
      return eachDayOfInterval({ start, end });
    }
  }, [mode, baseDate]);

  const navigate = (dir: -1 | 1) => {
    const offset = mode === 'week' ? 7 : 30;
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dir * offset);
    setBaseDate(d);
  };

  const headerLabel = mode === 'week'
    ? `${format(days[0], 'M/d', { locale: ko })} - ${format(days[days.length - 1], 'M/d', { locale: ko })}`
    : format(baseDate, 'yyyy년 M월', { locale: ko });

  const habitRates = useMemo(() => {
    return store.habits.map((habit) => {
      if (habit.frequency === 'weekly') {
        // Group days into weeks, 1+ completion per week = success
        const weeks = new Map<string, boolean>();
        days.forEach((d) => {
          const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          if (!weeks.has(weekKey)) weeks.set(weekKey, false);
          const ds = format(d, 'yyyy-MM-dd');
          const rec = store.records.find((r) => r.date === ds);
          if (rec?.completions[habit.id] === true) weeks.set(weekKey, true);
        });
        const total = weeks.size;
        const done = Array.from(weeks.values()).filter(Boolean).length;
        return { habitId: habit.id, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
      }
      if (habit.frequency === 'monthly') {
        // Group days into months, 1+ completion per month = success
        const months = new Map<string, boolean>();
        days.forEach((d) => {
          const monthKey = format(d, 'yyyy-MM');
          if (!months.has(monthKey)) months.set(monthKey, false);
          const ds = format(d, 'yyyy-MM-dd');
          const rec = store.records.find((r) => r.date === ds);
          if (rec?.completions[habit.id] === true) months.set(monthKey, true);
        });
        const total = months.size;
        const done = Array.from(months.values()).filter(Boolean).length;
        return { habitId: habit.id, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
      }
      // daily: completed days / total days
      const done = days.filter((d) => {
        const ds = format(d, 'yyyy-MM-dd');
        const rec = store.records.find((r) => r.date === ds);
        return rec?.completions[habit.id] === true;
      }).length;
      return { habitId: habit.id, rate: days.length > 0 ? Math.round((done / days.length) * 100) : 0 };
    });
  }, [store, days]);

  const dayRates = useMemo(() => {
    const dailyHabits = store.habits.filter((h) => h.frequency === 'daily');
    return days.map((d) => {
      const ds = format(d, 'yyyy-MM-dd');
      const rec = store.records.find((r) => r.date === ds);
      if (!rec || dailyHabits.length === 0) return 0;
      const done = dailyHabits.filter((h) => rec.completions[h.id] === true).length;
      return Math.round((done / dailyHabits.length) * 100);
    });
  }, [store, days]);

  // Week mini-rates for gauge bar chart
  const weekRates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      const ds = format(d, 'yyyy-MM-dd');
      return {
        label: format(d, 'E', { locale: ko }),
        rate: getOverallDailyRate(store, ds),
        isToday: ds === todayStr,
      };
    });
  }, [store, todayStr]);

  const strokeColor = todayRate >= 80 ? '#34d399' : todayRate >= 50 ? '#fbbf24' : todayRate > 0 ? '#f87171' : 'rgba(255,255,255,0.08)';
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="space-y-8">
      {/* Top: Today gauge + habit icons */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
        {/* Gauge */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <p className="text-sm font-medium text-white/60">
            {format(today, 'M월 d일 EEEE', { locale: ko })}
          </p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={strokeColor} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${(todayRate / 100) * circumference} ${circumference}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{todayRate}</span>
              <span className="text-[10px] text-white/35">% ({todayCompleted}/{dailyHabits.length})</span>
            </div>
          </div>
          {/* Mini week bars */}
          <div className="flex items-end gap-1 h-10 w-36">
            {weekRates.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full relative h-6">
                  <div
                    className={`absolute bottom-0 w-full rounded-sm transition-all duration-500 ${
                      d.isToday ? 'bg-emerald-500' : d.rate >= 80 ? 'bg-emerald-500/40' : d.rate >= 50 ? 'bg-amber-500/40' : d.rate > 0 ? 'bg-white/10' : 'bg-white/[0.03]'
                    }`}
                    style={{ height: `${Math.max(d.rate, 4)}%` }}
                  />
                </div>
                <span className={`text-[8px] ${d.isToday ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit icon grid */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">오늘의 수행</p>
          <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-2">
            {store.habits.map((habit) => {
              const done = todayRecord?.completions[habit.id] === true;
              const isReading = habit.name === '독서';
              return (
                <div key={habit.id} className="relative">
                  <button
                    onClick={() => onToggle(todayStr, habit.id)}
                    className={`w-full flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                      done
                        ? 'bg-emerald-500/15 ring-1 ring-emerald-500/20'
                        : 'bg-white/[0.02] opacity-40 hover:opacity-70 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-xl">{habit.emoji}</span>
                    <span className={`text-[9px] truncate w-full text-center ${done ? 'text-emerald-300/70' : 'text-white/40'}`}>
                      {habit.name}
                    </span>
                  </button>
                  {/* Reading link indicator */}
                  {isReading && done && onNavigateToReading && (
                    <button
                      onClick={onNavigateToReading}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full z-20 whitespace-nowrap px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    >
                      기록하기 →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Board Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
          <button
            onClick={() => setMode('week')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'week' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setMode('month')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'month' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            월간
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-white/70 font-medium min-w-[120px] text-center">{headerLabel}</span>
          <button onClick={() => navigate(1)} className="p-1 text-white/50 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#0a0a0a] text-left text-xs text-white/40 font-medium py-2 pr-3 min-w-[120px]">
                습관
              </th>
              {days.map((d) => {
                const ds = format(d, 'yyyy-MM-dd');
                const isToday = ds === todayStr;
                const isSun = d.getDay() === 0;
                const isSat = d.getDay() === 6;
                return (
                  <th
                    key={ds}
                    className={`text-center text-[10px] font-medium py-2 px-0.5 min-w-[32px] ${
                      isToday ? 'text-emerald-400' : isSun ? 'text-red-400/60' : isSat ? 'text-blue-400/60' : 'text-white/30'
                    }`}
                  >
                    <div>{format(d, 'E', { locale: ko })}</div>
                    <div className={`text-xs mt-0.5 ${isToday ? 'bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto' : ''}`}>
                      {format(d, 'd')}
                    </div>
                  </th>
                );
              })}
              <th className="text-center text-[10px] text-white/40 font-medium py-2 px-2 min-w-[40px]">
                달성률
              </th>
            </tr>
          </thead>
          <tbody>
            {store.habits.map((habit) => {
              const rateInfo = habitRates.find((r) => r.habitId === habit.id);
              return (
                <tr key={habit.id} className="group hover:bg-white/[0.02]">
                  <td className="sticky left-0 z-10 bg-[#0a0a0a] group-hover:bg-[#0d0d0d] py-1.5 pr-3 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{habit.emoji}</span>
                      <span className="text-xs text-white/70 truncate max-w-[80px]">{habit.name}</span>
                      {habit.frequency !== 'daily' && (
                        <span className={`text-[8px] px-1 py-0.5 rounded ${
                          habit.frequency === 'weekly' ? 'text-blue-400/60 bg-blue-500/10' : 'text-violet-400/60 bg-violet-500/10'
                        }`}>
                          {habit.frequency === 'weekly' ? '주' : '월'}
                        </span>
                      )}
                    </div>
                  </td>
                  {days.map((d) => {
                    const ds = format(d, 'yyyy-MM-dd');
                    const rec = store.records.find((r) => r.date === ds);
                    const done = rec?.completions[habit.id] === true;
                    const isTodayCell = ds === todayStr;
                    return (
                      <td key={ds} className="text-center py-1.5 px-0.5">
                        <button
                          onClick={() => onToggle(ds, habit.id)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-all ${
                            done
                              ? 'bg-emerald-500/30 text-emerald-400'
                              : isTodayCell
                              ? 'bg-white/[0.08] hover:bg-white/15 text-white/20'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/10'
                          }`}
                        >
                          {done ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-[10px]">-</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-center py-1.5 px-2">
                    <span className={`text-xs font-bold ${
                      (rateInfo?.rate ?? 0) >= 80 ? 'text-emerald-400' :
                      (rateInfo?.rate ?? 0) >= 50 ? 'text-amber-400' :
                      'text-white/30'
                    }`}>
                      {rateInfo?.rate ?? 0}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/5">
              <td className="sticky left-0 z-10 bg-[#0a0a0a] py-2 pr-3">
                <span className="text-[10px] text-white/30 font-medium">일일 달성률</span>
              </td>
              {dayRates.map((rate, i) => (
                <td key={i} className="text-center py-2 px-0.5">
                  <span className={`text-[10px] font-medium ${
                    rate >= 80 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : rate > 0 ? 'text-white/30' : 'text-white/10'
                  }`}>
                    {rate > 0 ? `${rate}` : '-'}
                  </span>
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Sleep Tracker */}
      <SleepTracker store={store} onSave={onSaveSleep} />

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Daily Memo */}
      <DailyMemo
        store={store}
        date={todayStr}
        onSave={onSaveMemo}
        onDelete={onDeleteMemo}
      />
    </div>
  );
}
