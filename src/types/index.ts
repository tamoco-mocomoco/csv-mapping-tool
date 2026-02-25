// カラム定義
export interface Column {
  id: string;
  name: string;
}

// コンバーター種別
export type ConverterType = 'direct' | 'split' | 'replace' | 'prefix' | 'suffix' | 'trim' | 'case' | 'substring' | 'padding' | 'conditional' | 'dateFormat';

// 接頭辞タイプ
export type PrefixType = 'fixed' | 'random' | 'date';

// トリムタイプ
export type TrimType = 'both' | 'start' | 'end';

// 大文字小文字タイプ
export type CaseType = 'upper' | 'lower' | 'capitalize';

// パディングタイプ
export type PadType = 'start' | 'end';

// コンバーター設定
export interface ConverterConfig {
  type: ConverterType;
  // 分割用
  delimiter?: string;
  index?: number;
  // 置換用
  searchValue?: string;
  replaceValue?: string;
  // 接頭辞用
  prefixType?: PrefixType;
  fixedPrefix?: string;
  randomLength?: number;
  dateFormat?: string;
  // 接尾辞用
  suffix?: string;
  // トリム用
  trimType?: TrimType;
  // 大文字小文字用
  caseType?: CaseType;
  // 部分抽出用
  substringStart?: number;
  substringEnd?: number;
  // パディング用
  padType?: PadType;
  padChar?: string;
  padLength?: number;
  // 条件代入用
  conditionColumnId?: string;
  conditionPattern?: string;
  conditionValue?: string;
  conditionElseValue?: string;
  // 日付フォーマット用
  dateInputFormat?: string;
  dateOutputFormat?: string;
}

// マッピング定義
export interface Mapping {
  id: string;
  sourceColumnId?: string;       // 旧形式（後方互換性用）
  sourceColumnIds?: string[];    // 新形式（複数カラム対応）
  targetColumnId: string;
  converters: ConverterConfig[]; // 複数コンバーターをパイプライン形式で適用
  separator?: string;            // 結合時の区切り文字（デフォルト: ''）
}

// マッピングからソースカラムIDの配列を取得するヘルパー関数（後方互換性対応）
export function getSourceColumnIds(mapping: Mapping): string[] {
  if (mapping.sourceColumnIds && mapping.sourceColumnIds.length > 0) {
    return mapping.sourceColumnIds;
  }
  if (mapping.sourceColumnId) {
    return [mapping.sourceColumnId];
  }
  return [];
}

// データフィルター
export interface DataFilter {
  enabled: boolean;
  columnType: 'source' | 'target';  // 変換前 or 変換後
  columnId: string;                  // 対象カラムID
  pattern: string;                   // 正規表現パターン
}

// アプリケーション状態
export interface MappingState {
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
  sourceData: Record<string, string>[];
}

// CSVエンコーディング
export type CsvEncoding = 'utf-8' | 'sjis';

// プロファイル（設定の保存単位）
export interface Profile {
  id: string;
  name: string;
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
  encoding?: CsvEncoding;
  dataFilter?: DataFilter;
  createdAt: number;
  updatedAt: number;
}

// コンバーター関数の型
export type ConverterFunction = (value: string, config: ConverterConfig, rowIndex?: number) => string;

// デフォルトコンバーター設定
export const defaultConverterConfig: ConverterConfig = {
  type: 'direct',
};

// ローカルストレージのキー
export const STORAGE_KEYS = {
  SOURCE_COLUMNS: 'csv-mapper-source-columns',
  TARGET_COLUMNS: 'csv-mapper-target-columns',
  MAPPINGS: 'csv-mapper-mappings',
  PROFILES: 'csv-mapper-profiles',
  CURRENT_PROFILE_ID: 'csv-mapper-current-profile-id',
  ENCODING: 'csv-mapper-encoding',
  DATA_FILTER: 'csv-mapper-data-filter',
} as const;
