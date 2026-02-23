export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  frequency: HabitFrequency;
  createdAt: string;
}

export interface SleepRecord {
  wakeTime?: string;  // HH:mm
  sleepTime?: string; // HH:mm
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  completions: Record<string, boolean>; // habitId -> completed
  memo?: string;
  sleep?: SleepRecord;
}

export interface HabitStore {
  habits: Habit[];
  records: DailyRecord[];
}

export type ViewPeriod = 'daily' | 'monthly' | 'quarterly' | 'yearly';

export interface PeriodStats {
  label: string;
  rate: number; // 0-100
  completed: number;
  total: number;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  emoji: string;
  frequency: HabitFrequency;
  periods: PeriodStats[];
  overallRate: number;
}
