export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  completions: Record<string, boolean>; // habitId -> completed
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
  periods: PeriodStats[];
  overallRate: number;
}
