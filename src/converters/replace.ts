import type { ConverterConfig } from '../types';

export function replaceConverter(value: string, config: ConverterConfig): string {
  const searchValue = config.searchValue || '';
  const replaceValue = config.replaceValue || '';

  if (!searchValue) {
    return value;
  }

  // グローバル置換
  return value.split(searchValue).join(replaceValue);
}
