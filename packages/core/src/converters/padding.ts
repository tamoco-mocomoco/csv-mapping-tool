import type { ConverterConfig } from '../types';

export function paddingConverter(value: string, config: ConverterConfig): string {
  const padType = config.padType || 'start';
  const padChar = config.padChar || '0';
  const padLength = config.padLength ?? value.length;

  if (padLength <= value.length) {
    return value;
  }

  if (padType === 'start') {
    return value.padStart(padLength, padChar);
  } else {
    return value.padEnd(padLength, padChar);
  }
}
