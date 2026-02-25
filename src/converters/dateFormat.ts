import type { ConverterConfig } from '../types';

// プレースホルダと正規表現のマッピング
const PLACEHOLDERS: Record<string, string> = {
  YYYY: '(\\d{1,4})',
  MM: '(\\d{1,2})',
  DD: '(\\d{1,2})',
  hh: '(\\d{1,2})',
  mm: '(\\d{1,2})',
  ss: '(\\d{1,2})',
};

// プレースホルダの順序（入力フォーマット中の出現順を検出するため）
const PLACEHOLDER_NAMES = ['YYYY', 'MM', 'DD', 'hh', 'mm', 'ss'];

// 正規表現の特殊文字をエスケープ
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 入力フォーマットから正規表現を生成し、プレースホルダの出現順を返す
function buildParseRegex(inputFormat: string): { regex: RegExp; order: string[] } {
  const order: string[] = [];
  let pattern = inputFormat;

  // プレースホルダの位置を特定して出現順を記録
  const positions: { name: string; index: number }[] = [];
  for (const name of PLACEHOLDER_NAMES) {
    const idx = pattern.indexOf(name);
    if (idx !== -1) {
      positions.push({ name, index: idx });
    }
  }
  positions.sort((a, b) => a.index - b.index);

  // プレースホルダを一時マーカーに置換（プレースホルダ同士の干渉を防ぐ）
  for (let i = 0; i < positions.length; i++) {
    pattern = pattern.replace(positions[i].name, `__PLACEHOLDER_${i}__`);
    order.push(positions[i].name);
  }

  // 残りの文字をエスケープ
  pattern = escapeRegExp(pattern);

  // マーカーをキャプチャグループに置換
  for (let i = 0; i < positions.length; i++) {
    pattern = pattern.replace(`__PLACEHOLDER_${i}__`, PLACEHOLDERS[positions[i].name]);
  }

  return { regex: new RegExp(`^${pattern}$`), order };
}

export function dateFormatConverter(value: string, config: ConverterConfig): string {
  if (!value) return '';

  const inputFormat = config.dateInputFormat;
  const outputFormat = config.dateOutputFormat;

  if (!inputFormat || !outputFormat) return value;

  const { regex, order } = buildParseRegex(inputFormat);
  const match = value.match(regex);

  if (!match) return value;

  // パースした値をマップに格納（デフォルト値付き）
  const values: Record<string, string> = {
    YYYY: '0000',
    MM: '00',
    DD: '00',
    hh: '00',
    mm: '00',
    ss: '00',
  };

  for (let i = 0; i < order.length; i++) {
    const raw = match[i + 1];
    const name = order[i];
    // ゼロパディング
    if (name === 'YYYY') {
      values[name] = raw.padStart(4, '0');
    } else {
      values[name] = raw.padStart(2, '0');
    }
  }

  // 月オフセットを適用
  const offsetMonths = config.dateOffsetMonths || 0;
  if (offsetMonths !== 0) {
    let year = parseInt(values.YYYY, 10);
    let month = parseInt(values.MM, 10) + offsetMonths;
    let day = parseInt(values.DD, 10);

    // 月のオーバーフロー/アンダーフローを年に繰り上げ・繰り下げ
    year += Math.floor((month - 1) / 12);
    month = ((((month - 1) % 12) + 12) % 12) + 1;

    // 日を対象月の最終日でクランプ
    const lastDay = new Date(year, month, 0).getDate();
    if (day > lastDay) day = lastDay;

    values.YYYY = year.toString().padStart(4, '0');
    values.MM = month.toString().padStart(2, '0');
    values.DD = day.toString().padStart(2, '0');
  }

  // 入力に時刻が含まれていない場合、末尾の Z を +09:00（JST）に置換
  const hasTimeInInput = order.some((name) => name === 'hh' || name === 'mm' || name === 'ss');
  let resolvedOutput = outputFormat;
  if (!hasTimeInInput && resolvedOutput.endsWith('Z')) {
    resolvedOutput = resolvedOutput.slice(0, -1) + '+09:00';
  }

  // 出力フォーマットのプレースホルダを置換
  let result = resolvedOutput;
  for (const name of PLACEHOLDER_NAMES) {
    result = result.replace(name, values[name]);
  }

  return result;
}
