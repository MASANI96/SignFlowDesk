import { useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Mail,
  MessageSquareText,
  ScanSearch,
  Truck,
} from 'lucide-react';
import { COMM_MEMO_PRESETS, PALETTES } from '../data/mockData';
import {
  FeatureId,
  InspectionSampleMode,
  LayoutConfig,
  SpecData,
  VendorOrder,
} from '../types/signflow';
import {
  buildCorruptedInspectionStrings,
  buildInspectionDefects,
  generateReworkMessage,
} from '../utils/specAnalyzer';
import { FeatureSection } from './FeatureSection';

interface Step3VendorInspectionProps {
  spec: SpecData;
  layout: LayoutConfig;
  vendors: VendorOrder[];
  onUpdateVendor: (vendorId: string, patch: Partial<VendorOrder>) => void;
  inspectionMode: InspectionSampleMode;
  onChangeInspectionMode: (mode: InspectionSampleMode) => void;
  inspectionExecuted: boolean;
  onSetInspectionExecuted: (executed: boolean) => void;
  highlightedFeatureId: FeatureId | null;
}

export function Step3VendorInspection({
  spec,
  layout,
  vendors,
  onUpdateVendor,
  inspectionMode,
  onChangeInspectionMode,
  inspectionExecuted,
  onSetInspectionExecuted,
  highlightedFeatureId,
}: Step3VendorInspectionProps) {
  const [selectedMemoId, setSelectedMemoId] = useState<string>(COMM_MEMO_PRESETS[0].id);
  const [memoText, setMemoText] = useState<string>(COMM_MEMO_PRESETS[0].rawText);
  const [isParsingComm, setIsParsingComm] = useState(false);
  const [commResult, setCommResult] = useState<{
    summary: string;
    nextAction: string;
    vendorName: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [copiedRework, setCopiedRework] = useState(false);

  const palette = PALETTES[layout.palette];
  const defects = buildInspectionDefects(spec);
  const corrupted = buildCorruptedInspectionStrings(spec);

  const primaryVendor = vendors[0]?.vendorName || '株式会社東京サイン製作所';
  const reworkMessage = generateReworkMessage(spec, inspectionMode, defects, primaryVendor);

  const handleSelectMemoPreset = (presetId: string) => {
    const found = COMM_MEMO_PRESETS.find((m) => m.id === presetId);
    if (!found) return;
    setSelectedMemoId(found.id);
    setMemoText(found.rawText);
    setCommResult(null);
  };

  const handleApplyCommToLedger = () => {
    if (isParsingComm || !memoText.trim()) return;
    setIsParsingComm(true);

    window.setTimeout(() => {
      const preset = COMM_MEMO_PRESETS.find((p) => p.rawText.trim() === memoText.trim());
      if (preset) {
        onUpdateVendor(preset.targetVendorId, {
          status: preset.updatedStatus,
          deliveryDate: preset.updatedDeliveryDate,
          notes: preset.updatedNotes,
          recentlyUpdated: true,
        });
        const vName = vendors.find((v) => v.id === preset.targetVendorId)?.vendorName || '';
        setCommResult({
          summary: preset.extractedSummary,
          nextAction: preset.nextAction,
          vendorName: vName,
        });
      } else {
        // Fallback dynamic extraction for custom edited memo
        const isElec = /三和電装|電装|LED|スポット/.test(memoText);
        const targetId = isElec ? 'vendor-sanwa-elec' : 'vendor-tokyo-sign';
        const dateMatch = memoText.match(/(?:から|→)\s*(\d{1,2})\/(\d{1,2})/);
        const singleDate = memoText.match(/(\d{1,2})\/(\d{1,2})/);
        let newDate = isElec ? '2026-05-11' : '2026-05-13';
        if (dateMatch) {
          newDate = `2026-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
        } else if (singleDate) {
          newDate = `2026-${singleDate[1].padStart(2, '0')}-${singleDate[2].padStart(2, '0')}`;
        }
        const newStatus = /遅れ|変更/.test(memoText) ? '納期変更・色校済' : '確認完了';
        onUpdateVendor(targetId, {
          status: newStatus,
          deliveryDate: newDate,
          notes: '履歴解析より自動反映：変更内容確認済',
          recentlyUpdated: true,
        });
        const vName = vendors.find((v) => v.id === targetId)?.vendorName || '';
        setCommResult({
          summary: `連絡履歴から更新予定日（${newDate}）およびステータス（${newStatus}）を抽出しました。`,
          nextAction: `${vName}の台帳ステータスを更新しました。関連工程へ共有してください。`,
          vendorName: vName,
        });
      }
      setIsParsingComm(false);
    }, 550);
  };

  const handleModeSwitch = (mode: InspectionSampleMode) => {
    onChangeInspectionMode(mode);
    onSetInspectionExecuted(false);
  };

  const handleRunInspection = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(15);
    onSetInspectionExecuted(false);

    window.setTimeout(() => setScanProgress(58), 230);
    window.setTimeout(() => setScanProgress(95), 500);
    window.setTimeout(() => {
      setIsScanning(false);
      setScanProgress(0);
      onSetInspectionExecuted(true);
    }, 720);
  };

  const handleCopyRework = async () => {
    try {
      await navigator.clipboard.writeText(reworkMessage);
      setCopiedRework(true);
      window.setTimeout(() => setCopiedRework(false), 2000);
    } catch {
      setCopiedRework(true);
      window.setTimeout(() => setCopiedRework(false), 2000);
    }
  };

  const getStatusStyle = (status: VendorOrder['status']) => {
    switch (status) {
      case '確認完了':
        return 'text-emerald-700 font-semibold';
      case '納期変更・色校済':
        return 'text-amber-700 font-semibold';
      case '検品待ち':
        return 'text-blue-800 font-semibold';
      default:
        return 'text-slate-700 font-medium';
    }
  };

  const boardTitleText =
    inspectionMode === 'defect' ? corrupted.corruptedTitle : spec.storeName || 'CAFE & DINING ROASTERY';
  const boardSubText =
    inspectionMode === 'defect'
      ? corrupted.corruptedSubText
      : spec.subText || 'Specialty Coffee & Bistro / OPEN 11:00-22:00';

  return (
    <div className="space-y-6">
      {/* 3-1: 製造元・外注先 納期＆ステータス管理台帳 */}
      <FeatureSection
        featureId="step3-vendors"
        highlightedFeatureId={highlightedFeatureId}
        title="3-1. 製造元・外注先 納期・ステータス管理台帳"
        subtitle="協力会社ごとの発注範囲・進捗・納品予定日を一元管理します"
        headerRight={
          <div className="flex items-center gap-1.5 text-xs text-slate-600 tabular-nums">
            <Truck className="w-4 h-4 text-slate-500" />
            <span>施工予定日：{spec.deliveryDate}</span>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-3.5">発注先業者・担当</th>
                <th className="py-2.5 px-3.5">発注内容・仕様</th>
                <th className="py-2.5 px-3.5 w-[150px]">ステータス</th>
                <th className="py-2.5 px-3.5 w-[125px]">予定納期</th>
                <th className="py-2.5 px-3.5">連絡メモ・特記事項</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className={`transition-colors ${
                    vendor.recentlyUpdated ? 'bg-blue-50/70' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{vendor.vendorName}</span>
                      {vendor.recentlyUpdated && (
                        <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                          更新済
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{vendor.role}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">{vendor.scope}</td>
                  <td className={`py-3 px-3.5 whitespace-nowrap ${getStatusStyle(vendor.status)}`}>
                    {vendor.status}
                  </td>
                  <td className="py-3 px-3.5 font-mono tabular-nums text-slate-900 whitespace-nowrap">
                    {vendor.deliveryDate}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{vendor.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FeatureSection>

      {/* 3-2: やり取り履歴の自動要約＆台帳反映 */}
      <FeatureSection
        featureId="step3-comm"
        highlightedFeatureId={highlightedFeatureId}
        title="3-2. やり取り履歴の自動要約・台帳反映"
        subtitle="電話メモやチャット履歴から納期変更・決定事項を抽出し、上の管理台帳へ即座に反映します"
        headerRight={
          <div className="flex items-center gap-1.5 flex-wrap">
            {COMM_MEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectMemoPreset(preset.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors whitespace-nowrap ${
                  selectedMemoId === preset.id && memoText === preset.rawText
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3">
            <textarea
              rows={4}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                業者名・変更後納期・色校承認等の決定事項を抽出します。
              </span>
              <button
                type="button"
                onClick={handleApplyCommToLedger}
                disabled={isParsingComm || !memoText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <MessageSquareText className="w-4 h-4" />
                {isParsingComm ? '履歴を解析中...' : '履歴を解析して台帳へ反映'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 h-full">
              <div className="text-xs font-semibold text-slate-800 mb-2">抽出結果・次回アクション</div>
              {commResult ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{commResult.vendorName} の台帳を更新しました</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="text-[11px] font-semibold text-slate-500">決定事項サマリー</div>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{commResult.summary}</p>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">監理担当の次回アクション</div>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{commResult.nextAction}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  左記の連絡メモを選択または編集し、「履歴を解析して台帳へ反映」を実行すると、決定事項の要約と管理台帳の自動更新が行われます。
                </p>
              )}
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* 3-3: 納品製品 写真照合チェック（SVG工場検品ビジュアル） */}
      <FeatureSection
        featureId="step3-inspection"
        highlightedFeatureId={highlightedFeatureId}
        title="3-3. 納品製品 写真照合チェック（工場出荷前検品）"
        subtitle="工場作業台で撮影された仕上がり写真と、STEP 1・2の確定仕様書を自動照合します"
        headerRight={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => handleModeSwitch('defect')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  inspectionMode === 'defect'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                初回納品（不備ありサンプル）
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('clean')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                  inspectionMode === 'clean'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                再製作後（正常サンプル）
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunInspection}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              <ScanSearch className="w-4 h-4" />
              {isScanning ? '照合スキャン中...' : '仕様書と照合チェックを実行'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {isScanning && (
            <div className="rounded-md border border-blue-200 bg-blue-50/70 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-blue-900">
                <span>
                  納品製品画像から文字領域・寸法比率・外周枠パーツを抽出し、仕様書（{spec.storeName}）と照合中...
                </span>
                <span className="font-mono tabular-nums">{scanProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-700 transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            {/* SVG Factory Workbench Inspection Photo */}
            <div className="xl:col-span-7 flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
                <span className="inline-flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  撮影場所：東京サイン製作所 第2検査場 作業台（検品写真データ）
                </span>
                <span>
                  {inspectionMode === 'defect' ? 'LOT: 20260513-A (初回)' : 'LOT: 20260514-R (再製作)'}
                </span>
              </div>

              <div className="rounded-md border border-slate-300 bg-slate-900 overflow-hidden flex-1">
                <svg
                  viewBox="0 0 920 420"
                  className="w-full h-full block select-none"
                  role="img"
                  aria-label="工場作業台での看板盤面検品写真"
                >
                  <defs>
                    <radialGradient id="studioOverhead" cx="50%" cy="42%" r="65%">
                      <stop offset="0%" stopColor="#475569" stopOpacity="0.45" />
                      <stop offset="65%" stopColor="#1E293B" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
                    </radialGradient>
                    <pattern id="benchMatGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path
                        d="M 32 0 L 0 0 0 32"
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="0.45"
                        opacity="0.3"
                      />
                    </pattern>
                    <linearGradient id="aluminumRuler" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E2E8F0" />
                      <stop offset="50%" stopColor="#CBD5E1" />
                      <stop offset="100%" stopColor="#94A3B8" />
                    </linearGradient>
                    <filter id="boardShadow" x="-5%" y="-10%" width="110%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.65" />
                    </filter>
                  </defs>

                  {/* Factory Workbench Mat Surface */}
                  <rect width="920" height="420" fill="#1E293B" />
                  <rect width="920" height="420" fill="url(#benchMatGrid)" />
                  <rect width="920" height="420" fill="url(#studioOverhead)" />

                  {/* Workbench Edge & Top Protective Foam Blocks */}
                  <rect x="0" y="0" width="920" height="16" fill="#0F172A" />
                  <rect x="0" y="404" width="920" height="16" fill="#0F172A" />
                  <rect x="145" y="72" width="54" height="22" rx="2" fill="#334155" />
                  <rect x="720" y="72" width="54" height="22" rx="2" fill="#334155" />
                  <rect x="145" y="274" width="54" height="22" rx="2" fill="#334155" />
                  <rect x="720" y="274" width="54" height="22" rx="2" fill="#334155" />

                  {/* Color Calibration Card at Top-Left of Workbench */}
                  <g transform="translate(26, 26)">
                    <rect x="0" y="0" width="96" height="34" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="0.8" />
                    <rect x="6" y="6" width="14" height="12" fill="#06B6D4" />
                    <rect x="23" y="6" width="14" height="12" fill="#EC4899" />
                    <rect x="40" y="6" width="14" height="12" fill="#EAB308" />
                    <rect x="57" y="6" width="14" height="12" fill="#18181B" />
                    <rect x="74" y="6" width="16" height="12" fill="#F8FAFC" />
                    <text x="6" y="28" fill="#94A3B8" fontSize="7.5" fontFamily="IBM Plex Mono, monospace">
                      COLOR REF / D65
                    </text>
                  </g>

                  {/* Fabricated Signboard on Workbench */}
                  <g filter="url(#boardShadow)">
                    {/* Outer Aluminum Frame */}
                    <rect x="100" y="88" width="720" height="190" rx="2.5" fill={palette.frameHex} />
                    {/* Board Surface */}
                    <rect x="106" y="94" width="708" height="178" rx="1.5" fill={palette.bgHex} />

                    {/* Right-side color defect in defect mode */}
                    {inspectionMode === 'defect' && (
                      <rect
                        x="756"
                        y="94"
                        width="58"
                        height="178"
                        fill="#475569"
                        opacity="0.28"
                      />
                    )}

                    {/* Inner trim border: right side missing in defect mode */}
                    {inspectionMode === 'clean' ? (
                      <rect
                        x="114"
                        y="102"
                        width="692"
                        height="162"
                        fill="none"
                        stroke={palette.accentHex}
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                    ) : (
                      <polyline
                        points="750,102 114,102 114,264 750,264"
                        fill="none"
                        stroke={palette.accentHex}
                        strokeWidth="1.2"
                        opacity="0.8"
                      />
                    )}

                    {/* Corner Mounting Screws (right screws missing in defect mode) */}
                    <circle cx="118" cy="106" r="2.8" fill="#94A3B8" />
                    <circle cx="118" cy="260" r="2.8" fill="#94A3B8" />
                    {inspectionMode === 'clean' && (
                      <>
                        <circle cx="802" cy="106" r="2.8" fill="#94A3B8" />
                        <circle cx="802" cy="260" r="2.8" fill="#94A3B8" />
                      </>
                    )}

                    {/* Emblem Mark on Left */}
                    <g transform="translate(182, 183)">
                      <circle cx="0" cy="0" r="28" fill="none" stroke={palette.accentHex} strokeWidth="1.6" />
                      <path
                        d="M -11 -3 L 11 -3 L 8 11 L -8 11 Z"
                        fill="none"
                        stroke={palette.accentHex}
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 10 -1 C 17 -1, 17 8, 9 8"
                        fill="none"
                        stroke={palette.accentHex}
                        strokeWidth="1.4"
                      />
                      <line x1="-5" y1="-9" x2="-5" y2="-16" stroke={palette.accentHex} strokeWidth="1.2" />
                      <line x1="0" y1="-9" x2="0" y2="-18" stroke={palette.accentHex} strokeWidth="1.2" />
                      <line x1="5" y1="-9" x2="5" y2="-16" stroke={palette.accentHex} strokeWidth="1.2" />
                    </g>

                    <line
                      x1="232"
                      y1="126"
                      x2="232"
                      y2="240"
                      stroke={palette.accentHex}
                      strokeWidth="1"
                      opacity="0.55"
                    />

                    {/* Main Store Title Text */}
                    <text
                      x="256"
                      y="174"
                      textAnchor="start"
                      fill={palette.primaryTextHex}
                      fontSize="30"
                      fontWeight="700"
                      letterSpacing="2"
                    >
                      {boardTitleText}
                    </text>

                    {/* Subtext */}
                    <text
                      x="256"
                      y="224"
                      textAnchor="start"
                      fill={palette.subTextHex}
                      fontSize="14.5"
                      fontWeight="500"
                      letterSpacing="0.8"
                    >
                      {boardSubText}
                    </text>

                    {/* Subtle Matte Lamination Sheen Diagonal */}
                    <polygon
                      points="106,94 310,94 210,272 106,272"
                      fill="#FFFFFF"
                      opacity="0.035"
                    />
                  </g>

                  {/* Physical Aluminum Inspection Scale Ruler at Bottom */}
                  <g transform="translate(100, 326)">
                    <rect
                      x="0"
                      y="0"
                      width="720"
                      height="32"
                      rx="1.5"
                      fill="url(#aluminumRuler)"
                      stroke="#64748B"
                      strokeWidth="0.8"
                    />
                    {Array.from({ length: 49 }).map((_, idx) => {
                      const tx = idx * 15;
                      const isMajor = idx % 8 === 0;
                      const isMid = idx % 4 === 0;
                      return (
                        <g key={idx}>
                          <line
                            x1={tx}
                            y1={0}
                            x2={tx}
                            y2={isMajor ? 14 : isMid ? 10 : 6}
                            stroke="#1E293B"
                            strokeWidth={isMajor ? 1.1 : 0.7}
                          />
                          {isMajor && (
                            <text
                              x={tx + 2}
                              y={25}
                              fill="#0F172A"
                              fontSize="8.5"
                              fontFamily="IBM Plex Mono, monospace"
                            >
                              {Math.round((idx / 48) * (spec.widthMm || 2400))}
                            </text>
                          )}
                        </g>
                      );
                    })}
                    <text
                      x="712"
                      y="25"
                      textAnchor="end"
                      fill="#334155"
                      fontSize="8.5"
                      fontWeight="600"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      INSPECTION SCALE (mm)
                    </text>
                  </g>

                  {/* Inspection Timestamp Watermark (Camera Stamp) */}
                  <text
                    x="894"
                    y="394"
                    textAnchor="end"
                    fill="#94A3B8"
                    fontSize="10"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    2026-05-13 10:24:18 | QC-CAM-02
                  </text>

                  {/* Scanning Beam Overlay */}
                  {isScanning && (
                    <g>
                      <line
                        x1="100"
                        y1={94 + (scanProgress / 100) * 180}
                        x2="820"
                        y2={94 + (scanProgress / 100) * 180}
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="100"
                        y="94"
                        width="720"
                        height={(scanProgress / 100) * 180}
                        fill="#38BDF8"
                        opacity="0.12"
                      />
                    </g>
                  )}

                  {/* Red Defect Bounding Boxes & Number Pins (Defect Mode + Executed) */}
                  {inspectionExecuted && inspectionMode === 'defect' && (
                    <g>
                      {defects.map((defect) => (
                        <g key={defect.id}>
                          <rect
                            x={defect.box.x}
                            y={defect.box.y}
                            width={defect.box.width}
                            height={defect.box.height}
                            fill="#EF4444"
                            fillOpacity="0.14"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeDasharray="6 3"
                            rx="2"
                          />
                          {/* Pin Badge */}
                          <circle
                            cx={defect.box.x}
                            cy={defect.box.y}
                            r="12"
                            fill="#DC2626"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          <text
                            x={defect.box.x}
                            y={defect.box.y + 4}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="11.5"
                            fontWeight="700"
                            fontFamily="IBM Plex Mono, monospace"
                          >
                            {defect.pinNumber}
                          </text>
                        </g>
                      ))}
                    </g>
                  )}

                  {/* Green Pass Verification Frame (Clean Mode + Executed) */}
                  {inspectionExecuted && inspectionMode === 'clean' && (
                    <g>
                      <rect
                        x="102"
                        y="90"
                        width="716"
                        height="186"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        rx="3"
                      />
                      <rect x="650" y="64" width="168" height="22" rx="3" fill="#059669" />
                      <text
                        x="734"
                        y="79"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="700"
                      >
                        仕様書完全一致（合格）
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Inspection Report Panel */}
            <div className="xl:col-span-5 flex flex-col">
              <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-blue-900" />
                      <h3 className="text-xs font-semibold text-slate-900">照合検品レポート</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      基準：{spec.storeName}
                    </span>
                  </div>

                  {!inspectionExecuted && !isScanning && (
                    <div className="rounded border border-slate-200 bg-white p-4 text-xs text-slate-600 leading-relaxed space-y-2">
                      <p>
                        上の「仕様書と照合チェックを実行」ボタンを押すと、納品写真の文字表記・営業時間・外周枠パーツをSTEP 1・2の仕様書と自動照合します。
                      </p>
                      <p className="text-[11px] text-slate-500">
                        現在選択中のサンプル：
                        <strong className="text-slate-800">
                          {inspectionMode === 'defect'
                            ? '初回納品（不備ありサンプル）'
                            : '再製作後（正常サンプル）'}
                        </strong>
                      </p>
                    </div>
                  )}

                  {inspectionExecuted && inspectionMode === 'defect' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>仕様書との不一致を {defects.length}件 検出しました（再製作推奨）</span>
                      </div>

                      {defects.map((defect) => (
                        <div
                          key={defect.id}
                          className="rounded border border-red-200 bg-white p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-mono text-[11px] mr-1.5">
                                {defect.pinNumber}
                              </span>
                              {defect.title}
                            </span>
                            <span className="text-[11px] font-semibold text-red-700 whitespace-nowrap">
                              要修正
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-1 pt-1 text-[11px] border-t border-slate-100">
                            <div className="text-slate-600">
                              <span className="font-semibold text-slate-800">仕様書（正）：</span>
                              <span className="font-mono">{defect.expectedValue}</span>
                            </div>
                            <div className="text-red-700">
                              <span className="font-semibold">納品写真（誤）：</span>
                              <span className="font-mono">{defect.actualValue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {inspectionExecuted && inspectionMode === 'clean' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>全照合項目 仕様一致（検品合格）</span>
                      </div>

                      {[
                        {
                          title: 'メイン店舗名・スペル照合',
                          detail: `「${spec.storeName}」の表記・字間ともに仕様書と一致`,
                        },
                        {
                          title: 'サブ表記・営業時間照合',
                          detail: `「${spec.subText}」の数値・表記ともに仕様書と一致`,
                        },
                        {
                          title: '外周枠ライン・固定ビス・色調',
                          detail: `四方見切りライン・ビス位置・カラー（${palette.name}）正常`,
                        },
                      ].map((ok) => (
                        <div
                          key={ok.title}
                          className="rounded border border-emerald-200 bg-white p-3 text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{ok.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{ok.detail}</div>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                            仕様一致
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FeatureSection>

      {/* 3-4: 修正依頼・再製作指示メッセージ生成 */}
      <FeatureSection
        featureId="step3-rework"
        highlightedFeatureId={highlightedFeatureId}
        title="3-4. 修正依頼・再製作指示メッセージ生成"
        subtitle="照合チェックで検出した差分箇所をもとに、製造元への連絡文面を自動生成します"
        headerRight={
          <button
            type="button"
            onClick={handleCopyRework}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {copiedRework ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>指示文面をコピー</span>
              </>
            )}
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>
                宛先：{primaryVendor} ／ モード：
                <strong className="text-slate-900">
                  {inspectionMode === 'defect' ? '不備箇所の再製作依頼文面' : '検品合格・出荷承認連絡'}
                </strong>
              </span>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-4">
            {reworkMessage}
          </pre>
        </div>
      </FeatureSection>
    </div>
  );
}
