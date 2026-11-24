export type StepId = 'step1' | 'step2' | 'step3';

export type FeatureId =
  | 'step1-extract'
  | 'step1-spec-check'
  | 'step1-inquiry'
  | 'step1-similar'
  | 'step2-preview'
  | 'step2-layout-controls'
  | 'step2-qa'
  | 'step2-illustrator'
  | 'step3-vendors'
  | 'step3-comm'
  | 'step3-inspection'
  | 'step3-rework';

export interface FeatureGuideItem {
  id: FeatureId;
  step: StepId;
  code: string;
  title: string;
  description: string;
  timeSaved: string;
}

export interface SpecData {
  storeName: string;
  subText: string;
  widthMm: number;
  heightMm: number;
  baseMaterial: string;
  surfaceFinish: string;
  environment: string;
  mountingMethod: string;
  colorSpec: string;
  lighting: string;
  deliveryDate: string;
}

export interface SpecAlert {
  id: string;
  field: keyof SpecData;
  severity: 'error' | 'warning';
  label: string;
  message: string;
}

export interface SimilarCase {
  id: string;
  projectCode: string;
  title: string;
  location: string;
  matchRate: number;
  tags: string[];
  productionDays: number;
  costEstimate: string;
  cautionSummary: string;
  fullNotes: string;
  specs: {
    dimensions: string;
    baseMaterial: string;
    surfaceFinish: string;
    mountingMethod: string;
    colorSpec: string;
    lighting: string;
  };
  applyFields: Partial<SpecData>;
}

export type LayoutTemplateId = 'centered' | 'split-left' | 'wide-emphasis';

export type PaletteId = 'matte-black' | 'deep-navy' | 'dark-brown';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  colorSpecLabel: string;
  bgHex: string;
  frameHex: string;
  primaryTextHex: string;
  subTextHex: string;
  accentHex: string;
}

export interface LayoutConfig {
  template: LayoutTemplateId;
  palette: PaletteId;
  fontSizeScale: number; // 0.75 to 1.45
  showGuides: boolean;
}

export interface QaCheckItem {
  id: string;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
}

export type VendorStatus = '製作中' | '検品待ち' | '手配済' | '納期変更・色校済' | '確認完了';

export interface VendorOrder {
  id: string;
  vendorName: string;
  role: string;
  scope: string;
  status: VendorStatus;
  deliveryDate: string;
  notes: string;
  recentlyUpdated?: boolean;
}

export interface CommMemoPreset {
  id: string;
  label: string;
  rawText: string;
  targetVendorId: string;
  extractedSummary: string;
  nextAction: string;
  updatedStatus: VendorStatus;
  updatedDeliveryDate: string;
  updatedNotes: string;
}

export type InspectionSampleMode = 'defect' | 'clean';

export interface InspectionDefect {
  pinNumber: number;
  id: string;
  title: string;
  expectedValue: string;
  actualValue: string;
  severity: 'critical' | 'major';
  // SVG box coordinates in viewBox 0 0 920 420
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
