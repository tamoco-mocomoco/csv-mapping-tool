import { describe, it, expect } from 'vitest';
import { dateFormatConverter } from './dateFormat';
import type { ConverterConfig } from '../types';

describe('dateFormatConverter', () => {
  it('should convert YYYY年MM月DD日 to ISO format with JST timezone', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY年MM月DD日',
      dateOutputFormat: 'YYYY-MM-DDThh:mm:ssZ',
    };
    expect(dateFormatConverter('2024年11月30日', config)).toBe('2024-11-30T00:00:00+09:00');
  });

  it('should convert YYYY/MM/DD to YYYY-MM-DD', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
    };
    expect(dateFormatConverter('2024/11/30', config)).toBe('2024-11-30');
  });

  it('should handle input with time components', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY-MM-DD hh:mm:ss',
      dateOutputFormat: 'YYYY/MM/DD hh時mm分ss秒',
    };
    expect(dateFormatConverter('2024-01-15 09:30:45', config)).toBe('2024/01/15 09時30分45秒');
  });

  it('should pad single-digit values with zeros', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
    };
    expect(dateFormatConverter('2024/1/5', config)).toBe('2024-01-05');
  });

  it('should use JST (+09:00) when input has no time and output ends with Z', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DDThh:mm:ssZ',
    };
    expect(dateFormatConverter('2024/11/30', config)).toBe('2024-11-30T00:00:00+09:00');
  });

  it('should keep Z when input has time components', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD hh:mm:ss',
      dateOutputFormat: 'YYYY-MM-DDThh:mm:ssZ',
    };
    expect(dateFormatConverter('2024/11/30 15:30:00', config)).toBe('2024-11-30T15:30:00Z');
  });

  it('should return original value when parse fails', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY年MM月DD日',
      dateOutputFormat: 'YYYY-MM-DD',
    };
    expect(dateFormatConverter('invalid date', config)).toBe('invalid date');
  });

  it('should return empty string for empty input', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY年MM月DD日',
      dateOutputFormat: 'YYYY-MM-DD',
    };
    expect(dateFormatConverter('', config)).toBe('');
  });

  it('should return original value when formats are not configured', () => {
    const config: ConverterConfig = { type: 'dateFormat' };
    expect(dateFormatConverter('2024年11月30日', config)).toBe('2024年11月30日');
  });

  it('should handle DD/MM/YYYY format', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'DD/MM/YYYY',
      dateOutputFormat: 'YYYY-MM-DD',
    };
    expect(dateFormatConverter('30/11/2024', config)).toBe('2024-11-30');
  });

  // 月オフセットのテスト
  it('should subtract 1 month with dateOffsetMonths=-1', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: -1,
    };
    expect(dateFormatConverter('2024/03/15', config)).toBe('2024-02-15');
  });

  it('should handle year boundary when subtracting months', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: -1,
    };
    expect(dateFormatConverter('2024/01/15', config)).toBe('2023-12-15');
  });

  it('should clamp day to last day of target month', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: -1,
    };
    // 3月31日 → 2月は29日まで（2024年はうるう年）
    expect(dateFormatConverter('2024/03/31', config)).toBe('2024-02-29');
  });

  it('should add months with positive offset', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: 2,
    };
    expect(dateFormatConverter('2024/11/15', config)).toBe('2025-01-15');
  });

  it('should not change date when offset is 0', () => {
    const config: ConverterConfig = {
      type: 'dateFormat',
      dateInputFormat: 'YYYY/MM/DD',
      dateOutputFormat: 'YYYY-MM-DD',
      dateOffsetMonths: 0,
    };
    expect(dateFormatConverter('2024/03/15', config)).toBe('2024-03-15');
  });
});
