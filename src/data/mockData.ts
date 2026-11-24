import {
  CommMemoPreset,
  FeatureGuideItem,
  PaletteConfig,
  PaletteId,
  SimilarCase,
  SpecData,
  VendorOrder,
} from '../types/signflow';

export const PROJECT_INFO = {
  projectId: 'PJ-2026-0412',
  projectTitle: 'CAFE & DINING ROASTERY 表参道店（ファサード看板盤面）',
  clientName: '表参道エリア 新規出店案件',
  supervisor: 'デザイン監理部 担当',
};

export const REQUEST_PRESETS = [
  {
    id: 'initial-email',
    label: '初回依頼メール（不足情報あり）',
    text: '表参道の新店『CAFE & DINING ROASTERY』のファサード看板盤面をお願いします。サイズはW2400×H600で、本体はアルミ複合板3mmベース。屋外の道路面設置です。サブ表記は『Specialty Coffee & Bistro / OPEN 11:00-22:00』で、納期は来月15日希望。スポットライト当てます。',
  },
  {
    id: 'revision-memo',
    label: '追加修正メモ（サイズ・仕上げ追記）',
    text: '【修正連絡】先ほどの表参道店『CAFE & DINING ROASTERY』ファサード看板の件、店舗側の希望で横幅をW2700×H650に拡大し、サブ表記を『Specialty Coffee & Bistro / OPEN 10:30-22:30』へ変更お願いします。また、表面は屋外用UVカットラミネート（マット）、取付はアルミ角パイプ下地＋ビス留め（コーキング処理）で確定、仕上げ色はディープネイビー地にシャンパンゴールド文字で手配してください。納期は来月15日で変更ありません。',
  },
];

export const INITIAL_SPEC_DATA: SpecData = {
  storeName: 'CAFE & DINING ROASTERY',
  subText: 'Specialty Coffee & Bistro / OPEN 11:00-22:00',
  widthMm: 2400,
  heightMm: 600,
  baseMaterial: 'アルミ複合板 3mm',
  surfaceFinish: '',
  environment: '屋外（道路面ファサード）',
  mountingMethod: '',
  colorSpec: '',
  lighting: '外部LEDスポットライト照射（既存アーム併用）',
  deliveryDate: '2026-05-15',
};

export const FEATURE_GUIDE_ITEMS: FeatureGuideItem[] = [
  {
    id: 'step1-extract',
    step: 'step1',
    code: '1-1',
    title: '仕様自動抽出＆構造化',
    description: 'メールやメモの散在情報から寸法・材質・表記文言を自動整理し、転記の手間を削減します。',
    timeSaved: '15分 → 1分',
  },
  {
    id: 'step1-spec-check',
    step: 'step1',
    code: '1-2',
    title: '抜け漏れ・矛盾アラート',
    description: '屋外耐候仕様や取付下地など、手配前に確認必須の欠落項目を即時検知します。',
    timeSaved: '15分 → 2分',
  },
  {
    id: 'step1-inquiry',
    step: 'step1',
    code: '1-3',
    title: '確認メッセージ自動生成',
    description: '未確定項目だけを抽出した営業・施工担当向けの確認文面をワンクリックで作成します。',
    timeSaved: '10分 → 1分',
  },
  {
    id: 'step1-similar',
    step: 'step1',
    code: '1-4',
    title: '類似案件レコメンド＆引用',
    description: '同条件の過去施工実績から実績仕様を引用し、不足項目を一括で安全に補完します。',
    timeSaved: '20分 → 1分',
  },
  {
    id: 'step2-preview',
    step: 'step2',
    code: '2-1',
    title: '盤面SVG自動レイアウト',
    description: '確定仕様と連動し、寸法線・安全領域付きの看板図面プレビューをリアルタイム生成します。',
    timeSaved: '25分 → 2分',
  },
  {
    id: 'step2-qa',
    step: 'step2',
    code: '2-2',
    title: 'データ自動検閲（整合性）',
    description: '仕様書との文言一致、セーフエリアはみ出し、表記揺れを出稿前に自動検証します。',
    timeSaved: '15分 → 2分',
  },
  {
    id: 'step2-illustrator',
    step: 'step2',
    code: '2-3',
    title: 'Illustrator連携スクリプト',
    description: 'トンボ・寸法レイヤー構造とアウトライン設定済みの入稿用データ・JSXを生成します。',
    timeSaved: '15分 → 2分',
  },
  {
    id: 'step3-comm',
    step: 'step3',
    code: '3-1',
    title: '外注連絡要約＆台帳反映',
    description: '業者との電話・チャット履歴から納期変更や決定事項を抽出し、管理台帳へ自動反映します。',
    timeSaved: '15分 → 2分',
  },
  {
    id: 'step3-inspection',
    step: 'step3',
    code: '3-2',
    title: '納品写真 照合検品＆再製作指示',
    description: '工場からの仕上がり写真と仕様書を照合し、誤字や欠損の検出と修正依頼文を作成します。',
    timeSaved: '15分 → 3分',
  },
];

