// カラム定義
export interface Column {
  id: string;
  name: string;
}

// コンバーター種別
export type ConverterType = 'direct' | 'split' | 'replace' | 'prefix' | 'suffix' | 'trim' | 'case' | 'substring' | 'padding';

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
}

// マッピング定義
export interface Mapping {
  id: string;
  sourceColumnId: string;
  targetColumnId: string;
  converters: ConverterConfig[]; // 複数コンバーターをパイプライン形式で適用
}

// アプリケーション状態
export interface MappingState {
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
  sourceData: Record<string, string>[];
}

// プロファイル（設定の保存単位）
export interface Profile {
  id: string;
  name: string;
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
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
} as const;
