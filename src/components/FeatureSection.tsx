import { ReactNode } from 'react';
import { FeatureId } from '../types/signflow';

interface FeatureSectionProps {
  featureId: FeatureId;
  highlightedFeatureId: FeatureId | null;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FeatureSection({
  featureId,
  highlightedFeatureId,
  title,
  subtitle,
  headerRight,
  children,
  className = '',
}: FeatureSectionProps) {
  const isHighlighted = highlightedFeatureId === featureId;

  return (
    <section
      data-feature-id={featureId}
      className={`rounded-lg border transition-all duration-200 ${
        isHighlighted
          ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50/40'
          : 'border-slate-200 bg-white'
      } ${className}`}
    >
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {isHighlighted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-700 text-white whitespace-nowrap">
                説明対象
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {headerRight && <div className="flex items-center gap-2 shrink-0">{headerRight}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
