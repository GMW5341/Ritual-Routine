'use client';

import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore, SleepRecord } from '@/lib/types';

interface Props {
  store: HabitStore;
  onSave: (date: string, sleep: SleepRecord) => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calcSleepHours(sleepTime: string, wakeTime: string): number {
  let sleepMin = timeToMinutes(sleepTime);
  const wakeMin = timeToMinutes(wakeTime);
  // If sleep is PM and wake is AM, sleep crosses midnight
  if (sleepMin > wakeMin) {
    sleepMin -= 24 * 60;
  }
  return Math.round((wakeMin - sleepMin) / 6) / 10; // 1 decimal
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour < 12 ? '오전' : '오후';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${ampm} ${h12}:${m}`;
}

export default function SleepTracker({ store, onSave }: Props) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayRecord = store.records.find((r) => r.date === todayStr);

  const [wakeTime, setWakeTime] = useState(todayRecord?.sleep?.wakeTime ?? '');
  const [sleepTime, setSleepTime] = useState(todayRecord?.sleep?.sleepTime ?? '');
  const [editing, setEditing] = useState(!todayRecord?.sleep?.wakeTime && !todayRecord?.sleep?.sleepTime);

  const handleSave = () => {
    onSave(todayStr, { wakeTime: wakeTime || undefined, sleepTime: sleepTime || undefined });
    setEditing(false);
  };

  // Last 14 days sleep data for dot chart
  const chartData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(today, 13 - i);
      const ds = format(d, 'yyyy-MM-dd');
      const rec = store.records.find((r) => r.date === ds);
      const sleep = rec?.sleep;
      return {
        date: format(d, 'M/d'),
        dayLabel: format(d, 'E', { locale: ko }),
        isToday: ds === todayStr,
        wakeTime: sleep?.wakeTime,
        sleepTime: sleep?.sleepTime,
        wakeMin: sleep?.wakeTime ? timeToMinutes(sleep.wakeTime) : null,
        sleepMin: sleep?.sleepTime ? timeToMinutes(sleep.sleepTime) : null,
        hours: sleep?.wakeTime && sleep?.sleepTime ? calcSleepHours(sleep.sleepTime, sleep.wakeTime) : null,
      };
    });
  }, [store, todayStr]);

  // Y axis range for the chart (time of day)
  // Wake times typically 5:00-11:00, Sleep times 21:00-02:00
  // We'll show 21:00(prev day) to 12:00 → mapped as minutes from midnight: -180 to 720
  const yMin = -180; // 21:00 prev day
  const yMax = 720;  // 12:00
  const yRange = yMax - yMin;

  const mapToY = (minutes: number, isSleep: boolean): number => {
    let m = minutes;
    // For sleep times in the evening (>= 18:00), shift to negative (prev day perspective)
    if (isSleep && m >= 18 * 60) {
      m = m - 24 * 60;
    }
    // Clamp
    m = Math.max(yMin, Math.min(yMax, m));
    // Invert: top = later time, so higher minutes = lower Y position
    return ((m - yMin) / yRange) * 100;
  };

  const yLabels = [
    { label: '21시', min: -180 },
    { label: '0시', min: 0 },
    { label: '3시', min: 180 },
    { label: '6시', min: 360 },
    { label: '9시', min: 540 },
    { label: '12시', min: 720 },
  ];

  const avgHours = useMemo(() => {
    const valid = chartData.filter((d) => d.hours !== null);
    if (valid.length === 0) return null;
    return Math.round((valid.reduce((s, d) => s + d.hours!, 0) / valid.length) * 10) / 10;
  }, [chartData]);

  return (
    <div className="space-y-5">
      {/* Today's input */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">😴</span>
          <span className="text-xs text-white/40">오늘의 수면</span>
        </div>
        {!editing && (todayRecord?.sleep?.wakeTime || todayRecord?.sleep?.sleepTime) && (
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-1 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded-md transition-colors"
          >
            수정
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] text-white/30 mb-1">취침 (어젯밤)</label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] text-white/30 mb-1">기상</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!wakeTime && !sleepTime}
            className="px-4 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
          >
            저장
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-sm">
          {todayRecord?.sleep?.sleepTime && (
            <div className="flex items-center gap-1.5">
              <span className="text-violet-400/60 text-xs">취침</span>
              <span className="text-white/70 font-medium">{formatTime(todayRecord.sleep.sleepTime)}</span>
            </div>
          )}
          {todayRecord?.sleep?.wakeTime && (
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400/60 text-xs">기상</span>
              <span className="text-white/70 font-medium">{formatTime(todayRecord.sleep.wakeTime)}</span>
            </div>
          )}
          {todayRecord?.sleep?.wakeTime && todayRecord?.sleep?.sleepTime && (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400/60 text-xs">수면</span>
              <span className="text-white/70 font-medium">
                {calcSleepHours(todayRecord.sleep.sleepTime, todayRecord.sleep.wakeTime)}시간
              </span>
            </div>
          )}
          {!todayRecord?.sleep?.wakeTime && !todayRecord?.sleep?.sleepTime && (
            <span className="text-white/20 text-xs">기록 없음</span>
          )}
        </div>
      )}

      {/* Dot chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wider">최근 2주 수면 패턴</span>
          {avgHours !== null && (
            <span className="text-[10px] text-white/30">평균 <span className="text-emerald-400/70 font-medium">{avgHours}시간</span></span>
          )}
        </div>
        <div className="relative flex">
          {/* Y axis labels */}
          <div className="flex flex-col justify-between pr-2 shrink-0" style={{ height: '140px' }}>
            {yLabels.map((l) => (
              <span key={l.label} className="text-[9px] text-white/15 leading-none">{l.label}</span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 relative border-l border-b border-white/5" style={{ height: '140px' }}>
            {/* Horizontal guides */}
            {yLabels.map((l) => (
              <div
                key={l.min}
                className="absolute w-full border-t border-white/[0.03]"
                style={{ top: `${mapToY(l.min, false)}%` }}
              />
            ))}

            {/* Data points */}
            <div className="absolute inset-0 flex items-stretch">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 relative group">
                  {/* Sleep time dot (violet) */}
                  {d.sleepMin !== null && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-violet-500/70 border border-violet-400/50 z-10"
                      style={{ top: `${mapToY(d.sleepMin, true)}%`, marginTop: '-5px' }}
                    />
                  )}
                  {/* Wake time dot (amber) */}
                  {d.wakeMin !== null && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-500/70 border border-amber-400/50 z-10"
                      style={{ top: `${mapToY(d.wakeMin, false)}%`, marginTop: '-5px' }}
                    />
                  )}
                  {/* Connecting line */}
                  {d.sleepMin !== null && d.wakeMin !== null && (
                    <div
                      className="absolute left-1/2 w-px bg-white/10 -translate-x-1/2"
                      style={{
                        top: `${mapToY(d.sleepMin, true)}%`,
                        height: `${mapToY(d.wakeMin, false) - mapToY(d.sleepMin, true)}%`,
                      }}
                    />
                  )}
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#11151d]/95 border border-white/5 rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {d.date} {d.hours !== null ? `${d.hours}h` : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* X axis labels */}
            <div className="absolute -bottom-4 left-0 right-0 flex">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className={`text-[8px] ${d.isToday ? 'text-emerald-400 font-bold' : 'text-white/15'}`}>
                    {i % 2 === 0 ? d.date : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[9px] text-white/25">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-violet-500/70" />
            <span>취침</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500/70" />
            <span>기상</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-px h-3 bg-white/15" />
            <span>수면 시간</span>
          </div>
        </div>
      </div>
    </div>
  );
}
