import { useEffect, useState } from 'react';
import { FeatureGuideSidebar } from './components/FeatureGuideSidebar';
import { Header } from './components/Header';
import { Step1Requirements } from './components/Step1Requirements';
import { Step2SignageData } from './components/Step2SignageData';
import { Step3VendorInspection } from './components/Step3VendorInspection';
import { StepNavigation } from './components/StepNavigation';
import {
  INITIAL_SPEC_DATA,
  INITIAL_VENDORS,
  PALETTES,
  REQUEST_PRESETS,
} from './data/mockData';
import {
  FeatureId,
  InspectionSampleMode,
  LayoutConfig,
  SimilarCase,
  SpecData,
  StepId,
  VendorOrder,
} from './types/signflow';
import {
  evaluateSpecAlerts,
  inferPaletteFromColorSpec,
  runStep2QaChecks,
} from './utils/specAnalyzer';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<StepId>('step1');
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<FeatureId | null>(null);
  const [pendingScrollFeatureId, setPendingScrollFeatureId] = useState<FeatureId | null>(null);

  // Shared end-to-end project specification state (STEP 1 -> STEP 2 -> STEP 3)
  const [rawRequestText, setRawRequestText] = useState<string>(REQUEST_PRESETS[0].text);
  const [spec, setSpec] = useState<SpecData>(INITIAL_SPEC_DATA);
  const [citedCaseId, setCitedCaseId] = useState<string | null>(null);

  // STEP 2 layout state
  const [layout, setLayout] = useState<LayoutConfig>({
    template: 'centered',
    palette: 'matte-black',
    fontSizeScale: 1.0,
    showGuides: true,
  });

  // STEP 3 vendor & inspection state
  const [vendors, setVendors] = useState<VendorOrder[]>(INITIAL_VENDORS);
  const [inspectionMode, setInspectionMode] = useState<InspectionSampleMode>('defect');
  const [inspectionExecuted, setInspectionExecuted] = useState<boolean>(false);

  // Derived validation & QA results
  const specAlerts = evaluateSpecAlerts(spec);
  const qaResults = runStep2QaChecks(spec, layout);
  const qaIssueCount = qaResults.filter((q) => q.status !== 'pass').length;
  const inspectionPassed = inspectionExecuted && inspectionMode === 'clean';

  // Synchronized scroll after step tab switch & DOM mount
  useEffect(() => {
    if (!pendingScrollFeatureId) return;

    const rafId = window.requestAnimationFrame(() => {
      const targetEl = document.querySelector<HTMLElement>(
        `[data-feature-id="${pendingScrollFeatureId}"]`
      );
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setPendingScrollFeatureId(null);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [activeStep, pendingScrollFeatureId]);

  const handleSelectFeature = (step: StepId, featureId: FeatureId) => {
    setActiveStep(step);
    setHighlightedFeatureId(featureId);
    setPendingScrollFeatureId(featureId);
  };

  const handleUpdateSpec = (nextSpec: SpecData) => {
    setSpec(nextSpec);
    if (nextSpec.colorSpec.trim()) {
      const inferredPalette = inferPaletteFromColorSpec(nextSpec.colorSpec);
      setLayout((prev) =>
        prev.palette === inferredPalette ? prev : { ...prev, palette: inferredPalette }
      );
    }
  };

  const handleCiteCase = (similarCase: SimilarCase) => {
    const updatedSpec: SpecData = {
      ...spec,
      ...similarCase.applyFields,
    };
    setSpec(updatedSpec);
    setCitedCaseId(similarCase.id);
    if (updatedSpec.colorSpec) {
      setLayout((prev) => ({
        ...prev,
        palette: inferPaletteFromColorSpec(updatedSpec.colorSpec),
      }));
    }
  };

  const handleSyncColorSpec = (colorSpecLabel: string) => {
    setSpec((prev) => ({
      ...prev,
      colorSpec: colorSpecLabel,
    }));
  };

  const handleUpdateVendor = (vendorId: string, patch: Partial<VendorOrder>) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? { ...v, ...patch }
          : { ...v, recentlyUpdated: false }
      )
    );
  };

  // Sync palette label if needed when user inspects
  const currentPaletteName = PALETTES[layout.palette].name;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header
        spec={spec}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        <FeatureGuideSidebar
          isOpen={isSidebarOpen}
          activeStep={activeStep}
          highlightedFeatureId={highlightedFeatureId}
          onSelectFeature={handleSelectFeature}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <StepNavigation
            activeStep={activeStep}
            onSelectStep={(step) => {
              setActiveStep(step);
              setHighlightedFeatureId(null);
            }}
            unresolvedAlertCount={specAlerts.length}
            qaIssueCount={qaIssueCount}
            inspectionPassed={inspectionPassed}
          />

          <main className="flex-1 px-4 lg:px-6 py-6">
            <div className="max-w-[1320px] mx-auto space-y-5">
              {/* Active Project Context Summary Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-slate-900">連動中の案件仕様：</span>
                  <span>{spec.storeName || '（店舗名未設定）'}</span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    W{spec.widthMm} × H{spec.heightMm}mm
                  </span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span>{spec.baseMaterial}</span>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span>{spec.colorSpec || currentPaletteName}</span>
                </div>
                {highlightedFeatureId && (
                  <button
                    type="button"
                    onClick={() => setHighlightedFeatureId(null)}
                    className="text-xs font-medium text-blue-800 hover:text-blue-900 underline underline-offset-2 whitespace-nowrap"
                  >
                    強調表示を解除
                  </button>
                )}
              </div>

              {activeStep === 'step1' && (
                <Step1Requirements
                  rawText={rawRequestText}
                  onChangeRawText={setRawRequestText}
                  spec={spec}
                  onUpdateSpec={handleUpdateSpec}
                  alerts={specAlerts}
                  highlightedFeatureId={highlightedFeatureId}
                  citedCaseId={citedCaseId}
                  onCiteCase={handleCiteCase}
                  onGoToStep2={() => {
                    setActiveStep('step2');
                    setHighlightedFeatureId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeStep === 'step2' && (
                <Step2SignageData
                  spec={spec}
                  layout={layout}
                  onChangeLayout={setLayout}
                  onSyncColorSpec={handleSyncColorSpec}
                  qaResults={qaResults}
                  highlightedFeatureId={highlightedFeatureId}
                  onGoToStep3={() => {
                    setActiveStep('step3');
                    setHighlightedFeatureId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeStep === 'step3' && (
                <Step3VendorInspection
                  spec={spec}
                  layout={layout}
                  vendors={vendors}
                  onUpdateVendor={handleUpdateVendor}
                  inspectionMode={inspectionMode}
                  onChangeInspectionMode={setInspectionMode}
                  inspectionExecuted={inspectionExecuted}
                  onSetInspectionExecuted={setInspectionExecuted}
                  highlightedFeatureId={highlightedFeatureId}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
