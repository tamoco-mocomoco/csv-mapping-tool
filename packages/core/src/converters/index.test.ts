import { describe, it, expect } from 'vitest';
import { applyConverter, getConverterLabel } from './index';
import type { ConverterConfig } from '../types';

describe('applyConverter', () => {
  it('should apply direct converter', () => {
    const config: ConverterConfig = { type: 'direct' };
    expect(applyConverter('hello', config)).toBe('hello');
  });

  it('should apply split converter', () => {
    const config: ConverterConfig = { type: 'split', delimiter: ' ', index: 1 };
    expect(applyConverter('hello world', config)).toBe('world');
  });

  it('should apply replace converter', () => {
    const config: ConverterConfig = {
      type: 'replace',
      searchValue: '-',
      replaceValue: '',
    };
    expect(applyConverter('03-1234-5678', config)).toBe('0312345678');
  });

  it('should apply prefix converter', () => {
    const config: ConverterConfig = {
      type: 'prefix',
      prefixType: 'fixed',
      fixedPrefix: 'ID_',
    };
    expect(applyConverter('12345', config)).toBe('ID_12345');
  });

  it('should apply suffix converter', () => {
    const config: ConverterConfig = {
      type: 'suffix',
      suffix: '様',
    };
    expect(applyConverter('田中', config)).toBe('田中様');
  });

  it('should apply trim converter', () => {
    const config: ConverterConfig = { type: 'trim', trimType: 'both' };
    expect(applyConverter('  hello  ', config)).toBe('hello');
  });

  it('should apply case converter', () => {
    const config: ConverterConfig = { type: 'case', caseType: 'upper' };
    expect(applyConverter('hello', config)).toBe('HELLO');
  });

  it('should apply substring converter', () => {
    const config: ConverterConfig = {
      type: 'substring',
      substringStart: 0,
      substringEnd: 5,
    };
    expect(applyConverter('hello world', config)).toBe('hello');
  });

  it('should apply padding converter', () => {
    const config: ConverterConfig = {
      type: 'padding',
      padType: 'start',
      padChar: '0',
      padLength: 5,
    };
    expect(applyConverter('42', config)).toBe('00042');
  });

  it('should return original value for unknown converter type', () => {
    const config = { type: 'unknown' } as unknown as ConverterConfig;
    expect(applyConverter('hello', config)).toBe('hello');
  });
});

describe('getConverterLabel', () => {
  it('should return correct label for direct', () => {
    expect(getConverterLabel('direct')).toBe('そのまま');
  });

  it('should return correct label for split', () => {
    expect(getConverterLabel('split')).toBe('分割');
  });

  it('should return correct label for replace', () => {
    expect(getConverterLabel('replace')).toBe('置換');
  });

  it('should return correct label for prefix', () => {
    expect(getConverterLabel('prefix')).toBe('接頭辞付与');
  });

  it('should return correct label for suffix', () => {
    expect(getConverterLabel('suffix')).toBe('接尾辞付与');
  });

  it('should return correct label for trim', () => {
    expect(getConverterLabel('trim')).toBe('トリム');
  });

  it('should return correct label for case', () => {
    expect(getConverterLabel('case')).toBe('大文字/小文字');
  });

  it('should return correct label for substring', () => {
    expect(getConverterLabel('substring')).toBe('部分抽出');
  });

  it('should return correct label for padding', () => {
    expect(getConverterLabel('padding')).toBe('パディング');
  });

  it('should return type for unknown converter', () => {
    expect(getConverterLabel('unknown')).toBe('unknown');
  });
});
