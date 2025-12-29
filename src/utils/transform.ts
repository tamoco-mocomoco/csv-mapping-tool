import type { Mapping, Column, ConverterConfig } from '../types';
import { applyConverter, clearRandomCache } from '../converters';

// 複数コンバーターをパイプライン形式で適用
function applyConverters(
  value: string,
  converters: ConverterConfig[],
  rowIndex: number
): string {
  return converters.reduce((currentValue, config) => {
    return applyConverter(currentValue, config, rowIndex);
  }, value);
}

export function transformData(
  sourceData: Record<string, string>[],
  mappings: Mapping[],
  sourceColumns: Column[],
  targetColumns: Column[]
): Record<string, string>[] {
  // ランダムキャッシュをクリア
  clearRandomCache();

  return sourceData.map((row, rowIndex) => {
    const transformedRow: Record<string, string> = {};

    // 全ターゲットカラムを初期化
    targetColumns.forEach((col) => {
      transformedRow[col.id] = '';
    });

    // マッピングを適用
    mappings.forEach((mapping) => {
      const sourceColumn = sourceColumns.find((c) => c.id === mapping.sourceColumnId);
      const targetColumn = targetColumns.find((c) => c.id === mapping.targetColumnId);

      if (sourceColumn && targetColumn) {
        const sourceValue = row[sourceColumn.id] || '';
        // 複数コンバーターをパイプライン形式で適用
        const converters = mapping.converters || [{ type: 'direct' as const }];
        const convertedValue = applyConverters(sourceValue, converters, rowIndex);
        transformedRow[targetColumn.id] = convertedValue;
      }
    });

    return transformedRow;
  });
}
