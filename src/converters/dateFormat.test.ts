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
});
