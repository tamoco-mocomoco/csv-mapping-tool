import type { ConverterConfig } from '../types';

export function caseConverter(value: string, config: ConverterConfig): string {
  const caseType = config.caseType || 'upper';

  switch (caseType) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'capitalize':
      return value
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    default:
      return value;
  }
}
