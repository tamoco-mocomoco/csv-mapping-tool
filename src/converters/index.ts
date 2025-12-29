import type { ConverterConfig } from '../types';
import { splitConverter } from './split';
import { replaceConverter } from './replace';
import { prefixConverter, clearRandomCache } from './prefix';
import { suffixConverter } from './suffix';
import { trimConverter } from './trim';
import { caseConverter } from './case';
import { substringConverter } from './substring';
import { paddingConverter } from './padding';

// そのままコピー
function directConverter(value: string): string {
  return value;
}

// コンバーターを適用
export function applyConverter(value: string, config: ConverterConfig, rowIndex?: number): string {
  switch (config.type) {
    case 'direct':
      return directConverter(value);
    case 'split':
      return splitConverter(value, config);
    case 'replace':
      return replaceConverter(value, config);
    case 'prefix':
      return prefixConverter(value, config, rowIndex);
    case 'suffix':
      return suffixConverter(value, config);
    case 'trim':
      return trimConverter(value, config);
    case 'case':
      return caseConverter(value, config);
    case 'substring':
      return substringConverter(value, config);
    case 'padding':
      return paddingConverter(value, config);
    default:
      return value;
  }
}

// コンバーター名を取得
export function getConverterLabel(type: string): string {
  switch (type) {
    case 'direct':
      return 'そのまま';
    case 'split':
      return '分割';
    case 'replace':
      return '置換';
    case 'prefix':
      return '接頭辞付与';
    case 'suffix':
      return '接尾辞付与';
    case 'trim':
      return 'トリム';
    case 'case':
      return '大文字/小文字';
    case 'substring':
      return '部分抽出';
    case 'padding':
      return 'パディング';
    default:
      return type;
  }
}

export { clearRandomCache };
