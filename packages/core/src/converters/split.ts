import type { ConverterConfig } from '../types';

export function splitConverter(value: string, config: ConverterConfig): string {
  const delimiter = config.delimiter || ' ';
  const index = config.index ?? 0;

  const parts = value.split(delimiter);

  if (index < 0) {
    // 負のインデックスは末尾から
    const actualIndex = parts.length + index;
    return parts[actualIndex] ?? '';
  }

  return parts[index] ?? '';
}
