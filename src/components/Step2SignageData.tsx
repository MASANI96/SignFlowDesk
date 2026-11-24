import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  FileCode,
  Layers,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';
import { PALETTES } from '../data/mockData';
import {
  FeatureId,
  LayoutConfig,
  LayoutTemplateId,
  PaletteId,
  QaCheckItem,
  SpecData,
} from '../types/signflow';
import { FeatureSection } from './FeatureSection';

interface Step2SignageDataProps {
  spec: SpecData;
  layout: LayoutConfig;
  onChangeLayout: (next: LayoutConfig) => void;
  onSyncColorSpec: (colorSpecLabel: string) => void;
  qaResults: QaCheckItem[];
  highlightedFeatureId: FeatureId | null;
  onGoToStep3: () => void;
}

type ExportModalKind = 'svg' | 'jsx' | null;

export function Step2SignageData({
  spec,
  layout,
  onChangeLayout,
  onSyncColorSpec,
  qaResults,
  highlightedFeatureId,
  onGoToStep3,
}: Step2SignageDataProps) {
  const [isCheckingQa, setIsCheckingQa] = useState(false);
  const [qaCheckedStamp, setQaCheckedStamp] = useState<string | null>(null);
  const [exportModal, setExportModal] = useState<ExportModalKind>(null);

  const palette = PALETTES[layout.palette];

  // Calculate board geometry inside SVG viewBox (0 0 920 400)
  const safeWidthMm = Math.max(400, spec.widthMm || 2400);
  const safeHeightMm = Math.max(200, spec.heightMm || 600);
  const ratio = safeWidthMm / safeHeightMm;

  const maxDrawW = 680;
  const maxDrawH = 220;
  let boardW = maxDrawW;
  let boardH = boardW / ratio;
  if (boardH > maxDrawH) {
    boardH = maxDrawH;
    boardW = boardH * ratio;
  }
  if (boardW < 340) {
    boardW = 340;
  }
  if (boardH < 110) {
    boardH = 110;
  }

  const boardX = (920 - boardW) / 2 + 24;
  const boardY = (380 - boardH) / 2 + 12;
  const safeMargin = Math.min(20, Math.max(12, boardH * 0.11));

  const baseTitleSize = Math.min(34, Math.max(18, boardH * 0.21)) * layout.fontSizeScale;
  const baseSubSize = Math.min(16, Math.max(10, boardH * 0.088)) * Math.min(1.22, layout.fontSizeScale);

  const hasQaFail = qaResults.some((item) => item.status === 'fail');
  const hasQaWarning = qaResults.some((item) => item.status === 'warning');

  const handleTemplateChange = (template: LayoutTemplateId) => {
    onChangeLayout({ ...layout, template });
  };

  const handlePaletteChange = (paletteId: PaletteId) => {
    onChangeLayout({ ...layout, palette: paletteId });
    onSyncColorSpec(PALETTES[paletteId].colorSpecLabel);
  };

  const handleRunQaCheck = () => {
    setIsCheckingQa(true);
    window.setTimeout(() => {
      setIsCheckingQa(false);
      const now = new Date();
      setQaCheckedStamp(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} 検証完了`
      );
    }, 450);
  };

  const renderEmblem = (cx: number, cy: number, size: number, strokeColor: string) => {
    const r = size / 2;
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <circle cx={0} cy={0} r={r} fill="none" stroke={strokeColor} strokeWidth={1.6} />
        <circle
          cx={0}
          cy={0}
          r={r * 0.78}
          fill="none"
          stroke={strokeColor}
          strokeWidth={0.8}
          strokeDasharray="2 2"
        />
        {/* Minimalist architectural coffee cup + steam vector mark */}
        <path
          d={`M ${-r * 0.34} ${-r * 0.08} L ${r * 0.34} ${-r * 0.08} L ${r * 0.24} ${r * 0.32} L ${-r * 0.24} ${r * 0.32} Z`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path
          d={`M ${r * 0.32} ${-r * 0.02} C ${r * 0.5} ${-r * 0.02}, ${r * 0.5} ${r * 0.22}, ${r * 0.28} ${r * 0.22}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.4}
        />
        <line
          x1={-r * 0.14}
          y1={-r * 0.22}
          x2={-r * 0.14}
          y2={-r * 0.42}
          stroke={strokeColor}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={-r * 0.22}
          x2={0}
          y2={-r * 0.48}
          stroke={strokeColor}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <line
          x1={r * 0.14}
          y1={-r * 0.22}
          x2={r * 0.14}
          y2={-r * 0.42}
          stroke={strokeColor}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 2-1: 盤面SVG自動レイアウトプレビュー */}
        <div className="xl:col-span-8">
          <FeatureSection
            featureId="step2-preview"
            highlightedFeatureId={highlightedFeatureId}
            title="2-1. 盤面SVG自動レイアウトプレビュー（図面連動）"
            subtitle="STEP 1の店舗表記・サイズ・仕上げ仕様をリアルタイムに反映した制作図面プレビュー"
            headerRight={
              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 tabular-nums">
                <span>
                  実寸 W{spec.widthMm} × H{spec.heightMm} mm
                </span>
                <span className="text-slate-300">|</span>
                <span>縮尺 1:10相当</span>
              </div>
            }
          >
            <div className="space-y-3">
              {/* Linked Spec Strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-3.5 py-2">
                <span>
                  <strong className="text-slate-800">材質:</strong> {spec.baseMaterial || '未指定'}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">表面:</strong>{' '}
                  {spec.surfaceFinish || '未指定（STEP 1で確認要）'}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">照明:</strong> {spec.lighting || 'なし'}
                </span>
              </div>

              {/* Architectural Drawing SVG */}
              <div className="rounded-md border border-slate-200 bg-[#F8FAFC] overflow-hidden">
                <svg
                  viewBox="0 0 920 390"
                  className="w-full h-auto block select-none"
                  role="img"
                  aria-label={`${spec.storeName} 看板盤面レイアウト図面`}
                >
                  <defs>
                    <pattern id="draftGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="0.6"
                      />
                    </pattern>
                    <marker
                      id="dimArrowStart"
                      markerWidth="8"
                      markerHeight="8"
                      refX="0"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M 8 1 L 0 4 L 8 7 Z" fill="#334155" />
                    </marker>
                    <marker
                      id="dimArrowEnd"
                      markerWidth="8"
                      markerHeight="8"
                      refX="8"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M 0 1 L 8 4 L 0 7 Z" fill="#334155" />
                    </marker>
                    <clipPath id="signBoardClip">
                      <rect x={boardX} y={boardY} width={boardW} height={boardH} rx={2} />
                    </clipPath>
                  </defs>

                  {/* Drafting Grid Background */}
                  <rect width="920" height="390" fill="url(#draftGrid)" />

                  {/* Drawing Sheet Header Info */}
                  <text
                    x="20"
                    y="24"
                    fill="#475569"
                    fontSize="10.5"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    DWG NO: PJ-2026-0412-S01 / FACADE SIGNBOARD LAYOUT
                  </text>
                  <text
                    x="900"
                    y="24"
                    textAnchor="end"
                    fill="#475569"
                    fontSize="10.5"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    UNIT: mm / SCALE 1:10
                  </text>

                  {/* Top Spotlight Indicators if lighting enabled */}
                  {spec.lighting && !spec.lighting.includes('なし') && (
                    <g opacity="0.85">
                      {[0.28, 0.72].map((pos, idx) => {
                        const lx = boardX + boardW * pos;
                        const ly = boardY - 24;
                        return (
                          <g key={idx}>
                            <line
                              x1={lx}
                              y1={ly - 10}
                              x2={lx}
                              y2={ly}
                              stroke="#475569"
                              strokeWidth="2"
                            />
                            <polygon
                              points={`${lx - 7},${ly} ${lx + 7},${ly} ${lx + 10},${ly + 8} ${lx - 10},${ly + 8}`}
                              fill="#334155"
                            />
                            <polygon
                              points={`${lx - 9},${ly + 8} ${lx + 9},${ly + 8} ${lx + 36},${boardY} ${lx - 36},${boardY}`}
                              fill="#FDE68A"
                              opacity="0.28"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Top Width Dimension Line */}
                  {layout.showGuides && (
                    <g>
                      <line
                        x1={boardX}
                        y1={boardY - 46}
                        x2={boardX}
                        y2={boardY - 6}
                        stroke="#64748B"
                        strokeWidth="0.9"
                      />
                      <line
                        x1={boardX + boardW}
                        y1={boardY - 46}
                        x2={boardX + boardW}
                        y2={boardY - 6}
                        stroke="#64748B"
                        strokeWidth="0.9"
                      />
                      <line
                        x1={boardX + 2}
                        y1={boardY - 38}
                        x2={boardX + boardW - 2}
                        y2={boardY - 38}
                        stroke="#334155"
                        strokeWidth="1.1"
                        markerStart="url(#dimArrowStart)"
                        markerEnd="url(#dimArrowEnd)"
                      />
                      <rect
                        x={boardX + boardW / 2 - 48}
                        y={boardY - 48}
                        width="96"
                        height="18"
                        fill="#F8FAFC"
                      />
                      <text
                        x={boardX + boardW / 2}
                        y={boardY - 35}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="11.5"
                        fontWeight="600"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        W {spec.widthMm} mm
                      </text>

                      {/* Left Height Dimension Line */}
                      <line
                        x1={boardX - 46}
                        y1={boardY}
                        x2={boardX - 6}
                        y2={boardY}
                        stroke="#64748B"
                        strokeWidth="0.9"
                      />
                      <line
                        x1={boardX - 46}
                        y1={boardY + boardH}
                        x2={boardX - 6}
                        y2={boardY + boardH}
                        stroke="#64748B"
                        strokeWidth="0.9"
                      />
                      <line
                        x1={boardX - 36}
                        y1={boardY + 2}
                        x2={boardX - 36}
                        y2={boardY + boardH - 2}
                        stroke="#334155"
                        strokeWidth="1.1"
                        markerStart="url(#dimArrowStart)"
                        markerEnd="url(#dimArrowEnd)"
                      />
                      <text
                        x={boardX - 44}
                        y={boardY + boardH / 2 + 4}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="11"
                        fontWeight="600"
                        fontFamily="IBM Plex Mono, monospace"
                        transform={`rotate(-90, ${boardX - 44}, ${boardY + boardH / 2})`}
                      >
                        H {spec.heightMm} mm
                      </text>
                    </g>
                  )}

                  {/* Signboard Outer Frame & Base */}
                  <rect
                    x={boardX - 3}
                    y={boardY - 3}
                    width={boardW + 6}
                    height={boardH + 6}
                    rx={3}
                    fill={palette.frameHex}
                  />
                  <rect
                    x={boardX}
                    y={boardY}
                    width={boardW}
                    height={boardH}
                    rx={1.5}
                    fill={palette.bgHex}
                  />

                  {/* Decorative Double Architectural Frame for Wide Emphasis */}
                  {layout.template === 'wide-emphasis' && (
                    <rect
                      x={boardX + 8}
                      y={boardY + 8}
                      width={boardW - 16}
                      height={boardH - 16}
                      fill="none"
                      stroke={palette.accentHex}
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  )}

                  {/* Corner Mounting Screws */}
                  {[
                    [boardX + 9, boardY + 9],
                    [boardX + boardW - 9, boardY + 9],
                    [boardX + 9, boardY + boardH - 9],
                    [boardX + boardW - 9, boardY + boardH - 9],
                  ].map(([sx, sy], i) => (
                    <g key={i}>
                      <circle cx={sx} cy={sy} r={2.6} fill="#64748B" stroke="#0F172A" strokeWidth="0.6" />
                      <line
                        x1={sx - 1.5}
                        y1={sy - 1.5}
                        x2={sx + 1.5}
                        y2={sy + 1.5}
                        stroke="#1E293B"
                        strokeWidth="0.7"
                      />
                    </g>
                  ))}

                  {/* Safe Area Margin Guide */}
                  {layout.showGuides && (
                    <g>
                      <rect
                        x={boardX + safeMargin}
                        y={boardY + safeMargin}
                        width={boardW - safeMargin * 2}
                        height={boardH - safeMargin * 2}
                        fill="none"
                        stroke={hasQaFail ? '#EF4444' : '#38BDF8'}
                        strokeWidth="1.1"
                        strokeDasharray="5 3"
                      />
                      <text
                        x={boardX + safeMargin + 4}
                        y={boardY + safeMargin + 10}
                        fill={hasQaFail ? '#FCA5A5' : '#7DD3FC'}
                        fontSize="8.5"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        SAFE AREA (MARGIN 40mm)
                      </text>
                    </g>
                  )}

                  {/* Signage Content Clipped Inside Board */}
                  <g clipPath="url(#signBoardClip)">
                    {layout.template === 'centered' && (
                      <g>
                        {renderEmblem(
                          boardX + boardW / 2,
                          boardY + boardH * 0.25,
                          Math.min(34, boardH * 0.22),
                          palette.accentHex
                        )}
                        <text
                          x={boardX + boardW / 2}
                          y={boardY + boardH * 0.56}
                          textAnchor="middle"
                          fill={palette.primaryTextHex}
                          fontSize={baseTitleSize}
                          fontWeight="700"
                          letterSpacing="2.2"
                        >
                          {spec.storeName || 'STORE NAME'}
                        </text>
                        <line
                          x1={boardX + boardW * 0.26}
                          y1={boardY + boardH * 0.67}
                          x2={boardX + boardW * 0.74}
                          y2={boardY + boardH * 0.67}
                          stroke={palette.accentHex}
                          strokeWidth="0.9"
                          opacity="0.75"
                        />
                        <text
                          x={boardX + boardW / 2}
                          y={boardY + boardH * 0.81}
                          textAnchor="middle"
                          fill={palette.subTextHex}
                          fontSize={baseSubSize}
                          fontWeight="500"
                          letterSpacing="1.1"
                        >
                          {spec.subText}
                        </text>
                      </g>
                    )}

                    {layout.template === 'split-left' && (
                      <g>
                        {renderEmblem(
                          boardX + boardW * 0.14,
                          boardY + boardH * 0.5,
                          Math.min(54, boardH * 0.4),
                          palette.accentHex
                        )}
                        <line
                          x1={boardX + boardW * 0.24}
                          y1={boardY + boardH * 0.22}
                          x2={boardX + boardW * 0.24}
                          y2={boardY + boardH * 0.78}
                          stroke={palette.accentHex}
                          strokeWidth="1"
                          opacity="0.6"
                        />
                        <text
                          x={boardX + boardW * 0.29}
                          y={boardY + boardH * 0.48}
                          textAnchor="start"
                          fill={palette.primaryTextHex}
                          fontSize={baseTitleSize * 0.94}
                          fontWeight="700"
                          letterSpacing="1.8"
                        >
                          {spec.storeName || 'STORE NAME'}
                        </text>
                        <text
                          x={boardX + boardW * 0.29}
                          y={boardY + boardH * 0.69}
                          textAnchor="start"
                          fill={palette.subTextHex}
                          fontSize={baseSubSize}
                          fontWeight="500"
                          letterSpacing="0.8"
                        >
                          {spec.subText}
                        </text>
                      </g>
                    )}

                    {layout.template === 'wide-emphasis' && (
                      <g>
                        <text
                          x={boardX + boardW / 2}
                          y={boardY + boardH * 0.49}
                          textAnchor="middle"
                          fill={palette.primaryTextHex}
                          fontSize={baseTitleSize * 1.08}
                          fontWeight="700"
                          letterSpacing="3.2"
                        >
                          {spec.storeName || 'STORE NAME'}
                        </text>
                        <g>
                          {renderEmblem(
                            boardX + boardW * 0.18,
                            boardY + boardH * 0.76,
                            Math.min(22, boardH * 0.14),
                            palette.accentHex
                          )}
                          <text
                            x={boardX + boardW * 0.52}
                            y={boardY + boardH * 0.79}
                            textAnchor="middle"
                            fill={palette.subTextHex}
                            fontSize={baseSubSize}
                            fontWeight="500"
                            letterSpacing="1.4"
                          >
                            {spec.subText}
                          </text>
                        </g>
                      </g>
                    )}
                  </g>

                  {/* Bottom Spec Caption in Drawing */}
                  <text
                    x={boardX}
                    y={boardY + boardH + 26}
                    fill="#475569"
                    fontSize="10"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    BASE: {spec.baseMaterial} | FINISH: {spec.surfaceFinish || '未指定'} | COLOR:{' '}
                    {palette.name}
                  </text>
                </svg>
              </div>
            </div>
          </FeatureSection>
        </div>

        {/* 2-2: レイアウト・デザイン微調整パネル */}
        <div className="xl:col-span-4 space-y-6">
          <FeatureSection
            featureId="step2-layout-controls"
            highlightedFeatureId={highlightedFeatureId}
            title="レイアウト・デザイン微調整"
            subtitle="設定変更は左側の盤面SVGへ即時反映されます"
          >
            <div className="space-y-4">
              {/* Template selector */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  テンプレート種別
                </div>
                <div className="space-y-1.5">
                  {(
                    [
                      { id: 'centered', label: 'A: 中央バランス配置' },
                      { id: 'split-left', label: 'B: 左シンボル＋右テキスト2段組' },
                      { id: 'wide-emphasis', label: 'C: ワイド強調レイアウト' },
                    ] as const
                  ).map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`w-full text-left px-3 py-2 rounded border text-xs font-medium transition-colors ${
                        layout.template === tpl.id
                          ? 'border-blue-800 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette selector */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  配色パターン（盤面地色 × 文字色）
                </div>
                <div className="space-y-1.5">
                  {(Object.keys(PALETTES) as PaletteId[]).map((pid) => {
                    const p = PALETTES[pid];
                    const selected = layout.palette === pid;
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => handlePaletteChange(pid)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded border text-xs transition-colors ${
                          selected
                            ? 'border-blue-800 bg-blue-50 text-blue-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-slate-300"
                            style={{ backgroundColor: p.bgHex }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-sm border border-slate-300"
                            style={{ backgroundColor: p.primaryTextHex }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font size slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>メイン文字サイズ倍率</span>
                  <span className="font-mono tabular-nums text-blue-900">
                    {Math.round(layout.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.75}
                  max={1.45}
                  step={0.05}
                  value={layout.fontSizeScale}
                  onChange={(e) =>
                    onChangeLayout({ ...layout, fontSizeScale: Number(e.target.value) })
                  }
                  className="w-full accent-blue-900 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>縮小（余白重視）</span>
                  <span>標準 100%</span>
                  <span>拡大（警告テスト）</span>
                </div>
              </div>

              {/* Guide lines toggle */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Ruler className="w-3.5 h-3.5 text-slate-500" />
                  寸法線・セーフエリア表示
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={layout.showGuides}
                  onClick={() => onChangeLayout({ ...layout, showGuides: !layout.showGuides })}
                  className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                    layout.showGuides
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {layout.showGuides ? '表示 ON' : '表示 OFF'}
                </button>
              </div>
            </div>
          </FeatureSection>
        </div>
      </div>

      {/* 2-column grid for QA Check & Illustrator Output */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 2-3: データ自動検閲 */}
        <div className="xl:col-span-7">
          <FeatureSection
            featureId="step2-qa"
            highlightedFeatureId={highlightedFeatureId}
            title="2-2. データ自動検閲（表記・はみ出し・仕様整合性チェック）"
            subtitle="仕様書との整合性・セーフエリア干渉・文字表記ルールを出稿前に検証します"
            headerRight={
              <div className="flex items-center gap-2.5">
                {qaCheckedStamp && (
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {qaCheckedStamp}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRunQaCheck}
                  disabled={isCheckingQa}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingQa ? 'animate-spin' : ''}`} />
                  データ整合性をチェック
                </button>
              </div>
            }
          >
            <div className="space-y-3">
              {qaResults.map((item) => {
                const isFail = item.status === 'fail';
                const isWarn = item.status === 'warning';
                return (
                  <div
                    key={item.id}
                    className={`flex items-start justify-between gap-3 rounded-md border p-3.5 ${
                      isFail
                        ? 'border-red-200 bg-red-50/70'
                        : isWarn
                        ? 'border-amber-200 bg-amber-50/70'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isFail ? (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{item.title}</div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                        isFail ? 'text-red-700' : isWarn ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {isFail ? '要修正' : isWarn ? '注意' : '問題なし'}
                    </span>
                  </div>
                );
              })}
            </div>
          </FeatureSection>
        </div>

        {/* 2-4: Illustrator連携出力モック */}
        <div className="xl:col-span-5">
          <FeatureSection
            featureId="step2-illustrator"
            highlightedFeatureId={highlightedFeatureId}
            title="2-3. Illustrator連携・入稿データ生成"
            subtitle="組版レイヤー構造を保持したまま製造元・Illustratorへ引き継ぎます"
          >
            <div className="space-y-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">アートボード設定</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {spec.widthMm} × {spec.heightMm} mm（縮尺 1:10）
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">テキスト処理</span>
                  <span className="font-medium text-slate-800">自動アウトライン化・トンボ生成</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">事前検閲ステータス</span>
                  <span
                    className={`font-semibold ${
                      hasQaFail
                        ? 'text-red-700'
                        : hasQaWarning
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {hasQaFail ? 'はみ出し警告あり（確認推奨）' : hasQaWarning ? '一部注意あり' : '入稿基準クリア'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setExportModal('svg')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  Illustrator用データ（.svg）を書き出し
                </button>
                <button
                  type="button"
                  onClick={() => setExportModal('jsx')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Code2 className="w-4 h-4" />
                  自動組版スクリプト（.jsx）を生成
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">データ確定後の工程</span>
                <button
                  type="button"
                  onClick={onGoToStep3}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-700"
                >
                  STEP 3 外注調整・製品チェックへ
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </FeatureSection>
        </div>
      </div>

      {/* Illustrator Export Confirmation Modal */}
      {exportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 id="export-modal-title" className="text-sm font-semibold text-slate-900">
                  {exportModal === 'svg'
                    ? 'Illustrator用入稿データ（.svg）生成完了'
                    : 'Illustrator自動組版スクリプト（.jsx）生成完了'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModal(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  出力準備完了 — アートボード（{spec.widthMm}×{spec.heightMm}mm / 縮尺1:10）および5階層レイヤー構成を生成しました。
                </span>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-2">生成レイヤー構造プレビュー</div>
                <div className="rounded border border-slate-200 divide-y divide-slate-100 font-mono text-[11px]">
                  {[
                    { layer: '01_寸法・トンボ', note: `W${spec.widthMm} × H${spec.heightMm}mm 寸法線・裁ち落としトンボ` },
                    { layer: '02_安全領域ガイド', note: '外周40mm セーフエリア（非出力ガイド属性）' },
                    { layer: '03_メイン表記（アウトライン済）', note: `${spec.storeName}（パス変換済）` },
                    { layer: '04_サブ表記・ロゴマーク', note: `${spec.subText} ＋ ベクターシンボル` },
                    { layer: '05_ベース板金・取付穴', note: `${spec.baseMaterial} / 四隅ビス位置センターマーク` },
                  ].map((row) => (
                    <div key={row.layer} className="px-3 py-2 flex items-center justify-between gap-3">
                      <span className="font-semibold text-blue-900">{row.layer}</span>
                      <span className="text-slate-600 truncate">{row.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-1.5">
                  {exportModal === 'svg' ? '出力SVGメタヘッダー抜粋' : '生成ExtendScript（.jsx）抜粋'}
                </div>
                <pre className="rounded border border-slate-200 bg-slate-900 text-slate-100 p-3 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {exportModal === 'svg'
                    ? `<!-- SignFlow Desk Export | Scale 1:10 | Outlined -->\n<svg width="${spec.widthMm / 10}mm" height="${spec.heightMm / 10}mm" viewBox="0 0 ${spec.widthMm} ${spec.heightMm}">\n  <g id="01_寸法・トンボ" />\n  <g id="03_メイン表記_OUTLINED" data-text="${spec.storeName}" />\n  <g id="05_ベース板金" data-material="${spec.baseMaterial}" />\n</svg>`
                    : `// SignFlow Desk Auto-Layout Script for Adobe Illustrator\nvar doc = app.documents.add(DocumentColorSpace.CMYK, ${((spec.widthMm / 10) * 2.83465).toFixed(1)}, ${((spec.heightMm / 10) * 2.83465).toFixed(1)});\nvar titleFrame = doc.textFrames.add();\ntitleFrame.contents = "${spec.storeName}";\ntitleFrame.createOutline(); // 自動アウトライン化`}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setExportModal(null)}
                className="px-4 py-2 rounded bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                確認して閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
