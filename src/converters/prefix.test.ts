import { describe, it, expect, beforeEach } from 'vitest';
import { prefixConverter, clearRandomCache } from './prefix';
import type { ConverterConfig } from '../types';

describe('prefixConverter', () => {
  beforeEach(() => {
    clearRandomCache();
  });

  describe('fixed prefix', () => {
    it('should add fixed prefix', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'fixed',
        fixedPrefix: 'ID_',
      };
      expect(prefixConverter('12345', config)).toBe('ID_12345');
    });

    it('should handle empty fixed prefix', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'fixed',
        fixedPrefix: '',
      };
      expect(prefixConverter('12345', config)).toBe('12345');
    });

    it('should default to fixed type', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        fixedPrefix: 'PRE_',
      };
      expect(prefixConverter('value', config)).toBe('PRE_value');
    });
  });

  describe('random prefix', () => {
    it('should add random prefix of specified length', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'random',
        randomLength: 5,
      };
      const result = prefixConverter('value', config);
      expect(result).toHaveLength(5 + 5); // 5 random chars + "value"
      expect(result.endsWith('value')).toBe(true);
    });

    it('should use default length of 8 if not specified', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'random',
      };
      const result = prefixConverter('value', config);
      expect(result).toHaveLength(8 + 5); // 8 random chars + "value"
    });

    it('should cache random value for same row index', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'random',
        randomLength: 8,
      };
      const result1 = prefixConverter('value1', config, 0);
      const result2 = prefixConverter('value2', config, 0);
      const prefix1 = result1.slice(0, 8);
      const prefix2 = result2.slice(0, 8);
      expect(prefix1).toBe(prefix2);
    });

    it('should generate different values for different row indices', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'random',
        randomLength: 8,
      };
      const result1 = prefixConverter('value', config, 0);
      const result2 = prefixConverter('value', config, 1);
      const prefix1 = result1.slice(0, 8);
      const prefix2 = result2.slice(0, 8);
      // Very unlikely to be the same
      expect(prefix1).not.toBe(prefix2);
    });
  });

  describe('date prefix', () => {
    it('should add date prefix with default format', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'date',
      };
      const result = prefixConverter('value', config);
      // Default format is YYYYMMDD
      expect(result).toMatch(/^\d{8}value$/);
    });

    it('should add date prefix with custom format', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'date',
        dateFormat: 'YYYY-MM-DD_',
      };
      const result = prefixConverter('value', config);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_value$/);
    });

    it('should support time format', () => {
      const config: ConverterConfig = {
        type: 'prefix',
        prefixType: 'date',
        dateFormat: 'HH:mm:ss_',
      };
      const result = prefixConverter('value', config);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}_value$/);
    });
  });
});
