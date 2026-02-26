'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { GoalStore, Goal, GoalTerm, GoalStatus } from '@/lib/types';

interface Props {
  goalStore: GoalStore;
  onAdd: (term: GoalTerm, title: string, description?: string, deadline?: string) => void;
  onUpdate: (goalId: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'deadline' | 'term' | 'status' | 'progress'>>) => void;
  onRemove: (goalId: string) => void;
}

const TERM_TABS: { key: GoalTerm | 'all'; label: string; sub: string }[] = [
  { key: 'all', label: '전체', sub: '' },
  { key: 'short', label: '단기', sub: '~3개월' },
  { key: 'mid', label: '중기', sub: '3~12개월' },
  { key: 'long', label: '장기', sub: '1년+' },
];

const TERM_LABELS: Record<GoalTerm, string> = { short: '단기', mid: '중기', long: '장기' };
const TERM_COLORS: Record<GoalTerm, string> = {
  short: 'text-emerald-400/80 bg-emerald-500/10',
  mid: 'text-blue-400/80 bg-blue-500/10',
  long: 'text-violet-400/80 bg-violet-500/10',
};
const TERM_ACCENT: Record<GoalTerm, string> = {
  short: 'bg-emerald-500',
  mid: 'bg-blue-500',
  long: 'bg-violet-500',
};

