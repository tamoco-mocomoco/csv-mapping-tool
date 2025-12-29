import type { ConverterConfig } from '../types';

export function suffixConverter(value: string, config: ConverterConfig): string {
  const suffix = config.suffix || '';
  return value + suffix;
}
