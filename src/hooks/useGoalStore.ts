'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoalStore, GoalTerm } from '@/lib/types';
import { loadGoalStore, saveGoalStore, addGoal, updateGoal, removeGoal } from '@/lib/goalStorage';

export function useGoalStore() {
  const [store, setStore] = useState<GoalStore | null>(null);

  useEffect(() => {
    setStore(loadGoalStore());
  }, []);

  const update = useCallback((newStore: GoalStore) => {
    setStore(newStore);
    saveGoalStore(newStore);
  }, []);

  const handleAddGoal = useCallback(
    (term: GoalTerm, title: string, description?: string, deadline?: string) => {
      if (!store) return;
      update(addGoal(store, term, title, description, deadline));
    },
    [store, update]
  );

  const handleUpdateGoal = useCallback(
    (goalId: string, updates: Parameters<typeof updateGoal>[2]) => {
      if (!store) return;
      update(updateGoal(store, goalId, updates));
    },
    [store, update]
  );

  const handleRemoveGoal = useCallback(
    (goalId: string) => {
      if (!store) return;
      update(removeGoal(store, goalId));
    },
    [store, update]
  );

  return {
    store,
    addGoal: handleAddGoal,
    updateGoal: handleUpdateGoal,
    removeGoal: handleRemoveGoal,
  };
}
