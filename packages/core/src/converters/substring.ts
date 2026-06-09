import type { ConverterConfig } from '../types';

export function substringConverter(value: string, config: ConverterConfig): string {
  const start = config.substringStart ?? 0;
  const end = config.substringEnd;

  if (end !== undefined) {
    return value.substring(start, end);
  }
  return value.substring(start);
}
