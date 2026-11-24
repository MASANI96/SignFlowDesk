import { PALETTES } from '../data/mockData';
import {
  InspectionDefect,
  LayoutConfig,
  PaletteId,
  QaCheckItem,
  SpecAlert,
  SpecData,
} from '../types/signflow';

export function parseRequestTextToSpec(rawText: string, currentSpec: SpecData): SpecData {
  const next: SpecData = { ...currentSpec };

  // Extract quoted strings 『...』 or 「...」
  const bracketMatches = Array.from(rawText.matchAll(/[『「]([^』」]+)[』」]/g)).map((m) =>
    m[1].trim()
  );

  if (bracketMatches.length >= 1) {
    // Heuristic: first quoted string is store name unless it looks like subtext (contains OPEN or /)
    const first = bracketMatches[0];
    if (!/OPEN|Bistro|Coffee/i.test(first)) {
      next.storeName = first;
    }
  }

  // Look specifically for subtext
  const subMatch = rawText.match(/サブ表記[はを：:]?\s*[『「]([^』」]+)[』」]/);
  if (subMatch && subMatch[1]) {
    next.subText = subMatch[1].trim();
  } else if (bracketMatches.length >= 2) {
    const candidate = bracketMatches.find((b) => b !== next.storeName);
    if (candidate) {
      next.subText = candidate;
    }
  }

  // Extract dimensions Wxxxx×Hxxx
  const dimMatch = rawText.match(/W\s*(\d{3,5})\s*[×xX＊*]\s*H\s*(\d{3,5})/i);
  if (dimMatch) {
    next.widthMm = parseInt(dimMatch[1], 10);
    next.heightMm = parseInt(dimMatch[2], 10);
  }

  // Extract base material
  if (/アルミ複合板\s*3\s*mm/i.test(rawText)) {
    next.baseMaterial = 'アルミ複合板 3mm';
  } else if (/アルミ複合板/i.test(rawText)) {
    next.baseMaterial = 'アルミ複合板';
  } else if (/アクリル/i.test(rawText)) {
    next.baseMaterial = 'アクリル板 5mm';
  } else if (/ステンレス|SUS/i.test(rawText)) {
    next.baseMaterial = 'ステンレス（SUS304）';
  }

  // Extract environment
  if (/屋外.*道路面|道路面.*屋外/.test(rawText)) {
    next.environment = '屋外（道路面ファサード）';
  } else if (/屋外/.test(rawText)) {
    next.environment = '屋外壁面';
  } else if (/屋内/.test(rawText)) {
    next.environment = '屋内';
  }

  // Extract surface finish (only if explicitly mentioned in text)
  if (/UVカットラミネート（マット）|UV.*マット/i.test(rawText)) {
    next.surfaceFinish = '屋外用UVカットラミネート（マット）';
  } else if (/UV.*ラミネート|ラミネート/i.test(rawText)) {
    next.surfaceFinish = '屋外用UVカットラミネート';
  } else if (/表面.*未定/.test(rawText)) {
    next.surfaceFinish = '';
  }

  // Extract mounting method
  if (/アルミ角パイプ下地[＋+]?ビス留め（コーキング処理）/.test(rawText)) {
    next.mountingMethod = 'アルミ角パイプ下地＋ビス留め（コーキング処理）';
  } else if (/アルミ角パイプ/.test(rawText)) {
    next.mountingMethod = 'アルミ角パイプ下地＋ビス留め';
  } else if (/アンカー/.test(rawText)) {
    next.mountingMethod = 'アンカーボルト固定';
  }

  // Extract color spec
  if (/ディープネイビー.*シャンパンゴールド/.test(rawText)) {
    next.colorSpec = 'ディープネイビー地 × シャンパンゴールド文字';
  } else if (/マットブラック.*(ホワイト|白)/.test(rawText)) {
    next.colorSpec = 'マットブラック地 × オフホワイト文字';
  } else if (/ダークブラウン.*クリーム/.test(rawText)) {
    next.colorSpec = 'ダークブラウン地 × クリーム文字';
  }

  // Extract lighting
  if (/スポットライト/.test(rawText)) {
    next.lighting = '外部LEDスポットライト照射（既存アーム併用）';
  } else if (/内照|LEDモジュール/.test(rawText)) {
    next.lighting = '内部LEDモジュール発光';
  } else if (/無照明|照明なし/.test(rawText)) {
    next.lighting = '照明なし';
  }

  // Extract delivery date
  const dateMatch = rawText.match(/(\d{1,2})月(\d{1,2})日/);
  if (dateMatch) {
    const m = dateMatch[1].padStart(2, '0');
    const d = dateMatch[2].padStart(2, '0');
    next.deliveryDate = `2026-${m}-${d}`;
  } else if (/来月15日/.test(rawText)) {
    next.deliveryDate = '2026-05-15';
  }

  return next;
}

