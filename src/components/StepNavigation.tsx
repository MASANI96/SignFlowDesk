import { AlertTriangle, CheckCircle2, ClipboardList, Layers, Truck } from 'lucide-react';
import { StepId } from '../types/signflow';

interface StepNavigationProps {
  activeStep: StepId;
  onSelectStep: (step: StepId) => void;
  unresolvedAlertCount: number;
  qaIssueCount: number;
  inspectionPassed: boolean;
}

export function StepNavigation({
  activeStep,
  onSelectStep,
  unresolvedAlertCount,
  qaIssueCount,
  inspectionPassed,
}: StepNavigationProps) {
  const steps: Array<{
    id: StepId;
    stepNum: string;
    title: string;
    timeSaved: string;
    icon: typeof ClipboardList;
    statusText: string;
    statusTone: 'ok' | 'warn' | 'neutral';
  }> = [
    {
      id: 'step1',
      stepNum: 'STEP 1',
      title: '要件定義・情報収集',
      timeSaved: '45分 → 5分',
      icon: ClipboardList,
      statusText:
        unresolvedAlertCount === 0
          ? '仕様確定済'
          : `要確認 ${unresolvedAlertCount}件`,
      statusTone: unresolvedAlertCount === 0 ? 'ok' : 'warn',
    },
    {
      id: 'step2',
      stepNum: 'STEP 2',
      title: '盤面データ作成・Illustrator連携',
      timeSaved: '50分 → 6分',
      icon: Layers,
      statusText: qaIssueCount === 0 ? '検閲クリア' : `指摘 ${qaIssueCount}件`,
      statusTone: qaIssueCount === 0 ? 'ok' : 'warn',
    },
    {
      id: 'step3',
      stepNum: 'STEP 3',
      title: '外注調整・製品チェック',
      timeSaved: '30分 → 5分',
      icon: Truck,
      statusText: inspectionPassed ? '検品合格' : '要照合・検品',
      statusTone: inspectionPassed ? 'ok' : 'neutral',
    },
  ];

  return (
    <nav aria-label="業務工程ステップ" className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              aria-current={isActive ? 'step' : undefined}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'border-blue-800 bg-blue-950 text-white'
                  : 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                    <span className={isActive ? 'text-blue-200 font-semibold' : 'text-slate-500 font-semibold'}>
                      {step.stepNum}
                    </span>
                    <span className={isActive ? 'text-blue-400' : 'text-slate-300'}>·</span>
                    <span className={isActive ? 'text-blue-100' : 'text-slate-600'}>
                      工数 {step.timeSaved}
                    </span>
                  </div>
                  <div className="text-sm font-semibold truncate mt-0.5">{step.title}</div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                {step.statusTone === 'ok' && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`}
                  />
                )}
                {step.statusTone === 'warn' && (
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-amber-600'}`}
                  />
                )}
                <span
                  className={
                    isActive
                      ? 'text-blue-100'
                      : step.statusTone === 'ok'
                      ? 'text-emerald-700'
                      : step.statusTone === 'warn'
                      ? 'text-amber-700'
                      : 'text-slate-600'
                  }
                >
                  {step.statusText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
