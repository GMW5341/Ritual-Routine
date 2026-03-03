import { HabitStore, Habit, DailyRecord, HabitFrequency, SleepRecord, QuickMemo } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'ritual-routine-store';

const DEFAULT_HABITS: Omit<Habit, 'id' | 'createdAt'>[] = [
  { name: '명상', emoji: '🧘', frequency: 'daily' },
  { name: 'SNS', emoji: '📱', frequency: 'daily' },
  { name: '글쓰기', emoji: '✍️', frequency: 'daily' },
  { name: '독서', emoji: '📚', frequency: 'daily' },
  { name: '운동', emoji: '💪', frequency: 'daily' },
  { name: '찬물 샤워', emoji: '🚿', frequency: 'daily' },
  { name: '자기 긍정', emoji: '🌟', frequency: 'daily' },
  { name: '다짐 적기', emoji: '📝', frequency: 'daily' },
  { name: '피아노 연습', emoji: '🎹', frequency: 'weekly' },
  { name: '전시 감상', emoji: '🎨', frequency: 'monthly' },
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

function migrateStore(store: HabitStore): HabitStore {
  // Add frequency field to habits that don't have it (migration from old data)
  const habits = store.habits.map((h) => ({
    ...h,
    frequency: h.frequency || 'daily' as HabitFrequency,
  }));

  // Migrate old memo (string) to quickMemos format
  const records = store.records.map((r) => {
    if (r.memo && r.memo.trim()) {
      const alreadyMigrated = (r.quickMemos ?? []).some((m) => m.text === r.memo);
      if (!alreadyMigrated) {
        const migratedMemo: QuickMemo = {
          id: uuidv4(),
          text: r.memo,
          createdAt: r.date + 'T09:00:00.000Z', // approximate time
        };
        return {
          ...r,
          quickMemos: [migratedMemo, ...(r.quickMemos ?? [])],
          memo: undefined,
        };
      }
      return { ...r, memo: undefined };
    }
    return r;
  });

  return { ...store, habits, records };
}

export function loadStore(): HabitStore {
  if (typeof window === 'undefined') return getInitialStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = getInitialStore();
    saveStore(initial);
    return initial;
  }
  return migrateStore(JSON.parse(raw) as HabitStore);
}

export function saveStore(store: HabitStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function addHabit(store: HabitStore, name: string, emoji: string, frequency: HabitFrequency = 'daily'): HabitStore {
  const newHabit: Habit = {
    id: uuidv4(),
    name,
    emoji,
    frequency,
    createdAt: new Date().toISOString(),
  };
  return { ...store, habits: [...store.habits, newHabit] };
}

export function updateHabitFrequency(store: HabitStore, habitId: string, frequency: HabitFrequency): HabitStore {
  return {
    ...store,
    habits: store.habits.map((h) =>
      h.id === habitId ? { ...h, frequency } : h
    ),
  };
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

export function addQuickMemo(store: HabitStore, date: string, text: string): HabitStore {
  const memo: QuickMemo = { id: uuidv4(), text, createdAt: new Date().toISOString() };
  const existing = store.records.find((r) => r.date === date);
  if (existing) {
    return {
      ...store,
      records: store.records.map((r) =>
        r.date === date ? { ...r, quickMemos: [...(r.quickMemos ?? []), memo] } : r
      ),
    };
  }
  return { ...store, records: [...store.records, { date, completions: {}, quickMemos: [memo] }] };
}

export function removeQuickMemo(store: HabitStore, date: string, memoId: string): HabitStore {
  return {
    ...store,
    records: store.records.map((r) =>
      r.date === date ? { ...r, quickMemos: (r.quickMemos ?? []).filter((m) => m.id !== memoId) } : r
    ),
  };
}

export function updateQuickMemo(store: HabitStore, date: string, memoId: string, text: string): HabitStore {
  return {
    ...store,
    records: store.records.map((r) =>
      r.date === date
        ? { ...r, quickMemos: (r.quickMemos ?? []).map((m) => m.id === memoId ? { ...m, text } : m) }
        : r
    ),
  };
}

export function setSleep(store: HabitStore, date: string, sleep: SleepRecord): HabitStore {
  const existing = store.records.find((r) => r.date === date);
  const cleanSleep = (sleep.wakeTime || sleep.sleepTime) ? sleep : undefined;
  if (existing) {
    return {
      ...store,
      records: store.records.map((r) =>
        r.date === date ? { ...r, sleep: cleanSleep } : r
      ),
    };
  }
  return {
    ...store,
    records: [...store.records, { date, completions: {}, sleep: cleanSleep }],
  };
}
