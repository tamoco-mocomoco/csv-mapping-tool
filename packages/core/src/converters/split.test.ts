import { describe, it, expect } from 'vitest';
import { splitConverter } from './split';
import type { ConverterConfig } from '../types';

describe('splitConverter', () => {
  it('should split by space and return first part by default', () => {
    const config: ConverterConfig = { type: 'split' };
    expect(splitConverter('田中 太郎', config)).toBe('田中');
  });

  it('should split by custom delimiter', () => {
    const config: ConverterConfig = { type: 'split', delimiter: '-', index: 1 };
    expect(splitConverter('03-1234-5678', config)).toBe('1234');
  });

  it('should return specified index', () => {
    const config: ConverterConfig = { type: 'split', delimiter: ' ', index: 1 };
    expect(splitConverter('田中 太郎', config)).toBe('太郎');
  });

  it('should support negative index', () => {
    const config: ConverterConfig = { type: 'split', delimiter: '-', index: -1 };
    expect(splitConverter('03-1234-5678', config)).toBe('5678');
  });

  it('should return empty string for out of range index', () => {
    const config: ConverterConfig = { type: 'split', delimiter: ' ', index: 5 };
    expect(splitConverter('田中 太郎', config)).toBe('');
  });

  it('should return whole string if delimiter not found', () => {
    const config: ConverterConfig = { type: 'split', delimiter: ',', index: 0 };
    expect(splitConverter('田中太郎', config)).toBe('田中太郎');
  });

  it('should handle empty string', () => {
    const config: ConverterConfig = { type: 'split', delimiter: ' ', index: 0 };
    expect(splitConverter('', config)).toBe('');
  });
});
