'use client';

import { useState } from 'react';
import { ReadingStatus } from '@/lib/types';

interface Props {
  onAdd: (title: string, author: string, totalPages?: number, status?: ReadingStatus) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: 'reading', label: '읽는 중' },
  { value: 'want-to-read', label: '읽고 싶은' },
  { value: 'completed', label: '완독' },
];

export default function BookForm({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('reading');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(
      title.trim(),
      author.trim(),
      totalPages ? parseInt(totalPages, 10) : undefined,
      status
    );
    onClose();
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">새 책 추가</h3>
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white/60 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider">제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="책 제목"
            className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30"
            autoFocus
          />
        </div>

        <div>
          <label className="text-[10px] text-white/40 uppercase tracking-wider">저자</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="저자명"
            className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">총 페이지</label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="선택"
              min="1"
              className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReadingStatus)}
              className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1e2230]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  );
}
