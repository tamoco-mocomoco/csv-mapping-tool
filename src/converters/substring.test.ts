import { describe, it, expect } from 'vitest';
import { substringConverter } from './substring';
import type { ConverterConfig } from '../types';

describe('substringConverter', () => {
  it('should extract from start position to end', () => {
    const config: ConverterConfig = { type: 'substring', substringStart: 3 };
    expect(substringConverter('hello world', config)).toBe('lo world');
  });

  it('should extract from start position to end position', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 5,
    };
    expect(substringConverter('hello world', config)).toBe('hello');
  });

  it('should extract middle portion', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 3,
      substringEnd: 8,
    };
    expect(substringConverter('hello world', config)).toBe('lo wo');
  });

  it('should default to start position 0', () => {
    const config: ConverterConfig = { type: 'substring', substringEnd: 5 };
    expect(substringConverter('hello world', config)).toBe('hello');
  });

  it('should handle start position 0 explicitly', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 3,
    };
    expect(substringConverter('hello', config)).toBe('hel');
  });

  it('should handle end position beyond string length', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 100,
    };
    expect(substringConverter('hello', config)).toBe('hello');
  });

  it('should handle start position beyond string length', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 100,
    };
    expect(substringConverter('hello', config)).toBe('');
  });

  it('should handle empty string', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 5,
    };
    expect(substringConverter('', config)).toBe('');
  });

  it('should extract phone area code', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 3,
    };
    expect(substringConverter('03-1234-5678', config)).toBe('03-');
  });

  it('should handle Japanese text', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 3,
    };
    expect(substringConverter('東京都渋谷区', config)).toBe('東京都');
  });

  it('should extract from middle of Japanese text', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 3,
      substringEnd: 6,
    };
    expect(substringConverter('東京都渋谷区', config)).toBe('渋谷区');
  });
});
