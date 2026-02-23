'use client';

import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';

interface Props {
  store: HabitStore;
  onToggle: (date: string, habitId: string) => void;
}

type BoardMode = 'week' | 'month';

export default function StatusBoard({ store, onToggle }: Props) {
  const [mode, setMode] = useState<BoardMode>('week');
  const [baseDate, setBaseDate] = useState(new Date());

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

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const navigate = (dir: -1 | 1) => {
    const offset = mode === 'week' ? 7 : 30;
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dir * offset);
    setBaseDate(d);
  };

  const headerLabel = mode === 'week'
    ? `${format(days[0], 'M/d', { locale: ko })} - ${format(days[days.length - 1], 'M/d', { locale: ko })}`
    : format(baseDate, 'yyyy년 M월', { locale: ko });

  // Calculate per-habit completion rate for visible range
  const habitRates = useMemo(() => {
    return store.habits.map((habit) => {
      const done = days.filter((d) => {
        const ds = format(d, 'yyyy-MM-dd');
        const rec = store.records.find((r) => r.date === ds);
        return rec?.completions[habit.id] === true;
      }).length;
      return { habitId: habit.id, rate: days.length > 0 ? Math.round((done / days.length) * 100) : 0 };
    });
  }, [store, days]);

  // Calculate per-day completion rate
  const dayRates = useMemo(() => {
    return days.map((d) => {
      const ds = format(d, 'yyyy-MM-dd');
      const rec = store.records.find((r) => r.date === ds);
      if (!rec || store.habits.length === 0) return 0;
      const done = store.habits.filter((h) => rec.completions[h.id] === true).length;
      return Math.round((done / store.habits.length) * 100);
    });
  }, [store, days]);

  return (
    <div className="space-y-4">
      {/* Controls */}
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
              {days.map((d, i) => {
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
                    </div>
                  </td>
                  {days.map((d) => {
                    const ds = format(d, 'yyyy-MM-dd');
                    const rec = store.records.find((r) => r.date === ds);
                    const done = rec?.completions[habit.id] === true;
                    const isToday = ds === todayStr;
                    return (
                      <td key={ds} className="text-center py-1.5 px-0.5">
                        <button
                          onClick={() => onToggle(ds, habit.id)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-all ${
                            done
                              ? 'bg-emerald-500/30 text-emerald-400'
                              : isToday
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
          {/* Day completion rate footer */}
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
    </div>
  );
}
