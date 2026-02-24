'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Book, ReadingNote, ReadingStore } from '@/lib/types';
import { getBookNotes, getReadingProgress, getTotalPagesRead } from '@/lib/readingStorage';

interface Props {
  readingStore: ReadingStore;
  book: Book;
  onAddNote: (bookId: string, content: string, pagesRead?: number, currentPage?: number) => void;
  onUpdateNote: (noteId: string, updates: { content?: string; pagesRead?: number; currentPage?: number }) => void;
  onRemoveNote: (noteId: string) => void;
  onUpdateBook: (bookId: string, updates: { status?: Book['status']; rating?: number }) => void;
  onRemoveBook: (bookId: string) => void;
  onBack: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  'want-to-read': '읽고 싶은',
  reading: '읽는 중',
  completed: '완독',
  paused: '중단',
};

export default function ReadingNoteEditor({
  readingStore,
  book,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onUpdateBook,
  onRemoveBook,
  onBack,
}: Props) {
  const notes = getBookNotes(readingStore, book.id);
  const progress = getReadingProgress(readingStore, book.id);
  const totalRead = getTotalPagesRead(readingStore, book.id);

  const [showForm, setShowForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [noteContent, showForm]);

  const handleSubmitNote = () => {
    if (!noteContent.trim()) return;
    if (editingNoteId) {
      onUpdateNote(editingNoteId, {
        content: noteContent.trim(),
        pagesRead: pagesRead ? parseInt(pagesRead, 10) : undefined,
        currentPage: currentPage ? parseInt(currentPage, 10) : undefined,
      });
    } else {
      onAddNote(
        book.id,
        noteContent.trim(),
        pagesRead ? parseInt(pagesRead, 10) : undefined,
        currentPage ? parseInt(currentPage, 10) : undefined
      );
    }
    resetForm();
  };

  const startEdit = (note: ReadingNote) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
    setPagesRead(note.pagesRead?.toString() ?? '');
    setCurrentPage(note.currentPage?.toString() ?? '');
    setShowForm(true);
  };

  const resetForm = () => {
    setNoteContent('');
    setPagesRead('');
    setCurrentPage('');
    setEditingNoteId(null);
    setShowForm(false);
  };

  const handleDeleteBook = () => {
    onRemoveBook(book.id);
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="mt-1 p-1 text-white/40 hover:text-white/70 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="w-8 h-10 rounded-sm shrink-0"
              style={{ backgroundColor: book.coverColor + '40', borderLeft: `3px solid ${book.coverColor}` }}
            />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{book.title}</h2>
              {book.author && <p className="text-xs text-white/40">{book.author}</p>}
            </div>
          </div>

          {/* Book meta */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <select
              value={book.status}
              onChange={(e) => onUpdateBook(book.id, { status: e.target.value as Book['status'] })}
              className="text-[10px] bg-white/[0.05] border border-white/10 rounded-md px-2 py-1 text-white/60 focus:outline-none focus:border-emerald-500/30"
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-[#1a1a1a]">{label}</option>
              ))}
            </select>

            {/* Star rating */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onUpdateBook(book.id, { rating: book.rating === star ? undefined : star })}
                  className={`text-sm transition-colors ${
                    star <= (book.rating ?? 0) ? 'text-amber-400' : 'text-white/15 hover:text-white/30'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {confirmDeleteBook ? (
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={handleDeleteBook} className="px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 rounded-md">삭제</button>
                <button onClick={() => setConfirmDeleteBook(false)} className="px-2 py-1 text-[10px] text-white/40 hover:bg-white/5 rounded-md">취소</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteBook(true)}
                className="ml-auto text-[10px] text-white/20 hover:text-red-400 transition-colors"
              >
                책 삭제
              </button>
            )}
          </div>

          {/* Progress bar */}
          {book.totalPages && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                <span>진행률</span>
                <span>{progress}% · {totalRead}/{book.totalPages}p</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Add note button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-sm text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          독서 노트 추가
        </button>
      )}

      {/* Note form */}
      {showForm && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="읽은 내용 정리, 인상 깊은 구절, 생각..."
            rows={4}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 resize-none leading-relaxed"
            autoFocus
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-white/30">읽은 페이지 수</label>
              <input
                type="number"
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                placeholder="예: 30"
                min="0"
                className="w-full mt-0.5 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-white/30">현재 페이지</label>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                placeholder="예: 120"
                min="0"
                className="w-full mt-0.5 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors">
              취소
            </button>
            <button
              onClick={handleSubmitNote}
              disabled={!noteContent.trim()}
              className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
            >
              {editingNoteId ? '수정' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">독서 노트 ({notes.length})</p>
          {notes.map((note) => (
            <div key={note.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                  <span>{format(new Date(note.date + 'T00:00:00'), 'M월 d일 (E)', { locale: ko })}</span>
                  {note.pagesRead && <span className="text-emerald-400/60">+{note.pagesRead}p</span>}
                  {note.currentPage && <span className="text-white/20">p.{note.currentPage}</span>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(note)}
                    className="px-2 py-0.5 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 rounded-md"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onRemoveNote(note.id)}
                    className="px-2 py-0.5 text-[10px] text-white/30 hover:text-red-400 hover:bg-white/5 rounded-md"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8 text-white/20 text-sm">
            아직 기록이 없습니다. 읽은 내용을 정리해보세요.
          </div>
        )
      )}
    </div>
  );
}
