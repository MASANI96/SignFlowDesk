import { Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { PROJECT_INFO } from '../data/mockData';
import { SpecData } from '../types/signflow';

interface HeaderProps {
  spec: SpecData;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ spec, isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const activeStoreName = spec.storeName.trim() || 'CAFE & DINING ROASTERY';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title={isSidebarOpen ? '機能ガイドパネルを閉じる' : '機能ガイドパネルを開く'}
            aria-label={isSidebarOpen ? '機能ガイドパネルを閉じる' : '機能ガイドパネルを開く'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              SignFlow Desk
            </span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 truncate">
              デザイン監理・店舗看板制作支援システム [Prototype]
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 min-w-0">
          <span className="font-mono font-medium text-slate-800 whitespace-nowrap shrink-0">
            案件ID: {PROJECT_INFO.projectId}
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="font-medium text-slate-700 truncate max-w-[340px]">
            {activeStoreName} 表参道店（ファサード看板盤面）
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50">
            <Clock className="w-4 h-4 text-blue-800 shrink-0 hidden sm:block" />
            <div className="text-xs leading-tight whitespace-nowrap tabular-nums">
              <span className="text-slate-500">従来想定工数: </span>
              <span className="font-mono font-medium text-slate-700 line-through">125分</span>
              <span className="mx-1.5 text-slate-400">→</span>
              <span className="text-slate-700">導入後: </span>
              <span className="font-mono font-bold text-blue-900">16分</span>
              <span className="ml-1.5 font-semibold text-emerald-700">（▲87%削減）</span>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:hidden px-4 lg:px-6 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-medium text-slate-800 whitespace-nowrap shrink-0">
            案件ID: {PROJECT_INFO.projectId}
          </span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="truncate">{activeStoreName} 表参道店（ファサード看板盤面）</span>
        </div>
      </div>
    </header>
  );
}