export default function Goals({ goalStore, onAdd, onUpdate, onRemove }: Props) {
  const [activeTerm, setActiveTerm] = useState<GoalTerm | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTerm, setFormTerm] = useState<GoalTerm>('short');
  const [formDeadline, setFormDeadline] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredGoals = useMemo(() => {
    let goals = goalStore.goals;
    if (activeTerm !== 'all') {
      goals = goals.filter((g) => g.term === activeTerm);
    }
    if (!showCompleted) {
      goals = goals.filter((g) => g.status === 'active');
    }
    // Sort: active first, then by term priority (short > mid > long), then by creation date
    const termOrder: Record<GoalTerm, number> = { short: 0, mid: 1, long: 2 };
    return [...goals].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      if (a.term !== b.term) return termOrder[a.term] - termOrder[b.term];
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [goalStore.goals, activeTerm, showCompleted]);

  const stats = useMemo(() => {
    const active = goalStore.goals.filter((g) => g.status === 'active');
    const completed = goalStore.goals.filter((g) => g.status === 'completed');
    const short = active.filter((g) => g.term === 'short').length;
    const mid = active.filter((g) => g.term === 'mid').length;
    const long = active.filter((g) => g.term === 'long').length;
    return { active: active.length, completed: completed.length, short, mid, long };
  }, [goalStore.goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    onAdd(formTerm, formTitle.trim(), formDesc.trim() || undefined, formDeadline || undefined);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormTerm('short');
    setFormDeadline('');
    setShowForm(false);
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
  };

  const handleProgressChange = (goalId: string, progress: number) => {
    onUpdate(goalId, { progress });
    if (progress >= 100) {
      onUpdate(goalId, { status: 'completed', progress: 100 });
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {[
          { label: '진행 중', value: stats.active, color: 'text-emerald-400' },
          { label: '완료', value: stats.completed, color: 'text-violet-400' },
          { label: '단기', value: stats.short, color: 'text-emerald-400' },
          { label: '중기', value: stats.mid, color: 'text-blue-400' },
          { label: '장기', value: stats.long, color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#272c38]/50 border border-[#313744]/50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-white/45 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Term filter + controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 bg-[#272c38]/60 p-0.5 rounded-lg">
          {TERM_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTerm(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTerm === tab.key ? 'bg-emerald-500 text-white' : 'text-white/55 hover:text-white/80'
              }`}
            >
              {tab.label}
              {tab.sub && <span className="text-[8px] ml-1 opacity-60">{tab.sub}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-2.5 py-1 text-[10px] rounded-md border transition-colors ${
              showCompleted
                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                : 'border-[#313744]/60 text-white/40 hover:text-white/60'
            }`}
          >
            {showCompleted ? '완료 포함' : '완료 숨김'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 목표
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#272c38]/50 border border-[#313744]/60 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white/85">새 목표 추가</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-wider">목표 *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="달성하고 싶은 목표"
                className="w-full mt-1 bg-[#272c38]/40 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-wider">세부 설명</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="구체적인 계획이나 방법 (선택)"
                rows={2}
                className="w-full mt-1 bg-[#272c38]/40 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">기간</label>
                <select
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value as GoalTerm)}
                  className="w-full mt-1 bg-[#272c38]/40 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-emerald-500/30"
                >
                  <option value="short" className="bg-[#272c38]">단기 (~3개월)</option>
                  <option value="mid" className="bg-[#272c38]">중기 (3~12개월)</option>
                  <option value="long" className="bg-[#272c38]">장기 (1년+)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">목표일</label>
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full mt-1 bg-[#272c38]/40 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-emerald-500/30 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={resetForm} className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors">
                취소
              </button>
              <button
                type="submit"
                disabled={!formTitle.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
              >
                추가
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goal list */}
      {filteredGoals.length > 0 ? (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isEditing={editingId === goal.id}
              onStartEdit={() => startEdit(goal)}
              onStopEdit={() => setEditingId(null)}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onProgressChange={handleProgressChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-white/35">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-sm">
            {activeTerm === 'all' ? '아직 설정한 목표가 없습니다.' : `${TERM_TABS.find((t) => t.key === activeTerm)?.label} 목표가 없습니다.`}
          </p>
          <p className="text-xs mt-1 text-white/25">위의 &quot;새 목표&quot; 버튼으로 추가해보세요.</p>
        </div>
      )}
    </div>
  );
}

// === GoalCard sub-component ===

function GoalCard({
  goal,
  isEditing,
  onStartEdit,
  onStopEdit,
  onUpdate,
  onRemove,
  onProgressChange,
}: {
  goal: Goal;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (goalId: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'deadline' | 'term' | 'status' | 'progress'>>) => void;
  onRemove: (goalId: string) => void;
  onProgressChange: (goalId: string, progress: number) => void;
}) {
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDesc, setEditDesc] = useState(goal.description ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isCompleted = goal.status === 'completed';
  const isDropped = goal.status === 'dropped';

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(goal.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
    });
    onStopEdit();
  };

  const deadlineStr = goal.deadline
    ? format(new Date(goal.deadline + 'T00:00:00'), 'yyyy.M.d', { locale: ko })
    : null;

  const isOverdue = goal.deadline && goal.status === 'active' && new Date(goal.deadline) < new Date();

  return (
    <div className={`bg-[#272c38]/40 border rounded-xl p-4 transition-all ${
      isCompleted ? 'border-emerald-500/15 opacity-60' : isDropped ? 'border-[#313744]/40 opacity-40' : 'border-[#313744]/50'
    }`}>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-[#272c38]/40 border border-[#313744]/60 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-emerald-500/30"
            autoFocus
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="세부 설명 (선택)"
            rows={2}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onStopEdit} className="px-2 py-1 text-[10px] text-white/40 hover:bg-white/5 rounded-md">취소</button>
            <button onClick={handleSaveEdit} className="px-3 py-1 text-[10px] font-medium bg-emerald-500 text-white rounded-md">저장</button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => onUpdate(goal.id, { status: isCompleted ? 'active' : 'completed' })}
              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                isCompleted
                  ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                  : 'border-white/15 hover:border-white/30'
              }`}
            >
              {isCompleted && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm font-semibold ${isCompleted ? 'text-white/45 line-through' : 'text-white/85'}`}>
                  {goal.title}
                </h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${TERM_COLORS[goal.term]}`}>
                  {TERM_LABELS[goal.term]}
                </span>
                {deadlineStr && (
                  <span className={`text-[9px] ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
                    {isOverdue ? '기한 초과 ' : ''}{deadlineStr}
                  </span>
                )}
              </div>

              {goal.description && (
                <p className="text-xs text-white/50 mt-1 leading-relaxed whitespace-pre-wrap">{goal.description}</p>
              )}

              {/* Progress bar */}
              {goal.status === 'active' && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${TERM_ACCENT[goal.term]}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/45 shrink-0 w-8 text-right">{goal.progress}%</span>
                </div>
              )}

              {/* Progress slider (only for active goals) */}
              {goal.status === 'active' && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goal.progress}
                  onChange={(e) => onProgressChange(goal.id, parseInt(e.target.value, 10))}
                  className="w-full mt-1 h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-runnable-track]:bg-white/5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onStartEdit} className="p-1 text-white/30 hover:text-white/60 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => onRemove(goal.id)} className="px-1.5 py-0.5 text-[9px] text-red-400 hover:bg-red-500/10 rounded">삭제</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-1.5 py-0.5 text-[9px] text-white/30 hover:bg-white/5 rounded">취소</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="p-1 text-white/30 hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
