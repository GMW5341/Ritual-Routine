import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  subMonths,
  subYears,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { HabitStore, ViewPeriod, PeriodStats, HabitStats } from './types';

function getDaysInRange(start: Date, end: Date): string[] {
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
}

function calcRate(store: HabitStore, habitId: string, days: string[]): { rate: number; completed: number; total: number } {
  const total = days.length;
  if (total === 0) return { rate: 0, completed: 0, total: 0 };
  const completed = days.filter((d) => {
    const rec = store.records.find((r) => r.date === d);
    return rec?.completions[habitId] === true;
  }).length;
  return { rate: Math.round((completed / total) * 100), completed, total };
}

export function getDailyStats(store: HabitStore, baseDate: Date, daysBack: number = 30): HabitStats[] {
  const days: string[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }

  return store.habits.map((habit) => {
    const periods: PeriodStats[] = days.map((day) => {
      const rec = store.records.find((r) => r.date === day);
      const done = rec?.completions[habit.id] === true;
      return {
        label: format(parseISO(day), 'M/d'),
        rate: done ? 100 : 0,
        completed: done ? 1 : 0,
        total: 1,
      };
    });
    const { rate } = calcRate(store, habit.id, days);
    return { habitId: habit.id, habitName: habit.name, emoji: habit.emoji, periods, overallRate: rate };
  });
}

export function getMonthlyStats(store: HabitStore, baseDate: Date, monthsBack: number = 12): HabitStats[] {
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const m = subMonths(baseDate, i);
    const s = startOfMonth(m);
    const e = i === 0 ? baseDate : endOfMonth(m);
    months.push({ start: s, end: e, label: format(s, 'yyyy.MM') });
  }

  return store.habits.map((habit) => {
    const periods: PeriodStats[] = months.map(({ start, end, label }) => {
      const days = getDaysInRange(start, end);
      const { rate, completed, total } = calcRate(store, habit.id, days);
      return { label, rate, completed, total };
    });
    const allDays = months.flatMap(({ start, end }) => getDaysInRange(start, end));
    const { rate } = calcRate(store, habit.id, allDays);
    return { habitId: habit.id, habitName: habit.name, emoji: habit.emoji, periods, overallRate: rate };
  });
}

export function getQuarterlyStats(store: HabitStore, baseDate: Date): HabitStats[] {
  const quarters: { start: Date; end: Date; label: string }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = subMonths(baseDate, i * 3);
    const s = startOfQuarter(d);
    const e = i === 0 ? baseDate : endOfQuarter(d);
    const q = Math.ceil((s.getMonth() + 1) / 3);
    quarters.push({ start: s, end: e, label: `${format(s, 'yyyy')} Q${q}` });
  }

  return store.habits.map((habit) => {
    const periods: PeriodStats[] = quarters.map(({ start, end, label }) => {
      const days = getDaysInRange(start, end);
      const { rate, completed, total } = calcRate(store, habit.id, days);
      return { label, rate, completed, total };
    });
    const allDays = quarters.flatMap(({ start, end }) => getDaysInRange(start, end));
    const { rate } = calcRate(store, habit.id, allDays);
    return { habitId: habit.id, habitName: habit.name, emoji: habit.emoji, periods, overallRate: rate };
  });
}

export function getYearlyStats(store: HabitStore, baseDate: Date): HabitStats[] {
  const years: { start: Date; end: Date; label: string }[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = subYears(baseDate, i);
    const s = startOfYear(d);
    const e = i === 0 ? baseDate : endOfYear(d);
    years.push({ start: s, end: e, label: format(s, 'yyyy') });
  }

  return store.habits.map((habit) => {
    const periods: PeriodStats[] = years.map(({ start, end, label }) => {
      const days = getDaysInRange(start, end);
      const { rate, completed, total } = calcRate(store, habit.id, days);
      return { label, rate, completed, total };
    });
    const allDays = years.flatMap(({ start, end }) => getDaysInRange(start, end));
    const { rate } = calcRate(store, habit.id, allDays);
    return { habitId: habit.id, habitName: habit.name, emoji: habit.emoji, periods, overallRate: rate };
  });
}

export function getOverallDailyRate(store: HabitStore, date: string): number {
  if (store.habits.length === 0) return 0;
  const rec = store.records.find((r) => r.date === date);
  if (!rec) return 0;
  const completed = store.habits.filter((h) => rec.completions[h.id] === true).length;
  return Math.round((completed / store.habits.length) * 100);
}

export function getStreakDays(store: HabitStore, habitId: string, baseDate: Date): number {
  let streak = 0;
  const d = new Date(baseDate);
  while (true) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const rec = store.records.find((r) => r.date === dateStr);
    if (rec?.completions[habitId] === true) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
