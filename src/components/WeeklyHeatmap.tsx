'use client';

import { format, startOfWeek, addDays, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';
import { getOverallDailyRate } from '@/lib/stats';

interface Props {
  store: HabitStore;
  compact?: boolean;
}

function getColor(rate: number): string {
  if (rate < 0) return 'bg-white/[0.02]';
  if (rate === 0) return 'bg-white/5';
  if (rate < 30) return 'bg-red-500/30';
  if (rate < 60) return 'bg-amber-500/30';
  if (rate < 80) return 'bg-emerald-500/30';
  return 'bg-emerald-500/60';
}

export default function WeeklyHeatmap({ store, compact = false }: Props) {
  const today = new Date();
  // Always start from Monday, 4 complete weeks aligned to Mon-Sun
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const start = addDays(currentWeekStart, -21);

  const days = Array.from({ length: 28 }, (_, i) => {
    const date = addDays(start, i);
    const isFuture = isAfter(date, today);
    const dateStr = format(date, 'yyyy-MM-dd');
    const rate = isFuture ? -1 : getOverallDailyRate(store, dateStr);
    return { date, dateStr, rate, isFuture, dayNum: format(date, 'd') };
  });

  if (compact) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">4주 히트맵</h3>
        <div className="grid grid-cols-7 gap-1">
          {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
            <div key={d} className="text-center text-[9px] text-white/40 pb-0.5">{d}</div>
          ))}
          {days.map((d) => (
            <div
              key={d.dateStr}
              className={`aspect-square rounded-sm ${getColor(d.rate)} flex items-center justify-center relative group cursor-default`}
            >
              <span className={`text-[8px] ${d.isFuture ? 'text-white/15' : 'text-white/50'}`}>{d.dayNum}</span>
              {!d.isFuture && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-[#1e2330]/95 border border-[#313744]/60 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {format(d.date, 'M/d')} - {d.rate}%
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1.5 text-[9px] text-white/40">
          <span>0%</span>
          <div className="flex gap-px">
            <div className="w-2 h-2 rounded-sm bg-white/5" />
            <div className="w-2 h-2 rounded-sm bg-red-500/30" />
            <div className="w-2 h-2 rounded-sm bg-amber-500/30" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500/30" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500/60" />
          </div>
          <span>100%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">최근 4주 히트맵</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
          <div key={d} className="text-center text-xs text-white/45 pb-1">{d}</div>
        ))}
        {days.map((d) => (
          <div
            key={d.dateStr}
            className={`aspect-square rounded-md ${getColor(d.rate)} flex items-center justify-center relative group cursor-default`}
          >
            <span className={`text-xs ${d.isFuture ? 'text-white/20' : 'text-white/55'}`}>{d.dayNum}</span>
            {!d.isFuture && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1e2330]/95 border border-[#313744]/60 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {format(d.date, 'M/d')} - {d.rate}%
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-white/45">
        <span>0%</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-red-500/30" />
          <div className="w-3 h-3 rounded-sm bg-amber-500/30" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
        </div>
        <span>100%</span>
      </div>
    </div>
  );
}
