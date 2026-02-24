'use client';

import { useState, useMemo } from 'react';
import { ReadingStore, ReadingStatus, Book, NotionIntegration } from '@/lib/types';
import { getReadingProgress, getTotalPagesRead, getBookNotes } from '@/lib/readingStorage';
import BookForm from './BookForm';
import ReadingNoteEditor from './ReadingNoteEditor';
import NotionConnect from './NotionConnect';

interface Props {
  readingStore: ReadingStore;
  onAddBook: (title: string, author: string, totalPages?: number, status?: ReadingStatus) => void;
  onUpdateBook: (bookId: string, updates: Parameters<typeof import('@/lib/readingStorage').updateBook>[2]) => void;
  onRemoveBook: (bookId: string) => void;
  onAddNote: (bookId: string, content: string, pagesRead?: number, currentPage?: number) => void;
  onUpdateNote: (noteId: string, updates: { content?: string; pagesRead?: number; currentPage?: number }) => void;
  onRemoveNote: (noteId: string) => void;
  onSetNotion: (config: Partial<NotionIntegration>) => void;
  onDisconnectNotion: () => void;
}

type FilterTab = 'all' | 'reading' | 'completed' | 'want-to-read';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'reading', label: '읽는 중' },
  { key: 'completed', label: '완독' },
  { key: 'want-to-read', label: '읽고 싶은' },
];

export default function ReadingLog({
  readingStore,
  onAddBook,
  onUpdateBook,
  onRemoveBook,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onSetNotion,
  onDisconnectNotion,
}: Props) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    if (filter === 'all') return readingStore.books;
    return readingStore.books.filter((b) => b.status === filter);
  }, [readingStore.books, filter]);

  const stats = useMemo(() => {
    const reading = readingStore.books.filter((b) => b.status === 'reading').length;
    const completed = readingStore.books.filter((b) => b.status === 'completed').length;
    const totalNotes = readingStore.notes.length;
    const totalPages = getTotalPagesRead(readingStore);
    return { reading, completed, totalNotes, totalPages };
  }, [readingStore]);

  const selectedBook = selectedBookId
    ? readingStore.books.find((b) => b.id === selectedBookId)
    : null;

  // If a book is selected, show the note editor
  if (selectedBook) {
    return (
      <ReadingNoteEditor
        readingStore={readingStore}
        book={selectedBook}
        onAddNote={onAddNote}
        onUpdateNote={onUpdateNote}
        onRemoveNote={onRemoveNote}
        onUpdateBook={onUpdateBook}
        onRemoveBook={onRemoveBook}
        onBack={() => setSelectedBookId(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '읽는 중', value: stats.reading, unit: '권', color: 'text-emerald-400' },
          { label: '완독', value: stats.completed, unit: '권', color: 'text-violet-400' },
          { label: '독서 노트', value: stats.totalNotes, unit: '개', color: 'text-amber-400' },
          { label: '총 페이지', value: stats.totalPages, unit: 'p', color: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>
              {stat.value}<span className="text-xs font-normal text-white/20 ml-0.5">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs + Add button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === tab.key ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 책
        </button>
      </div>

      {/* Add book form */}
      {showAddForm && (
        <BookForm onAdd={onAddBook} onClose={() => setShowAddForm(false)} />
      )}

      {/* Book shelf */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              readingStore={readingStore}
              onClick={() => setSelectedBookId(book.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-white/20">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm">
            {filter === 'all' ? '아직 등록된 책이 없습니다.' : `${FILTER_TABS.find((t) => t.key === filter)?.label} 책이 없습니다.`}
          </p>
          <p className="text-xs mt-1 text-white/15">위의 &quot;새 책&quot; 버튼으로 추가해보세요.</p>
        </div>
      )}

      {/* Notion integration */}
      <div className="border-t border-white/5 pt-6">
        <NotionConnect
          readingStore={readingStore}
          onSetNotion={onSetNotion}
          onDisconnect={onDisconnectNotion}
        />
      </div>
    </div>
  );
}

// === BookCard sub-component ===

function BookCard({
  book,
  readingStore,
  onClick,
}: {
  book: Book;
  readingStore: ReadingStore;
  onClick: () => void;
}) {
  const progress = getReadingProgress(readingStore, book.id);
  const noteCount = getBookNotes(readingStore, book.id).length;

  const statusLabel: Record<ReadingStatus, string> = {
    'want-to-read': '읽고 싶은',
    reading: '읽는 중',
    completed: '완독',
    paused: '중단',
  };

  const statusColor: Record<ReadingStatus, string> = {
    'want-to-read': 'text-blue-400/60 bg-blue-500/10',
    reading: 'text-emerald-400/80 bg-emerald-500/10',
    completed: 'text-violet-400/80 bg-violet-500/10',
    paused: 'text-white/40 bg-white/5',
  };

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 hover:bg-white/[0.04] transition-all text-left w-full group"
    >
      {/* Book spine visual */}
      <div
        className="w-10 h-14 rounded-sm shrink-0 flex items-center justify-center text-lg transition-transform group-hover:scale-105"
        style={{ backgroundColor: book.coverColor + '25', borderLeft: `3px solid ${book.coverColor}` }}
      >
        📖
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white/80 truncate">{book.title}</h3>
            {book.author && (
              <p className="text-[11px] text-white/30 mt-0.5 truncate">{book.author}</p>
            )}
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${statusColor[book.status]}`}>
            {statusLabel[book.status]}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {/* Progress bar */}
          {book.totalPages && book.status !== 'want-to-read' && (
            <div className="flex-1">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Rating */}
          {book.rating && (
            <div className="flex items-center gap-0.5 text-[10px]">
              {Array.from({ length: book.rating }, (_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
            </div>
          )}

          {/* Note count */}
          {noteCount > 0 && (
            <span className="text-[10px] text-white/25">
              {noteCount}개 노트
            </span>
          )}
        </div>
      </div>

      <svg className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
