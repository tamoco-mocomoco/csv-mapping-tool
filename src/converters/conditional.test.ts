import { describe, it, expect } from 'vitest';
import { conditionalConverter } from './conditional';
import type { ConverterConfig } from '../types';

describe('conditionalConverter', () => {
  const baseConfig: ConverterConfig = {
    type: 'conditional',
    conditionColumnId: 'col1',
    conditionPattern: 'C\\d{8}',
    conditionValue: '法人',
  };

  it('should return conditionValue when pattern matches', () => {
    const row = { col1: 'C12345678' };
    expect(conditionalConverter('元の値', baseConfig, row)).toBe('法人');
  });

  it('should return original value when pattern does not match', () => {
    const row = { col1: 'P12345678' };
    expect(conditionalConverter('元の値', baseConfig, row)).toBe('元の値');
  });

  it('should return conditionElseValue when specified and pattern does not match', () => {
    const config: ConverterConfig = {
      ...baseConfig,
      conditionElseValue: '個人',
    };
    const row = { col1: 'P12345678' };
    expect(conditionalConverter('元の値', config, row)).toBe('個人');
  });

  it('should return original value when regex is invalid', () => {
    const config: ConverterConfig = {
      ...baseConfig,
      conditionPattern: '[invalid(',
    };
    const row = { col1: 'C12345678' };
    expect(conditionalConverter('元の値', config, row)).toBe('元の値');
  });

  it('should return original value when conditionColumnId is missing', () => {
    const config: ConverterConfig = {
      type: 'conditional',
      conditionPattern: '.*',
      conditionValue: 'test',
    };
    expect(conditionalConverter('元の値', config, { col1: 'abc' })).toBe('元の値');
  });

  it('should return original value when conditionPattern is missing', () => {
    const config: ConverterConfig = {
      type: 'conditional',
      conditionColumnId: 'col1',
      conditionValue: 'test',
    };
    expect(conditionalConverter('元の値', config, { col1: 'abc' })).toBe('元の値');
  });

  it('should return original value when row is undefined', () => {
    expect(conditionalConverter('元の値', baseConfig)).toBe('元の値');
  });

  it('should treat missing column value as empty string', () => {
    const config: ConverterConfig = {
      ...baseConfig,
      conditionPattern: '^$', // 空文字にマッチ
    };
    const row = { col2: 'other' }; // col1 が存在しない
    expect(conditionalConverter('元の値', config, row)).toBe('法人');
  });
});
