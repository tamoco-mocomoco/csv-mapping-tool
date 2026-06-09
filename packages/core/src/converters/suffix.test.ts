import { describe, it, expect } from 'vitest';
import { suffixConverter } from './suffix';
import type { ConverterConfig } from '../types';

describe('suffixConverter', () => {
  it('should add suffix to value', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '様' };
    expect(suffixConverter('田中', config)).toBe('田中様');
  });

  it('should add unit suffix', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '円' };
    expect(suffixConverter('1000', config)).toBe('1000円');
  });

  it('should handle empty suffix', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '' };
    expect(suffixConverter('hello', config)).toBe('hello');
  });

  it('should handle undefined suffix', () => {
    const config: ConverterConfig = { type: 'suffix' };
    expect(suffixConverter('hello', config)).toBe('hello');
  });

  it('should handle empty value', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '様' };
    expect(suffixConverter('', config)).toBe('様');
  });

  it('should handle multi-character suffix', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: ' さん' };
    expect(suffixConverter('田中', config)).toBe('田中 さん');
  });

  it('should handle special characters in suffix', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '@example.com' };
    expect(suffixConverter('user', config)).toBe('user@example.com');
  });

  it('should handle numeric suffix', () => {
    const config: ConverterConfig = { type: 'suffix', suffix: '_001' };
    expect(suffixConverter('file', config)).toBe('file_001');
  });
});
