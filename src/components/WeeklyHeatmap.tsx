'use client';

import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';
import { getOverallDailyRate } from '@/lib/stats';

interface Props {
  store: HabitStore;
}

function getColor(rate: number): string {
  if (rate === 0) return 'bg-white/5';
  if (rate < 30) return 'bg-red-500/30';
  if (rate < 60) return 'bg-amber-500/30';
  if (rate < 80) return 'bg-emerald-500/30';
  return 'bg-emerald-500/60';
}

export default function WeeklyHeatmap({ store }: Props) {
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = subDays(today, 27 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const rate = getOverallDailyRate(store, dateStr);
    return { date, dateStr, rate, dayLabel: format(date, 'E', { locale: ko }), dayNum: format(date, 'd') };
  });

  // Group by weeks (7 days each)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
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
            <span className="text-xs text-white/55">{d.dayNum}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1e2330]/95 border border-[#313744]/60 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {format(d.date, 'M/d')} - {d.rate}%
            </div>
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
