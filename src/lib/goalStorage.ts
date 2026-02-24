import { GoalStore, Goal, GoalTerm, GoalStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

const GOAL_STORAGE_KEY = 'ritual-routine-goals';

function getInitialGoalStore(): GoalStore {
  return { goals: [] };
}

export function loadGoalStore(): GoalStore {
  if (typeof window === 'undefined') return getInitialGoalStore();
  const raw = localStorage.getItem(GOAL_STORAGE_KEY);
  if (!raw) {
    const initial = getInitialGoalStore();
    saveGoalStore(initial);
    return initial;
  }
  return JSON.parse(raw) as GoalStore;
}

export function saveGoalStore(store: GoalStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(store));
}

export function addGoal(
  store: GoalStore,
  term: GoalTerm,
  title: string,
  description?: string,
  deadline?: string
): GoalStore {
  const goal: Goal = {
    id: uuidv4(),
    term,
    title,
    description,
    deadline,
    status: 'active',
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  return { ...store, goals: [...store.goals, goal] };
}

export function updateGoal(
  store: GoalStore,
  goalId: string,
  updates: Partial<Pick<Goal, 'title' | 'description' | 'deadline' | 'term' | 'status' | 'progress'>>
): GoalStore {
  return {
    ...store,
    goals: store.goals.map((g) => {
      if (g.id !== goalId) return g;
      const updated = { ...g, ...updates };
      if (updates.status === 'completed' && !g.completedAt) {
        updated.completedAt = new Date().toISOString();
        updated.progress = 100;
      }
      return updated;
    }),
  };
}

export function removeGoal(store: GoalStore, goalId: string): GoalStore {
  return { ...store, goals: store.goals.filter((g) => g.id !== goalId) };
}

export function getGoalsByTerm(store: GoalStore, term: GoalTerm): Goal[] {
  return store.goals.filter((g) => g.term === term);
}

export function getActiveGoals(store: GoalStore): Goal[] {
  return store.goals.filter((g) => g.status === 'active');
}
