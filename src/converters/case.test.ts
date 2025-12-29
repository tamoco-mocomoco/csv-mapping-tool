import { describe, it, expect } from 'vitest';
import { caseConverter } from './case';
import type { ConverterConfig } from '../types';

describe('caseConverter', () => {
  describe('uppercase', () => {
    it('should convert to uppercase by default', () => {
      const config: ConverterConfig = { type: 'case' };
      expect(caseConverter('hello world', config)).toBe('HELLO WORLD');
    });

    it('should convert to uppercase explicitly', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'upper' };
      expect(caseConverter('hello world', config)).toBe('HELLO WORLD');
    });

    it('should handle mixed case', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'upper' };
      expect(caseConverter('HeLLo WoRLd', config)).toBe('HELLO WORLD');
    });
  });

  describe('lowercase', () => {
    it('should convert to lowercase', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'lower' };
      expect(caseConverter('HELLO WORLD', config)).toBe('hello world');
    });

    it('should handle mixed case', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'lower' };
      expect(caseConverter('HeLLo WoRLd', config)).toBe('hello world');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of each word', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'capitalize' };
      expect(caseConverter('hello world', config)).toBe('Hello World');
    });

    it('should handle already capitalized text', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'capitalize' };
      expect(caseConverter('HELLO WORLD', config)).toBe('Hello World');
    });

    it('should handle single word', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'capitalize' };
      expect(caseConverter('hello', config)).toBe('Hello');
    });

    it('should handle multiple spaces', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'capitalize' };
      expect(caseConverter('hello   world', config)).toBe('Hello World');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'upper' };
      expect(caseConverter('', config)).toBe('');
    });

    it('should handle numbers', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'upper' };
      expect(caseConverter('abc123', config)).toBe('ABC123');
    });

    it('should handle special characters', () => {
      const config: ConverterConfig = { type: 'case', caseType: 'lower' };
      expect(caseConverter('HELLO@WORLD.COM', config)).toBe('hello@world.com');
    });
  });
});
