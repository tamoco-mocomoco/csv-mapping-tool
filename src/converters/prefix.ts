import type { ConverterConfig } from '../types';

// ランダム文字列を生成
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 日付フォーマット
function formatDate(format: string): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// ランダム文字列のキャッシュ（同じ変換では同じランダム値を使用）
const randomCache = new Map<number, string>();

export function prefixConverter(value: string, config: ConverterConfig, rowIndex?: number): string {
  const prefixType = config.prefixType || 'fixed';

  let prefix = '';

  switch (prefixType) {
    case 'fixed':
      prefix = config.fixedPrefix || '';
      break;
    case 'random': {
      const length = config.randomLength || 8;
      // 行ごとに異なるランダム値を生成するが、同じ行では同じ値を使用
      if (rowIndex !== undefined) {
        if (!randomCache.has(rowIndex)) {
          randomCache.set(rowIndex, generateRandomString(length));
        }
        prefix = randomCache.get(rowIndex)!;
      } else {
        prefix = generateRandomString(length);
      }
      break;
    }
    case 'date':
      prefix = formatDate(config.dateFormat || 'YYYYMMDD');
      break;
  }

  return prefix + value;
}

// キャッシュをクリア（新しい変換開始時に呼び出す）
export function clearRandomCache(): void {
  randomCache.clear();
}