export function evaluateSpecAlerts(spec: SpecData): SpecAlert[] {
  const alerts: SpecAlert[] = [];

  if (!spec.surfaceFinish.trim()) {
    const isOutdoor = spec.environment.includes('屋外');
    alerts.push({
      id: 'alert-surface',
      field: 'surfaceFinish',
      severity: 'error',
      label: '必須確認',
      message: isOutdoor
        ? '屋外設置ですが「表面仕上げ（UVラミネート仕様）」が未指定です（耐候性低下・退色リスク）。'
        : '「表面仕上げ（ラミネート・塗装仕様）」が未指定です。',
    });
  }

  if (!spec.mountingMethod.trim()) {
    alerts.push({
      id: 'alert-mounting',
      field: 'mountingMethod',
      severity: 'warning',
      label: '要確認',
      message: '「取付方法・壁面下地（ALC／サイディング／角パイプ下地等）」の情報が不足しています。',
    });
  }

  if (!spec.colorSpec.trim()) {
    alerts.push({
      id: 'alert-color',
      field: 'colorSpec',
      severity: 'warning',
      label: '要確認',
      message: '「盤面ベース色・文字色」の具体的なカラー指定（色番号／シート品番）が未入力です。',
    });
  }

  if (!spec.storeName.trim()) {
    alerts.push({
      id: 'alert-store',
      field: 'storeName',
      severity: 'error',
      label: '必須確認',
      message: '「店舗名・メイン表記」が空欄です。',
    });
  }

  if (spec.widthMm <= 0 || spec.heightMm <= 0) {
    alerts.push({
      id: 'alert-size',
      field: 'widthMm',
      severity: 'error',
      label: '数値異常',
      message: '看板サイズ（W×H）は正の数値（mm）で入力してください。',
    });
  }

  return alerts;
}

export function generateInquiryMessage(spec: SpecData, alerts: SpecAlert[]): string {
  const projectLabel = `${spec.storeName || '新規店舗'} ファサード看板`;

  if (alerts.length === 0) {
    return `お疲れ様です。デザイン監理部です。\n『${projectLabel}（W${spec.widthMm}×H${spec.heightMm}）』について、全必須仕様の確定を確認いたしました。\n\n【確定仕様サマリー】\n・ベース材質：${spec.baseMaterial}\n・表面仕上げ：${spec.surfaceFinish}\n・取付方法：${spec.mountingMethod}\n・仕上げ色：${spec.colorSpec}\n・納期目標：${spec.deliveryDate}\n\n本仕様にて盤面データ作成・外注手配へ進行いたします。引き続きよろしくお願いいたします。`;
  }

  const bulletLines = alerts.map((alert, idx) => {
    if (alert.field === 'surfaceFinish') {
      return `${idx + 1}. 表面仕上げ仕様（屋外設置のためUVカットラミネート［マット／グロス］のご指定）`;
    }
    if (alert.field === 'mountingMethod') {
      return `${idx + 1}. 取付方法および壁面下地種別（ALC／サイディング／アルミ角パイプ下地の有無）`;
    }
    if (alert.field === 'colorSpec') {
      return `${idx + 1}. 盤面カラー指定（地色・文字色の色品番または近似指定）`;
    }
    return `${idx + 1}. ${alert.message}`;
  });

  return `お疲れ様です。デザイン監理部です。\n『${projectLabel}（W${spec.widthMm}×H${spec.heightMm}）』の製作手配にあたり、以下の未確定事項をご確認いただけますでしょうか。\n\n【ご確認いただきたい項目】\n${bulletLines.join('\n')}\n\n上記をご回答いただき次第、盤面レイアウトおよび外注手配を確定いたします。\nお忙しいところ恐れ入りますが、よろしくお願いいたします。`;
}

export function inferPaletteFromColorSpec(colorSpec: string): PaletteId {
  if (/ネイビー|紺|ゴールド/i.test(colorSpec)) {
    return 'deep-navy';
  }
  if (/ブラウン|茶|クリーム/i.test(colorSpec)) {
    return 'dark-brown';
  }
  return 'matte-black';
}

