import { ArrowRight, BookOpen, PanelLeftClose } from 'lucide-react';
import { FEATURE_GUIDE_ITEMS } from '../data/mockData';
import { FeatureId, StepId } from '../types/signflow';

interface FeatureGuideSidebarProps {
  isOpen: boolean;
  activeStep: StepId;
  highlightedFeatureId: FeatureId | null;
  onSelectFeature: (step: StepId, featureId: FeatureId) => void;
  onClose: () => void;
}

const STEP_LABELS: Record<StepId, string> = {
  step1: 'STEP 1：要件定義・情報収集',
  step2: 'STEP 2：盤面データ作成',
  step3: 'STEP 3：外注調整・検品',
};

export function FeatureGuideSidebar({
  isOpen,
  activeStep,
  highlightedFeatureId,
  onSelectFeature,
  onClose,
}: FeatureGuideSidebarProps) {
  if (!isOpen) return null;

  const steps: StepId[] = ['step1', 'step2', 'step3'];

  return (
    <aside
      aria-label="機能説明ガイドパネル"
      className="w-full lg:w-[310px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col"
    >
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/70">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-blue-900 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              機能説明ガイド
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              項目クリックで該当工程へ移動・強調表示
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center w-7 h-7 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0"
          title="パネルを閉じる"
          aria-label="パネルを閉じる"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-5 overflow-y-auto lg:max-h-[calc(100vh-4rem)]">
        {steps.map((step) => {
          const items = FEATURE_GUIDE_ITEMS.filter((item) => item.step === step);
          const isCurrentStep = activeStep === step;

          return (
            <div key={step} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3
                  className={`text-xs font-semibold tracking-tight ${
                    isCurrentStep ? 'text-blue-900' : 'text-slate-500'
                  }`}
                >
                  {STEP_LABELS[step]}
                </h3>
                {isCurrentStep && (
                  <span className="text-[11px] font-medium text-blue-700">表示中</span>
                )}
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const isHighlighted = highlightedFeatureId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectFeature(item.step, item.id)}
                      className={`w-full text-left p-3 rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isHighlighted
                          ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-900 leading-snug">
                          {item.code}. {item.title}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                            isHighlighted ? 'text-blue-700 translate-x-0.5' : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 tabular-nums">
                        <span className="text-slate-500">想定工数</span>
                        <span className="font-mono font-semibold text-blue-900">
                          {item.timeSaved}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
