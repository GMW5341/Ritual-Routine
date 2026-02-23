'use client';

import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore } from '@/lib/types';
import { getOverallDailyRate } from '@/lib/stats';

interface Props {
  store: HabitStore;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onToggle: (date: string, habitId: string) => void;
}

export default function DailyTracker({ store, selectedDate, onDateChange, onToggle }: Props) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const record = store.records.find((r) => r.date === dateStr);
  const rate = getOverallDailyRate(store, dateStr);
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onDateChange(subDays(selectedDate, 1))}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
          </p>
          <p className="text-sm text-white/50 mt-1">{format(selectedDate, 'yyyy')}</p>
        </div>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Today button */}
      {!isToday && (
        <div className="flex justify-center">
          <button
            onClick={() => onDateChange(new Date())}
            className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          >
            오늘로 돌아가기
          </button>
        </div>
      )}

      {/* Daily completion rate */}
      <div className="relative mx-auto w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={rate >= 80 ? '#34d399' : rate >= 50 ? '#fbbf24' : '#f87171'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(rate / 100) * 264} 264`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{rate}%</span>
          <span className="text-xs text-white/50">달성률</span>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-2">
        {store.habits.map((habit) => {
          const done = record?.completions[habit.id] === true;
          return (
            <button
              key={habit.id}
              onClick={() => onToggle(dateStr, habit.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                done
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{habit.emoji}</span>
              <span className={`flex-1 text-left font-medium ${done ? 'text-emerald-300' : 'text-white/80'}`}>
                {habit.name}
              </span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
                }`}
              >
                {done && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