export function runStep2QaChecks(spec: SpecData, layout: LayoutConfig): QaCheckItem[] {
  const items: QaCheckItem[] = [];

  // 1. Spec sync check
  const palette = PALETTES[layout.palette];
  const specColorMatched =
    !spec.colorSpec ||
    spec.colorSpec.includes('ブラック') === (layout.palette === 'matte-black') ||
    spec.colorSpec.includes('ネイビー') === (layout.palette === 'deep-navy') ||
    spec.colorSpec.includes('ブラウン') === (layout.palette === 'dark-brown');

  items.push({
    id: 'qa-spec-sync',
    title: '仕様書（STEP 1）との寸法・文言整合性',
    status: spec.storeName.trim() && specColorMatched ? 'pass' : 'warning',
    detail: !spec.storeName.trim()
      ? 'メイン表記が未入力です。STEP 1の仕様書を確認してください。'
      : specColorMatched
      ? `W${spec.widthMm}×H${spec.heightMm}mm・メイン文言・配色（${palette.name}）が仕様書と一致しています。`
      : `仕様書のカラー指定（${spec.colorSpec}）と現在の配色選択（${palette.name}）に差異があります。`,
  });

  // 2. Safe area overflow check
  // Approximate character width relative to sign aspect ratio & fontScale
  const aspectRatio = spec.widthMm / Math.max(spec.heightMm, 200);
  const titleLen = spec.storeName.length;
  const subLen = spec.subText.length;

  // Estimate normalized title width occupancy inside safe area (safe width ~ 0.88 of board)
  const effectiveScale = layout.fontSizeScale;
  const templateFactor = layout.template === 'split-left' ? 1.18 : 1.0;
  const titleOccupancy = (titleLen * 0.033 * effectiveScale * templateFactor) / Math.max(aspectRatio / 4, 0.7);
  const subOccupancy = (subLen * 0.017 * effectiveScale * templateFactor) / Math.max(aspectRatio / 4, 0.7);

  const isOverflow = titleOccupancy > 0.94 || subOccupancy > 0.96 || layout.fontSizeScale >= 1.32;
  const isTight = !isOverflow && (titleOccupancy > 0.82 || layout.fontSizeScale >= 1.2);

  items.push({
    id: 'qa-safe-area',
    title: 'セーフエリア（安全余白40mm）はみ出し判定',
    status: isOverflow ? 'fail' : isTight ? 'warning' : 'pass',
    detail: isOverflow
      ? '文字サイズ過大または文字数超過により、外周セーフエリア（ビス留め・見切り枠干渉領域）への接触を検出しました。文字サイズを縮小してください。'
      : isTight
      ? 'セーフエリア境界まで余白が狭くなっています（安全余白まで残り約15mm）。視認性確認を推奨します。'
      : 'メイン表記・サブ表記ともに外周セーフエリア内に余裕をもって収まっています。',
  });

  // 3. Notation / character width consistency check
  const hasFullWidthAlnum = /[Ａ-Ｚａ-ｚ０-９]/.test(spec.storeName + spec.subText);
  const hasDoubleSpace = /\s{2,}/.test(spec.storeName + spec.subText);
  const hasMixedSeparator = spec.subText.includes('／') || spec.subText.includes('：');

  items.push({
    id: 'qa-notation',
    title: '誤字・全角半角・表記揺れチェック',
    status: hasFullWidthAlnum || hasMixedSeparator ? 'warning' : hasDoubleSpace ? 'warning' : 'pass',
    detail: hasFullWidthAlnum
      ? '全角英数字が混在しています。看板欧文の視認性・カーニング統一のため半角英数字への統一を推奨します。'
      : hasMixedSeparator
      ? 'サブ表記内に全角記号（／・：）が含まれています。半角記号との混在がないか確認してください。'
      : hasDoubleSpace
      ? '連続する空白文字（二重スペース）が含まれています。字間調整のため確認してください。'
      : '全角半角の混在・連続空白・不要な表記揺れは検出されませんでした。',
  });

  return items;
}

