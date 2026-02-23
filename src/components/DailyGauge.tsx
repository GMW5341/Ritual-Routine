'use client';

import { useMemo } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';
import { getOverallDailyRate } from '@/lib/stats';

interface Props {
  store: HabitStore;
}

export default function DailyGauge({ store }: Props) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const rate = getOverallDailyRate(store, todayStr);
  const record = store.records.find((r) => r.date === todayStr);

  const completed = store.habits.filter((h) => record?.completions[h.id] === true).length;
  const total = store.habits.length;

  // Last 7 days mini-rates
  const weekRates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      const ds = format(d, 'yyyy-MM-dd');
      return {
        label: format(d, 'E', { locale: ko }),
        date: format(d, 'M/d'),
        rate: getOverallDailyRate(store, ds),
        isToday: ds === todayStr,
      };
    });
  }, [store, todayStr]);

  const strokeColor = rate >= 80 ? '#34d399' : rate >= 50 ? '#fbbf24' : rate > 0 ? '#f87171' : 'rgba(255,255,255,0.1)';
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="space-y-6">
      {/* Date */}
      <div className="text-center">
        <p className="text-lg font-bold text-white">
          {format(today, 'M월 d일 EEEE', { locale: ko })}
        </p>
      </div>

      {/* Large Ring */}
      <div className="relative mx-auto w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(rate / 100) * circumference} ${circumference}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{rate}</span>
          <span className="text-xs text-white/40 -mt-0.5">%</span>
          <span className="text-[10px] text-white/30 mt-1">{completed} / {total} 완료</span>
        </div>
      </div>

      {/* Completed habits list */}
      <div className="grid grid-cols-5 gap-2">
        {store.habits.map((habit) => {
          const done = record?.completions[habit.id] === true;
          return (
            <div
              key={habit.id}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                done ? 'bg-emerald-500/10' : 'bg-white/[0.02] opacity-30'
              }`}
            >
              <span className="text-lg">{habit.emoji}</span>
              <span className="text-[9px] text-white/50 truncate w-full text-center">{habit.name}</span>
            </div>
          );
        })}
      </div>

      {/* Week mini bar chart */}
      <div>
        <div className="flex items-end justify-between gap-1 h-16">
          {weekRates.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: '48px' }}>
                <div
                  className={`absolute bottom-0 w-full rounded-sm transition-all duration-500 ${
                    d.isToday ? 'bg-emerald-500' : d.rate >= 80 ? 'bg-emerald-500/40' : d.rate >= 50 ? 'bg-amber-500/40' : d.rate > 0 ? 'bg-white/10' : 'bg-white/[0.03]'
                  }`}
                  style={{ height: `${Math.max(d.rate, 2)}%` }}
                />
              </div>
              <span className={`text-[9px] ${d.isToday ? 'text-emerald-400 font-bold' : 'text-white/25'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
