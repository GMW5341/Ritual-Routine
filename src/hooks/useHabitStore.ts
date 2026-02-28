'use client';

import { useState, useEffect, useCallback } from 'react';
import { HabitStore, HabitFrequency, SleepRecord } from '@/lib/types';
import { loadStore, saveStore, addHabit, removeHabit, toggleHabit, setMemo, deleteMemo, setSleep, updateHabitFrequency, addQuickMemo, removeQuickMemo } from '@/lib/storage';

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
    (name: string, emoji: string, frequency: HabitFrequency = 'daily') => {
      if (!store) return;
      update(addHabit(store, name, emoji, frequency));
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

  const handleSetSleep = useCallback(
    (date: string, sleep: SleepRecord) => {
      if (!store) return;
      update(setSleep(store, date, sleep));
    },
    [store, update]
  );

  const handleUpdateFrequency = useCallback(
    (habitId: string, frequency: HabitFrequency) => {
      if (!store) return;
      update(updateHabitFrequency(store, habitId, frequency));
    },
    [store, update]
  );

  const handleAddQuickMemo = useCallback(
    (date: string, text: string) => {
      if (!store) return;
      update(addQuickMemo(store, date, text));
    },
    [store, update]
  );

  const handleRemoveQuickMemo = useCallback(
    (date: string, memoId: string) => {
      if (!store) return;
      update(removeQuickMemo(store, date, memoId));
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
    setSleep: handleSetSleep,
    updateFrequency: handleUpdateFrequency,
    addQuickMemo: handleAddQuickMemo,
    removeQuickMemo: handleRemoveQuickMemo,
  };
}