export function buildCorruptedInspectionStrings(spec: SpecData): {
  corruptedTitle: string;
  corruptedSubText: string;
  titleDefectExpected: string;
  titleDefectActual: string;
  subDefectExpected: string;
  subDefectActual: string;
} {
  const origTitle = spec.storeName || 'CAFE & DINING ROASTERY';
  let corruptedTitle = origTitle;
  if (origTitle.includes('ROASTERY')) {
    corruptedTitle = origTitle.replace('ROASTERY', 'ROASTARY');
  } else if (origTitle.length > 4) {
    const mid = Math.floor(origTitle.length * 0.7);
    const ch = origTitle[mid];
    const replacement = ch === 'A' ? 'E' : ch === 'E' ? 'A' : 'X';
    corruptedTitle = origTitle.slice(0, mid) + replacement + origTitle.slice(mid + 1);
  } else {
    corruptedTitle = `${origTitle}?`;
  }

  const origSub = spec.subText || 'Specialty Coffee & Bistro / OPEN 11:00-22:00';
  let corruptedSub = origSub;
  if (origSub.includes('22:00')) {
    corruptedSub = origSub.replace('22:00', '23:00');
  } else if (origSub.includes('22:30')) {
    corruptedSub = origSub.replace('22:30', '23:30');
  } else if (/\d{2}:\d{2}/.test(origSub)) {
    corruptedSub = origSub.replace(/(\d{2}):(\d{2})/, (_, h, m) => `${Number(h) + 1}:${m}`);
  } else {
    corruptedSub = `${origSub} (誤植)`;
  }

  return {
    corruptedTitle,
    corruptedSubText: corruptedSub,
    titleDefectExpected: origTitle,
    titleDefectActual: corruptedTitle,
    subDefectExpected: origSub,
    subDefectActual: corruptedSub,
  };
}

export function buildInspectionDefects(spec: SpecData): InspectionDefect[] {
  const { titleDefectExpected, titleDefectActual, subDefectExpected, subDefectActual } =
    buildCorruptedInspectionStrings(spec);

  return [
    {
      pinNumber: 1,
      id: 'defect-title-spell',
      title: 'メイン店舗名のスペル誤り',
      expectedValue: titleDefectExpected,
      actualValue: titleDefectActual,
      severity: 'critical',
      box: { x: 245, y: 128, width: 490, height: 64 },
    },
    {
      pinNumber: 2,
      id: 'defect-sub-hours',
      title: 'サブ表記（営業時間）の数値相違',
      expectedValue: subDefectExpected,
      actualValue: subDefectActual,
      severity: 'critical',
      box: { x: 430, y: 204, width: 295, height: 34 },
    },
    {
      pinNumber: 3,
      id: 'defect-right-frame',
      title: '右端部アクセントライン欠損・色味ズレ',
      expectedValue: '指定色外周枠ライン＋右端固定ビス仕上げ',
      actualValue: '右側見切りライン欠損および端部色調ズレ',
      severity: 'major',
      box: { x: 752, y: 95, width: 72, height: 175 },
    },
  ];
}

export function generateReworkMessage(
  spec: SpecData,
  mode: 'defect' | 'clean',
  defects: InspectionDefect[],
  vendorName: string
): string {
  if (mode === 'clean') {
    return `${vendorName} 御中\n\nお世話になっております。デザイン監理部です。\n『${spec.storeName}（W${spec.widthMm}×H${spec.heightMm}）』の出荷前仕上がり写真を確認いたしました。\n\nメイン表記・営業時間・外周枠および表面ラミネート仕上げともに仕様書と完全一致（検品合格）であることを確認しました。\n予定通り現場への出荷・搬入を手配いただけますようお願いいたします。`;
  }

  const defectLines = defects.map(
    (d) =>
      `■ 不備箇所 ${d.pinNumber}：${d.title}\n   ・仕様書（正）：${d.expectedValue}\n   ・納品写真（誤）：${d.actualValue}`
  );

  return `${vendorName} 御中\n\nいつも大変お世話になっております。デザイン監理部です。\n本日ご送付いただいた『${spec.storeName}（W${spec.widthMm}×H${spec.heightMm}）』の仕上がり検品写真につきまして、仕様書との照合の結果、下記${defects.length}点の不備が確認されました。\n\nお手数をおかけし誠に恐縮ですが、盤面データの再出力・再製作のご対応をお願いいたします。\n\n${defectLines.join('\n\n')}\n\n【ご対応のお願い】\n・再製作後の最短出荷予定日をご連絡いただけますでしょうか。\n・出荷前に再度、正面全体および右端部の仕上がり写真をご共有ください。\n\nお急ぎのところ恐れ入りますが、よろしくお願いいたします。`;
}
