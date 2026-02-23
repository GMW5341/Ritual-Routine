import { HabitStore, Habit, DailyRecord } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ritual-routine-store';

const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  { name: '명상', emoji: '🧘' },
  { name: 'SNS', emoji: '📱' },
  { name: '글쓰기', emoji: '✍️' },
  { name: '독서', emoji: '📚' },
  { name: '운동', emoji: '💪' },
  { name: '찬물 샤워', emoji: '🚿' },
  { name: '자기 긍정', emoji: '🌟' },
  { name: '다짐 적기', emoji: '📝' },
  { name: '피아노 연습', emoji: '🎹' },
  { name: '전시 감상', emoji: '🎨' },
];

function getInitialStore(): HabitStore {
  const now = new Date().toISOString();
  return {
    habits: DEFAULT_HABITS.map((h) => ({
      ...h,
      id: uuidv4(),
      createdAt: now,
    })),
    records: [],
  };
}

export function loadStore(): HabitStore {
  if (typeof window === 'undefined') return getInitialStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = getInitialStore();
    saveStore(initial);
    return initial;
  }
  return JSON.parse(raw) as HabitStore;
}

export function saveStore(store: HabitStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function addHabit(store: HabitStore, name: string, emoji: string): HabitStore {
  const newHabit: Habit = {
    id: uuidv4(),
    name,
    emoji,
    createdAt: new Date().toISOString(),
  };
  return { ...store, habits: [...store.habits, newHabit] };
}

export function removeHabit(store: HabitStore, habitId: string): HabitStore {
  return {
    habits: store.habits.filter((h) => h.id !== habitId),
    records: store.records.map((r) => {
      const completions = { ...r.completions };
      delete completions[habitId];
      return { ...r, completions };
    }),
  };
}

export function toggleHabit(
  store: HabitStore,
  date: string,
  habitId: string
): HabitStore {
  const existing = store.records.find((r) => r.date === date);
  if (existing) {
    return {
      ...store,
      records: store.records.map((r) =>
        r.date === date
          ? { ...r, completions: { ...r.completions, [habitId]: !r.completions[habitId] } }
          : r
      ),
    };
  }
  const newRecord: DailyRecord = {
    date,
    completions: { [habitId]: true },
  };
  return { ...store, records: [...store.records, newRecord] };
}

export function getRecord(store: HabitStore, date: string): DailyRecord | undefined {
  return store.records.find((r) => r.date === date);
}

export function setMemo(store: HabitStore, date: string, memo: string): HabitStore {
  const existing = store.records.find((r) => r.date === date);
  if (existing) {
    return {
      ...store,
      records: store.records.map((r) =>
        r.date === date ? { ...r, memo: memo || undefined } : r
      ),
    };
  }
  const newRecord: DailyRecord = {
    date,
    completions: {},
    memo: memo || undefined,
  };
  return { ...store, records: [...store.records, newRecord] };
}

export function deleteMemo(store: HabitStore, date: string): HabitStore {
  return {
    ...store,
    records: store.records.map((r) =>
      r.date === date ? { ...r, memo: undefined } : r
    ),
  };
}
