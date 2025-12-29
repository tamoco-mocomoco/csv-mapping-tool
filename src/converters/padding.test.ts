import { describe, it, expect } from 'vitest';
import { paddingConverter } from './padding';
import type { ConverterConfig } from '../types';

describe('paddingConverter', () => {
  describe('start padding', () => {
    it('should pad at start with zeros by default', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padLength: 5,
      };
      expect(paddingConverter('42', config)).toBe('00042');
    });

    it('should pad at start with custom character', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padChar: '_',
        padLength: 5,
      };
      expect(paddingConverter('42', config)).toBe('___42');
    });

    it('should not pad if string is already long enough', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padChar: '0',
        padLength: 3,
      };
      expect(paddingConverter('12345', config)).toBe('12345');
    });

    it('should not pad if string equals target length', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padChar: '0',
        padLength: 5,
      };
      expect(paddingConverter('12345', config)).toBe('12345');
    });
  });

  describe('end padding', () => {
    it('should pad at end', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'end',
        padChar: '0',
        padLength: 5,
      };
      expect(paddingConverter('42', config)).toBe('42000');
    });

    it('should pad at end with custom character', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'end',
        padChar: ' ',
        padLength: 10,
      };
      expect(paddingConverter('hello', config)).toBe('hello     ');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padChar: '0',
        padLength: 5,
      };
      expect(paddingConverter('', config)).toBe('00000');
    });

    it('should default to start padding', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padChar: '0',
        padLength: 5,
      };
      expect(paddingConverter('42', config)).toBe('00042');
    });

    it('should default to zero as pad character', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padLength: 5,
      };
      expect(paddingConverter('42', config)).toBe('00042');
    });

    it('should handle padLength of 0', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'start',
        padChar: '0',
        padLength: 0,
      };
      expect(paddingConverter('42', config)).toBe('42');
    });

    it('should handle Japanese text', () => {
      const config: ConverterConfig = {
        type: 'padding',
        padType: 'end',
        padChar: '　',
        padLength: 5,
      };
      expect(paddingConverter('田中', config)).toBe('田中　　　');
    });
  });
});
