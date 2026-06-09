import { describe, it, expect } from 'vitest';
import { trimConverter } from './trim';
import type { ConverterConfig } from '../types';

describe('trimConverter', () => {
  it('should trim both ends by default', () => {
    const config: ConverterConfig = { type: 'trim' };
    expect(trimConverter('  hello world  ', config)).toBe('hello world');
  });

  it('should trim both ends explicitly', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('  hello world  ', config)).toBe('hello world');
  });

  it('should trim start only', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'start' };
    expect(trimConverter('  hello world  ', config)).toBe('hello world  ');
  });

  it('should trim end only', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'end' };
    expect(trimConverter('  hello world  ', config)).toBe('  hello world');
  });

  it('should handle string with no whitespace', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('hello', config)).toBe('hello');
  });

  it('should handle empty string', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('', config)).toBe('');
  });

  it('should handle only whitespace', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('   ', config)).toBe('');
  });

  it('should handle tabs and newlines', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('\t\nhello\n\t', config)).toBe('hello');
  });

  it('should handle Japanese text with spaces', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(trimConverter('　田中太郎　', config)).toBe('田中太郎');
  });
});
