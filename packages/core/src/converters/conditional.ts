import type { ConverterConfig } from '../types';

export function conditionalConverter(
  value: string,
  config: ConverterConfig,
  row?: Record<string, string>
): string {
  const { conditionColumnId, conditionPattern, conditionValue } = config;

  if (!conditionColumnId || !conditionPattern || conditionValue === undefined) {
    return value;
  }

  const targetValue = row?.[conditionColumnId] ?? '';

  let matched: boolean;
  try {
    const regex = new RegExp(conditionPattern);
    matched = regex.test(targetValue);
  } catch {
    // 無効な正規表現の場合は元の値を返す
    return value;
  }

  if (matched) {
    return conditionValue;
  }

  return config.conditionElseValue !== undefined && config.conditionElseValue !== ''
    ? config.conditionElseValue
    : value;
}
