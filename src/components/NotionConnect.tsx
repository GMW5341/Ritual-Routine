'use client';

import { useState } from 'react';
import { ReadingStore, NotionIntegration } from '@/lib/types';

interface Props {
  readingStore: ReadingStore;
  onSetNotion: (config: Partial<NotionIntegration>) => void;
  onDisconnect: () => void;
}

export default function NotionConnect({ readingStore, onSetNotion, onDisconnect }: Props) {
  const notion = readingStore.notion;
  const isConnected = notion?.connected ?? false;

  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState(notion?.apiKey ?? '');
  const [databaseId, setDatabaseId] = useState(notion?.databaseId ?? '');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleConnect = () => {
    if (!apiKey.trim() || !databaseId.trim()) return;
    onSetNotion({
      connected: true,
      apiKey: apiKey.trim(),
      databaseId: databaseId.trim(),
    });
    setShowConfig(false);
    setSyncMessage('연결 설정이 저장되었습니다.');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleSync = async () => {
    if (!isConnected) return;
    setSyncing(true);
    setSyncMessage('');

    try {
      // Build payload for Notion sync
      const payload = {
        apiKey: notion?.apiKey,
        databaseId: notion?.databaseId,
        books: readingStore.books.map((book) => ({
          title: book.title,
          author: book.author,
          status: book.status,
          rating: book.rating,
          totalPages: book.totalPages,
          startDate: book.startDate,
          endDate: book.endDate,
          notes: readingStore.notes
            .filter((n) => n.bookId === book.id)
            .map((n) => ({
              date: n.date,
              content: n.content,
              pagesRead: n.pagesRead,
              currentPage: n.currentPage,
            })),
        })),
      };

      // POST to Notion API (via proxy or serverless function)
      // For now, this is a placeholder — actual Notion API calls need a server-side proxy
      // to avoid exposing the API key in the browser.
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const now = new Date().toISOString();
        onSetNotion({ lastSyncAt: now });
        setSyncMessage('동기화 완료!');
      } else {
        setSyncMessage('동기화 실패. API 설정을 확인해주세요.');
      }
    } catch {
      setSyncMessage('서버에 연결할 수 없습니다. /api/notion/sync 엔드포인트를 설정해주세요.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setApiKey('');
    setDatabaseId('');
    setSyncMessage('');
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.56 2.35c-.42-.326-.98-.7-2.055-.607L3.62 2.931c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.094-.186 0-.653.327-.746l.84-.233V8.755l-1.168-.093c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933z"/>
          </svg>
          <span className="text-xs text-white/50 font-medium">Notion 연동</span>
          {isConnected && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full">연결됨</span>
          )}
        </div>
        {isConnected && !showConfig ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-2.5 py-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors disabled:opacity-50"
            >
              {syncing ? '동기화 중...' : '동기화'}
            </button>
            <button
              onClick={() => setShowConfig(true)}
              className="px-2 py-1 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 rounded-md transition-colors"
            >
              설정
            </button>
          </div>
        ) : !showConfig ? (
          <button
            onClick={() => setShowConfig(true)}
            className="px-3 py-1 text-[10px] font-medium text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-md transition-colors"
          >
            연결하기
          </button>
        ) : null}
      </div>

      {/* Sync message */}
      {syncMessage && (
        <p className={`text-[11px] ${syncMessage.includes('실패') || syncMessage.includes('연결할 수 없') ? 'text-amber-400' : 'text-emerald-400'}`}>
          {syncMessage}
        </p>
      )}

      {/* Last sync info */}
      {isConnected && notion?.lastSyncAt && !showConfig && (
        <p className="text-[10px] text-white/20">
          마지막 동기화: {new Date(notion.lastSyncAt).toLocaleString('ko-KR')}
        </p>
      )}

      {/* Config form */}
      {showConfig && (
        <div className="space-y-3 pt-1">
          <p className="text-[11px] text-white/30 leading-relaxed">
            Notion Integration Token과 Database ID를 입력하세요.
            <br />
            <span className="text-white/20">노션 설정 &gt; 연결 &gt; 내부 통합에서 토큰을 발급받을 수 있습니다.</span>
          </p>

          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Integration Token</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ntn_..."
              className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Database ID</label>
            <input
              type="text"
              value={databaseId}
              onChange={(e) => setDatabaseId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full mt-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                연결 해제
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConnect}
                disabled={!apiKey.trim() || !databaseId.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
