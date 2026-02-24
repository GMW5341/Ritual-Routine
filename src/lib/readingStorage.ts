import { ReadingStore, Book, ReadingNote, ReadingStatus, NotionIntegration } from './types';
import { v4 as uuidv4 } from 'uuid';

const READING_STORAGE_KEY = 'ritual-routine-reading';

const COVER_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
];

function randomCoverColor(): string {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

function getInitialReadingStore(): ReadingStore {
  return { books: [], notes: [] };
}

export function loadReadingStore(): ReadingStore {
  if (typeof window === 'undefined') return getInitialReadingStore();
  const raw = localStorage.getItem(READING_STORAGE_KEY);
  if (!raw) {
    const initial = getInitialReadingStore();
    saveReadingStore(initial);
    return initial;
  }
  return JSON.parse(raw) as ReadingStore;
}

export function saveReadingStore(store: ReadingStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READING_STORAGE_KEY, JSON.stringify(store));
}

// === Book CRUD ===

export function addBook(
  store: ReadingStore,
  title: string,
  author: string,
  totalPages?: number,
  status: ReadingStatus = 'want-to-read'
): ReadingStore {
  const newBook: Book = {
    id: uuidv4(),
    title,
    author,
    totalPages,
    status,
    coverColor: randomCoverColor(),
    createdAt: new Date().toISOString(),
  };
  if (status === 'reading') {
    newBook.startDate = new Date().toISOString().split('T')[0];
  }
  return { ...store, books: [...store.books, newBook] };
}

export function updateBook(
  store: ReadingStore,
  bookId: string,
  updates: Partial<Pick<Book, 'title' | 'author' | 'totalPages' | 'status' | 'rating' | 'startDate' | 'endDate'>>
): ReadingStore {
  return {
    ...store,
    books: store.books.map((b) => {
      if (b.id !== bookId) return b;
      const updated = { ...b, ...updates };
      // Auto-set dates on status change
      if (updates.status === 'reading' && !b.startDate) {
        updated.startDate = new Date().toISOString().split('T')[0];
      }
      if (updates.status === 'completed' && !b.endDate) {
        updated.endDate = new Date().toISOString().split('T')[0];
      }
      return updated;
    }),
  };
}

export function removeBook(store: ReadingStore, bookId: string): ReadingStore {
  return {
    ...store,
    books: store.books.filter((b) => b.id !== bookId),
    notes: store.notes.filter((n) => n.bookId !== bookId),
  };
}

// === Reading Note CRUD ===

export function addReadingNote(
  store: ReadingStore,
  bookId: string,
  content: string,
  pagesRead?: number,
  currentPage?: number
): ReadingStore {
  const note: ReadingNote = {
    id: uuidv4(),
    bookId,
    date: new Date().toISOString().split('T')[0],
    pagesRead,
    currentPage,
    content,
    createdAt: new Date().toISOString(),
  };
  return { ...store, notes: [...store.notes, note] };
}

export function updateReadingNote(
  store: ReadingStore,
  noteId: string,
  updates: Partial<Pick<ReadingNote, 'content' | 'pagesRead' | 'currentPage'>>
): ReadingStore {
  return {
    ...store,
    notes: store.notes.map((n) =>
      n.id === noteId ? { ...n, ...updates } : n
    ),
  };
}

export function removeReadingNote(store: ReadingStore, noteId: string): ReadingStore {
  return {
    ...store,
    notes: store.notes.filter((n) => n.id !== noteId),
  };
}

// === Notion Integration ===

export function setNotionConfig(
  store: ReadingStore,
  config: Partial<NotionIntegration>
): ReadingStore {
  return {
    ...store,
    notion: { ...store.notion, connected: false, ...config },
  };
}

export function disconnectNotion(store: ReadingStore): ReadingStore {
  return { ...store, notion: undefined };
}

// === Queries ===

export function getBookNotes(store: ReadingStore, bookId: string): ReadingNote[] {
  return store.notes
    .filter((n) => n.bookId === bookId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBooksByStatus(store: ReadingStore, status: ReadingStatus): Book[] {
  return store.books.filter((b) => b.status === status);
}

export function getReadingProgress(store: ReadingStore, bookId: string): number {
  const book = store.books.find((b) => b.id === bookId);
  if (!book?.totalPages) return 0;
  const notes = store.notes.filter((n) => n.bookId === bookId);
  const lastNoteWithPage = notes
    .filter((n) => n.currentPage !== undefined)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!lastNoteWithPage?.currentPage) return 0;
  return Math.min(Math.round((lastNoteWithPage.currentPage / book.totalPages) * 100), 100);
}

export function getTotalPagesRead(store: ReadingStore, bookId?: string): number {
  const notes = bookId
    ? store.notes.filter((n) => n.bookId === bookId)
    : store.notes;
  return notes.reduce((sum, n) => sum + (n.pagesRead ?? 0), 0);
}
