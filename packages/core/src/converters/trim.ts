import type { ConverterConfig } from '../types';

export function trimConverter(value: string, config: ConverterConfig): string {
  const trimType = config.trimType || 'both';

  switch (trimType) {
    case 'start':
      return value.trimStart();
    case 'end':
      return value.trimEnd();
    case 'both':
    default:
      return value.trim();
  }
}