export const SIMILAR_CASES: SimilarCase[] = [
  {
    id: 'case-aoyama-roast',
    projectCode: 'PJ-2025-1108',
    title: 'THE ROASTERY & BAKERY 南青山店',
    location: '東京都港区南青山',
    matchRate: 96,
    tags: ['屋外ファサード', '飲食店', 'W2400×H600', 'スポットライト'],
    productionDays: 9,
    costEstimate: '¥148,000（盤面製作・板金一式）',
    cautionSummary: '道路面直射日光のため高耐候マットUVラミネートを採用。壁面ALC下地へのビス頭タッチアップ必須。',
    fullNotes:
      '南向き道路に面したファサード看板。スポットライト反射による視認性低下を防ぐため、グロスではなくマットタイプのUVカットラミネートを選定。アルミ複合板3mmにアルミ角パイプ30×30mm枠を組み、外周コーキング処理を実施。',
    specs: {
      dimensions: 'W2400 × H600 mm',
      baseMaterial: 'アルミ複合板 3mm（裏面アルミ角パイプ枠組）',
      surfaceFinish: '屋外用UVカットラミネート（マット仕上げ）',
      mountingMethod: 'アルミ角パイプ下地＋ビス留め（防錆コーキング処理）',
      colorSpec: 'マットブラック地 × オフホワイト文字',
      lighting: '外部LEDスポットライト 2灯（電球色3000K）',
    },
    applyFields: {
      surfaceFinish: '屋外用UVカットラミネート（マット）',
      mountingMethod: 'アルミ角パイプ下地＋ビス留め（コーキング処理）',
      colorSpec: 'マットブラック地 × オフホワイト文字',
    },
  },
  {
    id: 'case-nakameguro-bistro',
    projectCode: 'PJ-2025-0824',
    title: 'BISTRO MONTE 中目黒駅前店',
    location: '東京都目黒区上目黒',
    matchRate: 89,
    tags: ['屋外ファサード', '飲食店', 'W2500×H650', '夜間照明'],
    productionDays: 10,
    costEstimate: '¥162,000（盤面製作・金物含）',
    cautionSummary: '夜間スポット照射時の反射防止として低反射メディアを使用。既存躯体とのクリアランス確保にスペーサー使用。',
    fullNotes:
      '外装サイディング壁面への直接ビス留め不可箇所があったため、アルミアングル持ち出しブラケットにて取付。文字視認距離15mを想定し、サブ表記の最小文字高を28mm以上に調整して組版。',
    specs: {
      dimensions: 'W2500 × H650 mm',
      baseMaterial: 'アルミ複合板 3mm',
      surfaceFinish: '長期耐候塩ビ出力＋マットUVラミネート',
      mountingMethod: 'アルミアングル枠＋アンカービス固定（防雨シール）',
      colorSpec: 'ディープネイビー地 × シャンパンゴールド文字',
      lighting: 'LEDスポットライト 3灯',
    },
    applyFields: {
      surfaceFinish: '長期耐候塩ビ出力＋マットUVラミネート',
      mountingMethod: 'アルミアングル枠＋アンカービス固定（防雨シール）',
      colorSpec: 'ディープネイビー地 × シャンパンゴールド文字',
    },
  },
  {
    id: 'case-daikanyama-cafe',
    projectCode: 'PJ-2025-0519',
    title: 'KITCHEN & ESPRESSO 代官山店',
    location: '東京都渋谷区猿楽町',
    matchRate: 84,
    tags: ['屋外壁面', 'カフェ業態', 'W2200×H550'],
    productionDays: 8,
    costEstimate: '¥132,000（盤面製作のみ）',
    cautionSummary: '板金曲げ巻き込み仕様により小口の剥がれを防止。納期短縮のため出力色校をPDF＋郵送チップで先行確定。',
    fullNotes:
      'カフェ業態のため温かみのあるダークブラウンベースを採用。端面のシート浮きを防ぐため四方折り返し貼り＋アルミチャンネル見切り縁を追加した事例。',
    specs: {
      dimensions: 'W2200 × H550 mm',
      baseMaterial: 'アルミ複合板 3mm（四方見切り枠付）',
      surfaceFinish: '耐候UVラミネート（半艶）＋四方小口巻き込み',
      mountingMethod: '既存下地ボンド併用＋皿ビス留め（同色キャップ）',
      colorSpec: 'ダークブラウン地 × クリーム文字',
      lighting: '既存スポット流用',
    },
    applyFields: {
      surfaceFinish: '耐候UVラミネート（半艶）＋四方小口巻き込み',
      mountingMethod: '既存下地ボンド併用＋皿ビス留め（同色キャップ）',
      colorSpec: 'ダークブラウン地 × クリーム文字',
    },
  },
];

