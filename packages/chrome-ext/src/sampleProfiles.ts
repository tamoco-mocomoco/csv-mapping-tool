import type { Profile, Column, Mapping, ConverterConfig } from '@core/types';
import { STORAGE_KEYS } from '@core/types';

const SAMPLE_PROFILES_INJECTED_KEY = 'csv-mapper-sample-profiles-injected';

// ========================================
// プロファイル1: 顧客リスト変換
// 氏名→姓/名 分割、メール小文字化、電話番号ハイフン除去
// ========================================
const profile1SourceColumns: Column[] = [
  { id: 'source_氏名', name: '氏名' },
  { id: 'source_メールアドレス', name: 'メールアドレス' },
  { id: 'source_電話番号', name: '電話番号' },
];

const profile1TargetColumns: Column[] = [
  { id: 'target_p1_1', name: '姓' },
  { id: 'target_p1_2', name: '名' },
  { id: 'target_p1_3', name: 'メール（小文字）' },
  { id: 'target_p1_4', name: '電話番号（ハイフンなし）' },
];

const profile1Mappings: Mapping[] = [
  {
    id: 'mapping_p1_1',
    sourceColumnIds: ['source_氏名'],
    targetColumnId: 'target_p1_1',
    converters: [{ type: 'split', delimiter: ' ', index: 0 } as ConverterConfig],
  },
  {
    id: 'mapping_p1_2',
    sourceColumnIds: ['source_氏名'],
    targetColumnId: 'target_p1_2',
    converters: [{ type: 'split', delimiter: ' ', index: 1 } as ConverterConfig],
  },
  {
    id: 'mapping_p1_3',
    sourceColumnIds: ['source_メールアドレス'],
    targetColumnId: 'target_p1_3',
    converters: [{ type: 'case', caseType: 'lower' } as ConverterConfig],
  },
  {
    id: 'mapping_p1_4',
    sourceColumnIds: ['source_電話番号'],
    targetColumnId: 'target_p1_4',
    converters: [{ type: 'replace', searchValue: '-', replaceValue: '' } as ConverterConfig],
  },
];

// ========================================
// プロファイル2: 受注データ変換
// 日付フォーマット変換、金額ゼロパディング、注文番号にプレフィックス
// ========================================
const profile2SourceColumns: Column[] = [
  { id: 'source_注文ID', name: '注文ID' },
  { id: 'source_注文日', name: '注文日' },
  { id: 'source_金額', name: '金額' },
];

const profile2TargetColumns: Column[] = [
  { id: 'target_p2_1', name: '注文番号' },
  { id: 'target_p2_2', name: '注文日（ISO形式）' },
  { id: 'target_p2_3', name: '金額（8桁）' },
];

const profile2Mappings: Mapping[] = [
  {
    id: 'mapping_p2_1',
    sourceColumnIds: ['source_注文ID'],
    targetColumnId: 'target_p2_1',
    converters: [{ type: 'prefix', prefixType: 'fixed', fixedPrefix: 'ORD-' } as ConverterConfig],
  },
  {
    id: 'mapping_p2_2',
    sourceColumnIds: ['source_注文日'],
    targetColumnId: 'target_p2_2',
    converters: [{
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: 0,
    } as ConverterConfig],
  },
  {
    id: 'mapping_p2_3',
    sourceColumnIds: ['source_金額'],
    targetColumnId: 'target_p2_3',
    converters: [{ type: 'padding', padType: 'start', padChar: '0', padLength: 8 } as ConverterConfig],
  },
];

// ========================================
// プロファイル3: 商品マスタ整形
// 商品名トリム＋部分抽出、カテゴリ大文字化、コードにサフィックス
// ========================================
const profile3SourceColumns: Column[] = [
  { id: 'source_商品コード', name: '商品コード' },
  { id: 'source_商品名', name: '商品名' },
  { id: 'source_カテゴリ', name: 'カテゴリ' },
];

