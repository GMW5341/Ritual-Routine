'use client';

import { useState, useEffect, useCallback } from 'react';
import { HabitStore } from '@/lib/types';
import { loadStore, saveStore, addHabit, removeHabit, toggleHabit, setMemo, deleteMemo } from '@/lib/storage';

export function useHabitStore() {
  const [store, setStore] = useState<HabitStore | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const update = useCallback((newStore: HabitStore) => {
    setStore(newStore);
    saveStore(newStore);
  }, []);

  const handleAddHabit = useCallback(
    (name: string, emoji: string) => {
      if (!store) return;
      update(addHabit(store, name, emoji));
    },
    [store, update]
  );

  const handleRemoveHabit = useCallback(
    (habitId: string) => {
      if (!store) return;
      update(removeHabit(store, habitId));
    },
    [store, update]
  );

  const handleToggle = useCallback(
    (date: string, habitId: string) => {
      if (!store) return;
      update(toggleHabit(store, date, habitId));
    },
    [store, update]
  );

  const handleSetMemo = useCallback(
    (date: string, memo: string) => {
      if (!store) return;
      update(setMemo(store, date, memo));
    },
    [store, update]
  );

  const handleDeleteMemo = useCallback(
    (date: string) => {
      if (!store) return;
      update(deleteMemo(store, date));
    },
    [store, update]
  );

  return {
    store,
    addHabit: handleAddHabit,
    removeHabit: handleRemoveHabit,
    toggleHabit: handleToggle,
    setMemo: handleSetMemo,
    deleteMemo: handleDeleteMemo,
  };
}
