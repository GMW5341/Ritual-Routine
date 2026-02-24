'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingStore, ReadingStatus, NotionIntegration } from '@/lib/types';
import {
  loadReadingStore,
  saveReadingStore,
  addBook,
  updateBook,
  removeBook,
  addReadingNote,
  updateReadingNote,
  removeReadingNote,
  setNotionConfig,
  disconnectNotion,
} from '@/lib/readingStorage';

export function useReadingStore() {
  const [store, setStore] = useState<ReadingStore | null>(null);

  useEffect(() => {
    setStore(loadReadingStore());
  }, []);

  const update = useCallback((newStore: ReadingStore) => {
    setStore(newStore);
    saveReadingStore(newStore);
  }, []);

  const handleAddBook = useCallback(
    (title: string, author: string, totalPages?: number, status?: ReadingStatus) => {
      if (!store) return;
      update(addBook(store, title, author, totalPages, status));
    },
    [store, update]
  );

  const handleUpdateBook = useCallback(
    (bookId: string, updates: Parameters<typeof updateBook>[2]) => {
      if (!store) return;
      update(updateBook(store, bookId, updates));
    },
    [store, update]
  );

  const handleRemoveBook = useCallback(
    (bookId: string) => {
      if (!store) return;
      update(removeBook(store, bookId));
    },
    [store, update]
  );

  const handleAddNote = useCallback(
    (bookId: string, content: string, pagesRead?: number, currentPage?: number) => {
      if (!store) return;
      update(addReadingNote(store, bookId, content, pagesRead, currentPage));
    },
    [store, update]
  );

  const handleUpdateNote = useCallback(
    (noteId: string, updates: Parameters<typeof updateReadingNote>[2]) => {
      if (!store) return;
      update(updateReadingNote(store, noteId, updates));
    },
    [store, update]
  );

  const handleRemoveNote = useCallback(
    (noteId: string) => {
      if (!store) return;
      update(removeReadingNote(store, noteId));
    },
    [store, update]
  );

  const handleSetNotion = useCallback(
    (config: Partial<NotionIntegration>) => {
      if (!store) return;
      update(setNotionConfig(store, config));
    },
    [store, update]
  );

  const handleDisconnectNotion = useCallback(() => {
    if (!store) return;
    update(disconnectNotion(store));
  }, [store, update]);

  return {
    store,
    addBook: handleAddBook,
    updateBook: handleUpdateBook,
    removeBook: handleRemoveBook,
    addNote: handleAddNote,
    updateNote: handleUpdateNote,
    removeNote: handleRemoveNote,
    setNotion: handleSetNotion,
    disconnectNotion: handleDisconnectNotion,
  };
}