const profile3TargetColumns: Column[] = [
  { id: 'target_p3_1', name: '商品コード（整形済）' },
  { id: 'target_p3_2', name: '商品名（15文字）' },
  { id: 'target_p3_3', name: 'カテゴリ（大文字）' },
];

const profile3Mappings: Mapping[] = [
  {
    id: 'mapping_p3_1',
    sourceColumnIds: ['source_商品コード'],
    targetColumnId: 'target_p3_1',
    converters: [
      { type: 'trim', trimType: 'both' } as ConverterConfig,
      { type: 'suffix', suffix: '-JP' } as ConverterConfig,
    ],
  },
  {
    id: 'mapping_p3_2',
    sourceColumnIds: ['source_商品名'],
    targetColumnId: 'target_p3_2',
    converters: [
      { type: 'trim', trimType: 'both' } as ConverterConfig,
      { type: 'substring', substringStart: 0, substringEnd: 15 } as ConverterConfig,
    ],
  },
  {
    id: 'mapping_p3_3',
    sourceColumnIds: ['source_カテゴリ'],
    targetColumnId: 'target_p3_3',
    converters: [{ type: 'case', caseType: 'upper' } as ConverterConfig],
  },
];

// ========================================
// サンプルプロファイル定義
// ========================================
const now = Date.now();

export const SAMPLE_PROFILES: Profile[] = [
  {
    id: 'sample_profile_1',
    name: 'サンプル: 顧客リスト変換',
    sourceColumns: profile1SourceColumns,
    targetColumns: profile1TargetColumns,
    mappings: profile1Mappings,
    encoding: 'utf-8',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample_profile_2',
    name: 'サンプル: 受注データ変換',
    sourceColumns: profile2SourceColumns,
    targetColumns: profile2TargetColumns,
    mappings: profile2Mappings,
    encoding: 'utf-8',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample_profile_3',
    name: 'サンプル: 商品マスタ整形',
    sourceColumns: profile3SourceColumns,
    targetColumns: profile3TargetColumns,
    mappings: profile3Mappings,
    encoding: 'utf-8',
    createdAt: now,
    updatedAt: now,
  },
];

// ========================================
// 各プロファイル対応のサンプルCSVデータ（文字列）
// ========================================
export const SAMPLE_CSV_DATA: Record<string, string> = {
  sample_profile_1: `氏名,メールアドレス,電話番号
田中 太郎,TANAKA@EXAMPLE.COM,090-1234-5678
鈴木 花子,SUZUKI@EXAMPLE.COM,080-9876-5432
佐藤 次郎,SATO@EXAMPLE.COM,070-1111-2222`,

  sample_profile_2: `注文ID,注文日,金額
1001,2024/03/15,12500
1002,2024/04/01,8900
1003,2024/04/20,45000`,

  sample_profile_3: `商品コード,商品名,カテゴリ
 A001 ,プレミアムヘッドフォン XZ-900 Pro,electronics
 B002 ,オーガニックコットンTシャツ ナチュラルホワイト,clothing
 C003 ,ステンレスタンブラー 500ml,kitchen`,
};

// ========================================
// 初回起動時にサンプルプロファイルを注入
// ========================================
export function injectSampleProfilesIfNeeded(): boolean {
  if (localStorage.getItem(SAMPLE_PROFILES_INJECTED_KEY) === 'true') {
    return false;
  }

  const existing: Profile[] = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  // サンプルプロファイルを既存に追加（IDで重複チェック）
  const existingIds = new Set(existing.map((p: Profile) => p.id));
  const toAdd = SAMPLE_PROFILES.filter((p) => !existingIds.has(p.id));

  if (toAdd.length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.PROFILES,
      JSON.stringify([...existing, ...toAdd])
    );
  }

  localStorage.setItem(SAMPLE_PROFILES_INJECTED_KEY, 'true');
  return true;
}
