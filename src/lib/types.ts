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

// === Reading Types ===

export type ReadingStatus = 'want-to-read' | 'reading' | 'completed' | 'paused';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages?: number;
  status: ReadingStatus;
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  rating?: number;      // 1-5
  coverColor: string;   // hex color for UI
  createdAt: string;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  date: string;         // YYYY-MM-DD
  pagesRead?: number;
  currentPage?: number;
  content: string;
  createdAt: string;
}

export interface NotionIntegration {
  connected: boolean;
  apiKey?: string;
  databaseId?: string;
  lastSyncAt?: string;
}

export interface ReadingStore {
  books: Book[];
  notes: ReadingNote[];
  notion?: NotionIntegration;
}

// === Goal Types ===

export type GoalTerm = 'short' | 'mid' | 'long';      // 단기 / 중기 / 장기
export type GoalStatus = 'active' | 'completed' | 'dropped';

export interface Goal {
  id: string;
  term: GoalTerm;
  title: string;
  description?: string;
  deadline?: string;   // YYYY-MM-DD
  status: GoalStatus;
  progress: number;    // 0-100
  createdAt: string;
  completedAt?: string;
}

export interface GoalStore {
  goals: Goal[];
}

// === View Types ===

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