export const PALETTES: Record<PaletteId, PaletteConfig> = {
  'matte-black': {
    id: 'matte-black',
    name: 'マットブラック × ホワイト',
    colorSpecLabel: 'マットブラック地 × オフホワイト文字',
    bgHex: '#181A1F',
    frameHex: '#334155',
    primaryTextHex: '#F8FAFC',
    subTextHex: '#CBD5E1',
    accentHex: '#94A3B8',
  },
  'deep-navy': {
    id: 'deep-navy',
    name: 'ディープネイビー × シャンパンゴールド',
    colorSpecLabel: 'ディープネイビー地 × シャンパンゴールド文字',
    bgHex: '#0F1E36',
    frameHex: '#1E3A5F',
    primaryTextHex: '#E5C98B',
    subTextHex: '#F1F5F9',
    accentHex: '#C5A059',
  },
  'dark-brown': {
    id: 'dark-brown',
    name: 'ダークブラウン × クリーム',
    colorSpecLabel: 'ダークブラウン地 × クリーム文字',
    bgHex: '#2B211B',
    frameHex: '#4A3A30',
    primaryTextHex: '#FAF3E6',
    subTextHex: '#DDD0BC',
    accentHex: '#C8A97E',
  },
};

export const INITIAL_VENDORS: VendorOrder[] = [
  {
    id: 'vendor-tokyo-sign',
    vendorName: '株式会社東京サイン製作所',
    role: '盤面出力・板金加工',
    scope: 'アルミ複合板3mm盤面＋UVマットラミネート・枠加工',
    status: '製作中',
    deliveryDate: '2026-05-12',
    notes: '出力データ入稿済・色校サンプル確認中',
  },
  {
    id: 'vendor-sanwa-elec',
    vendorName: '三和電装工業株式会社',
    role: 'LEDスポット・電装',
    scope: '屋外用LEDスポットライト2灯・防水結線部材手配',
    status: '手配済',
    deliveryDate: '2026-05-11',
    notes: '既存アーム流用可否の現場確認待ち',
  },
  {
    id: 'vendor-site-team',
    vendorName: '現場施工チーム（第一工事班）',
    role: '現場搬入・取付施工',
    scope: '高所作業・ファサード下地固定・コーキング仕上',
    status: '検品待ち',
    deliveryDate: '2026-05-15',
    notes: '盤面納品後、翌日9:00より施工予定',
  },
];

export const COMM_MEMO_PRESETS: CommMemoPreset[] = [
  {
    id: 'memo-tokyo-sign',
    label: '板金業者からの電話メモ（納期変更・色校OK）',
    rawText:
      '板金業者（東京サイン製作所 担当：佐藤様）からの電話メモ：\n『台風の影響で基材アルミ複合板の到着が1日遅れるため、盤面の納品を5/12から5/13に変更したい。出力色の色校は問題なしとのこと。5/13午前中には出荷検品写真を送付予定。』',
    targetVendorId: 'vendor-tokyo-sign',
    extractedSummary: '資材遅延に伴い納品日を 5/12 → 5/13 へ変更。出力色の色校は承認済み。',
    nextAction: '5/13 午前に出荷検品写真を受領し照合チェックを実施。施工班へ納品日スライドを共有。',
    updatedStatus: '納期変更・色校済',
    updatedDeliveryDate: '2026-05-13',
    updatedNotes: '色校OK／資材1日遅延により5/13午前出荷へ変更',
  },
  {
    id: 'memo-sanwa-elec',
    label: '電装業者からのチャット連絡（既存アーム適合確認）',
    rawText:
      '三和電装工業 チャット履歴：\n『表参道現場の既存スポットライトアームを確認しました。フランジ径と一次側電源とも現行LED器具にそのまま適合するため、追加工事なしで5/11に部材納品確定です。』',
    targetVendorId: 'vendor-sanwa-elec',
    extractedSummary: '既存アーム適合を確認。追加部材不要で5/11納品が確定。',
    nextAction: '施工当日の一次側電源ブレーカー遮断手順を現場施工チームへ伝達。',
    updatedStatus: '確認完了',
    updatedDeliveryDate: '2026-05-11',
    updatedNotes: '既存アーム適合確認済・追加工事なしで5/11納品確定',
  },
];
