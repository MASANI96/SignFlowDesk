import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileSearch,
  FileText,
  History,
  MessageSquare,
  X,
} from 'lucide-react';
import { REQUEST_PRESETS, SIMILAR_CASES } from '../data/mockData';
import { FeatureId, SimilarCase, SpecAlert, SpecData } from '../types/signflow';
import { generateInquiryMessage, parseRequestTextToSpec } from '../utils/specAnalyzer';
import { FeatureSection } from './FeatureSection';

interface Step1RequirementsProps {
  rawText: string;
  onChangeRawText: (text: string) => void;
  spec: SpecData;
  onUpdateSpec: (nextSpec: SpecData) => void;
  alerts: SpecAlert[];
  highlightedFeatureId: FeatureId | null;
  citedCaseId: string | null;
  onCiteCase: (similarCase: SimilarCase) => void;
  onGoToStep2: () => void;
}

export function Step1Requirements({
  rawText,
  onChangeRawText,
  spec,
  onUpdateSpec,
  alerts,
  highlightedFeatureId,
  citedCaseId,
  onCiteCase,
  onGoToStep2,
}: Step1RequirementsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState('');
  const [lastAnalyzedMessage, setLastAnalyzedMessage] = useState<string | null>(null);
  const [copiedInquiry, setCopiedInquiry] = useState(false);
  const [detailCase, setDetailCase] = useState<SimilarCase | null>(null);

  const inquiryMessage = generateInquiryMessage(spec, alerts);

  const handleSelectPreset = (presetText: string) => {
    onChangeRawText(presetText);
    setLastAnalyzedMessage(null);
  };

  const handleAnalyze = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisProgress(18);
    setAnalysisStatusText('依頼文面から店舗表記・寸法・設置条件を抽出中...');
    setLastAnalyzedMessage(null);

    window.setTimeout(() => {
      setAnalysisProgress(62);
      setAnalysisStatusText('建築監理基準に基づき不足項目・矛盾点を照合中...');
    }, 240);

    window.setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisStatusText('構造化仕様書および類似案件リストを更新しています...');
    }, 520);

    window.setTimeout(() => {
      const parsed = parseRequestTextToSpec(rawText, {
        ...spec,
        // Reset fields that depend on explicit mention when re-parsing initial text cleanly
        surfaceFinish: /表面|UV|ラミネート/i.test(rawText) ? spec.surfaceFinish : '',
        mountingMethod: /取付|角パイプ|アンカー/i.test(rawText) ? spec.mountingMethod : '',
        colorSpec: /ネイビー|ブラック|ブラウン|ゴールド|ホワイト|クリーム/i.test(rawText)
          ? spec.colorSpec
          : '',
      });
      onUpdateSpec(parsed);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setLastAnalyzedMessage('依頼テキストを解析し、下の構造化仕様書テーブルとアラートを更新しました。');
    }, 720);
  };

  const handleFieldChange = (field: keyof SpecData, value: string | number) => {
    onUpdateSpec({
      ...spec,
      [field]: value,
    });
  };

  const handleCopyInquiry = async () => {
    try {
      await navigator.clipboard.writeText(inquiryMessage);
      setCopiedInquiry(true);
      window.setTimeout(() => setCopiedInquiry(false), 2000);
    } catch {
      setCopiedInquiry(true);
      window.setTimeout(() => setCopiedInquiry(false), 2000);
    }
  };

  const getFieldAlert = (field: keyof SpecData) => alerts.find((a) => a.field === field);

  return (
    <div className="space-y-6">
      {/* 1-1: 雑多な依頼テキスト入力＆仕様解析 */}
      <FeatureSection
        featureId="step1-extract"
        highlightedFeatureId={highlightedFeatureId}
        title="1-1. 依頼テキスト入力・仕様自動解析"
        subtitle="営業担当や施工現場からのメール・メモを貼り付けて構造化データへ変換します"
        headerRight={
          <div className="flex items-center gap-1.5 flex-wrap">
            {REQUEST_PRESETS.map((preset) => {
              const active = rawText === preset.text;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.text)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="raw-request-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              受信メール・指示メモ原文
            </label>
            <textarea
              id="raw-request-input"
              rows={4}
              value={rawText}
              onChange={(e) => onChangeRawText(e.target.value)}
              placeholder="営業担当からの依頼メールやメモを入力してください..."
              className="w-full rounded-md border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 leading-relaxed focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              文面内のサイズ（W×H）・材質・設置環境・表記文言を自動抽出し、欠落仕様を検知します。
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <FileSearch className="w-4 h-4" />
              {isAnalyzing ? '仕様を解析中...' : '仕様を解析・構造化'}
            </button>
          </div>

          {isAnalyzing && (
            <div className="rounded-md border border-blue-200 bg-blue-50/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-blue-900">
                <span>{analysisStatusText}</span>
                <span className="font-mono tabular-nums">{analysisProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-700 transition-all duration-200"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}

          {lastAnalyzedMessage && !isAnalyzing && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{lastAnalyzedMessage}</span>
            </div>
          )}
        </div>
      </FeatureSection>

      {/* 1-2: 構造化仕様書テーブル＆抜け漏れ・矛盾アラート */}
      <FeatureSection
        featureId="step1-spec-check"
        highlightedFeatureId={highlightedFeatureId}
        title="1-2. 構造化仕様書テーブル・抜け漏れ検知"
        subtitle="抽出された製作仕様を編集できます。未確定項目を補完するとアラートが即時解消されます。"
        headerRight={
          <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
            {alerts.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                全項目 確認済
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700 tabular-nums">
                <AlertTriangle className="w-4 h-4" />
                未確定・要確認 {alerts.length}件
              </span>
            )}
          </div>
        }
      >
        <div className="space-y-5">
          {/* Alert Banner List */}
          {alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const isErr = alert.severity === 'error';
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-xs ${
                      isErr
                        ? 'border-red-200 bg-red-50/70 text-red-900'
                        : 'border-amber-200 bg-amber-50/70 text-amber-900'
                    }`}
                  >
                    {isErr ? (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="leading-relaxed">
                      <span className="font-semibold">【{alert.label}】</span>
                      {alert.message}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <div className="flex items-center gap-2.5 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  【確認済】製作・監理に必要な全仕様項目が充足しています。STEP 2の盤面レイアウトへそのまま引き継がれます。
                </span>
              </div>
              <button
                type="button"
                onClick={onGoToStep2}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                STEP 2 盤面作成へ進む
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Structured Editable Table */}
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3.5 w-[210px]">仕様項目</th>
                  <th className="py-2.5 px-3.5">抽出・確定内容（直接編集可）</th>
                  <th className="py-2.5 px-3.5 w-[130px] text-right">判定ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {/* Store Name */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">店舗名・メイン表記</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.storeName}
                      onChange={(e) => handleFieldChange('storeName', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    {getFieldAlert('storeName') ? (
                      <span className="text-red-700 font-semibold">必須入力</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">確認済</span>
                    )}
                  </td>
                </tr>

                {/* Subtext */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">サブ表記・営業時間</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.subText}
                      onChange={(e) => handleFieldChange('subText', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-emerald-700 font-medium">
                    確認済
                  </td>
                </tr>

                {/* Dimensions */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">盤面サイズ（W × H）</td>
                  <td className="py-2 px-3.5">
                    <div className="flex items-center gap-2 tabular-nums">
                      <label className="text-slate-500 font-mono">W</label>
                      <input
                        type="number"
                        min={300}
                        max={10000}
                        step={50}
                        value={spec.widthMm}
                        onChange={(e) => handleFieldChange('widthMm', Number(e.target.value) || 0)}
                        className="w-24 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-slate-400">×</span>
                      <label className="text-slate-500 font-mono">H</label>
                      <input
                        type="number"
                        min={200}
                        max={4000}
                        step={50}
                        value={spec.heightMm}
                        onChange={(e) => handleFieldChange('heightMm', Number(e.target.value) || 0)}
                        className="w-24 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-slate-500 font-mono">mm</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    {getFieldAlert('widthMm') ? (
                      <span className="text-red-700 font-semibold">数値確認</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">確認済</span>
                    )}
                  </td>
                </tr>

                {/* Base Material */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">ベース材質</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.baseMaterial}
                      onChange={(e) => handleFieldChange('baseMaterial', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-emerald-700 font-medium">
                    確認済
                  </td>
                </tr>

                {/* Surface Finish (Initially missing) */}
                <tr className={getFieldAlert('surfaceFinish') ? 'bg-red-50/30' : 'hover:bg-slate-50/60'}>
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">表面仕上げ（耐候処理）</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.surfaceFinish}
                      placeholder="例：屋外用UVカットラミネート（マット）"
                      onChange={(e) => handleFieldChange('surfaceFinish', e.target.value)}
                      className={`w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none ${
                        getFieldAlert('surfaceFinish')
                          ? 'border-red-300 bg-white text-slate-900 placeholder:text-red-400 focus:border-red-600'
                          : 'border-slate-200 bg-white text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    {getFieldAlert('surfaceFinish') ? (
                      <span className="text-red-700 font-semibold">未指定・必須</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">確認済</span>
                    )}
                  </td>
                </tr>

                {/* Environment */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">設置環境</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.environment}
                      onChange={(e) => handleFieldChange('environment', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-emerald-700 font-medium">
                    確認済
                  </td>
                </tr>

                {/* Mounting Method (Initially missing) */}
                <tr className={getFieldAlert('mountingMethod') ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'}>
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">取付方法・壁面下地</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.mountingMethod}
                      placeholder="例：アルミ角パイプ下地＋ビス留め（コーキング処理）"
                      onChange={(e) => handleFieldChange('mountingMethod', e.target.value)}
                      className={`w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none ${
                        getFieldAlert('mountingMethod')
                          ? 'border-amber-300 bg-white text-slate-900 placeholder:text-amber-500 focus:border-amber-600'
                          : 'border-slate-200 bg-white text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    {getFieldAlert('mountingMethod') ? (
                      <span className="text-amber-700 font-semibold">要確認</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">確認済</span>
                    )}
                  </td>
                </tr>

                {/* Color Spec (Initially missing) */}
                <tr className={getFieldAlert('colorSpec') ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'}>
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">仕上げカラー指定</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.colorSpec}
                      placeholder="例：マットブラック地 × オフホワイト文字"
                      onChange={(e) => handleFieldChange('colorSpec', e.target.value)}
                      className={`w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none ${
                        getFieldAlert('colorSpec')
                          ? 'border-amber-300 bg-white text-slate-900 placeholder:text-amber-500 focus:border-amber-600'
                          : 'border-slate-200 bg-white text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    {getFieldAlert('colorSpec') ? (
                      <span className="text-amber-700 font-semibold">要確認</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">確認済</span>
                    )}
                  </td>
                </tr>

                {/* Lighting & Delivery */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">照明・電装仕様</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="text"
                      value={spec.lighting}
                      onChange={(e) => handleFieldChange('lighting', e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-emerald-700 font-medium">
                    確認済
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3.5 font-medium text-slate-700">希望納期</td>
                  <td className="py-2 px-3.5">
                    <input
                      type="date"
                      value={spec.deliveryDate}
                      onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-emerald-700 font-medium">
                    確認済
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FeatureSection>

      {/* 2-column grid for 1-3 Inquiry & 1-4 Similar Cases */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 1-3: 確認メッセージ自動生成 */}
        <div className="xl:col-span-5">
          <FeatureSection
            featureId="step1-inquiry"
            highlightedFeatureId={highlightedFeatureId}
            title="1-3. 確認メッセージ自動生成"
            subtitle="不足項目のみを抽出した営業・現場担当宛の確認文面"
            headerRight={
              <button
                type="button"
                onClick={handleCopyInquiry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                {copiedInquiry ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">コピー完了</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>文面をコピー</span>
                  </>
                )}
              </button>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {alerts.length > 0
                    ? `未確定項目（${alerts.length}件）の確認用ドラフトを自動生成しています。`
                    : '全項目が確定済みのため、着工連絡ドラフトを表示しています。'}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 border border-slate-200 rounded-md p-3.5">
                {inquiryMessage}
              </pre>
            </div>
          </FeatureSection>
        </div>

        {/* 1-4: 過去の類似案件レコメンド＆仕様引用 */}
        <div className="xl:col-span-7">
          <FeatureSection
            featureId="step1-similar"
            highlightedFeatureId={highlightedFeatureId}
            title="1-4. 過去の類似案件レコメンド＆仕様引用"
            subtitle="「屋外」「飲食店」「ファサード看板」「W2400前後」の過去実績から仕様を補完できます"
          >
            <div className="space-y-3.5">
              {SIMILAR_CASES.map((item) => {
                const isCited = citedCaseId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-md border p-4 transition-colors ${
                      isCited
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
                          <span>{item.projectCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.location}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-blue-900">一致率 {item.matchRate}%</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                          {item.title}
                        </h3>
                      </div>

                      <div className="text-right text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                        <div>制作日数：{item.productionDays}営業日</div>
                        <div className="font-mono text-slate-700">{item.costEstimate}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      共通条件：{item.tags.join(' · ')}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mb-3 bg-slate-50 border border-slate-100 rounded px-3 py-2">
                      <span className="font-semibold text-slate-800">監理・施工時の注意点：</span>
                      {item.cautionSummary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailCase(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        詳細を見る
                      </button>

                      <button
                        type="button"
                        onClick={() => onCiteCase(item)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                          isCited
                            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                            : 'bg-blue-900 text-white hover:bg-blue-800'
                        }`}
                      >
                        {isCited ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            この案件の仕様を引用済み
                          </>
                        ) : (
                          <>
                            <History className="w-3.5 h-3.5" />
                            この過去案件の材質・仕様を現在の案件に引用して不足項目を埋める
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </FeatureSection>
        </div>
      </div>

      {/* Similar Case Detail Modal */}
      {detailCase && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50">
              <div>
                <div className="text-xs font-mono text-slate-500 tabular-nums">
                  {detailCase.projectCode} · {detailCase.location} · 一致率 {detailCase.matchRate}%
                </div>
                <h3 id="case-modal-title" className="text-base font-semibold text-slate-900 mt-0.5">
                  {detailCase.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded p-3">
                  <div className="text-slate-500 mb-1">寸法・ベース材質</div>
                  <div className="font-semibold text-slate-900">{detailCase.specs.dimensions}</div>
                  <div className="text-slate-700 mt-0.5">{detailCase.specs.baseMaterial}</div>
                </div>
                <div className="border border-slate-200 rounded p-3">
                  <div className="text-slate-500 mb-1">製作日数・参考費用感</div>
                  <div className="font-semibold text-slate-900 tabular-nums">
                    {detailCase.productionDays}営業日
                  </div>
                  <div className="text-slate-700 mt-0.5 tabular-nums">
                    {detailCase.costEstimate}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5 bg-slate-50 font-semibold text-slate-700 w-36">
                        表面仕上げ
                      </th>
                      <td className="py-2.5 px-3.5 text-slate-900">{detailCase.specs.surfaceFinish}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3.5 bg-slate-50 font-semibold text-slate-700">
                        取付方法・下地
                      </th>
                      <td className="py-2.5 px-3.5 text-slate-900">{detailCase.specs.mountingMethod}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3.5 bg-slate-50 font-semibold text-slate-700">
                        仕上げカラー
                      </th>
                      <td className="py-2.5 px-3.5 text-slate-900">{detailCase.specs.colorSpec}</td>
                    </tr>
                    <tr>
                      <th className="py-2.5 px-3.5 bg-slate-50 font-semibold text-slate-700">
                        照明計画
                      </th>
                      <td className="py-2.5 px-3.5 text-slate-900">{detailCase.specs.lighting}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                  <FileText className="w-3.5 h-3.5 text-blue-900" />
                  設計監理・施工時申し送り詳細
                </div>
                {detailCase.fullNotes}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDetailCase(null)}
                className="px-3.5 py-2 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => {
                  onCiteCase(detailCase);
                  setDetailCase(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                <History className="w-3.5 h-3.5" />
                この過去案件の材質・仕様を現在の案件に引用して不足項目を埋める
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
