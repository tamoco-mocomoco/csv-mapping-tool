import { describe, it, expect } from 'vitest';
import { replaceConverter } from './replace';
import type { ConverterConfig } from '../types';

describe('replaceConverter', () => {
  it('should replace search value with replace value', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: '-',
      replaceValue: '',
    };
    expect(replaceConverter('03-1234-5678', config)).toBe('0312345678');
  });

  it('should replace all occurrences', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: 'a',
      replaceValue: 'x',
    };
    expect(replaceConverter('banana', config)).toBe('bxnxnx');
  });

  it('should return original value if searchValue is empty', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: '',
      replaceValue: 'x',
    };
    expect(replaceConverter('hello', config)).toBe('hello');
  });

  it('should handle replacing with longer string', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: '-',
      replaceValue: '---',
    };
    expect(replaceConverter('a-b-c', config)).toBe('a---b---c');
  });

  it('should handle Japanese characters', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: '東京都',
      replaceValue: '大阪府',
    };
    expect(replaceConverter('東京都渋谷区1-2-3', config)).toBe('大阪府渋谷区1-2-3');
  });

  it('should handle empty string input', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: 'a',
      replaceValue: 'b',
    };
    expect(replaceConverter('', config)).toBe('');
  });

  it('should handle when search value not found', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: 'xyz',
      replaceValue: 'abc',
    };
    expect(replaceConverter('hello world', config)).toBe('hello world');
  });
});
