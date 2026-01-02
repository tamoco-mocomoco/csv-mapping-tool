import type { Mapping, Column, ConverterConfig } from '../types';
import { getSourceColumnIds } from '../types';
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
      const sourceIds = getSourceColumnIds(mapping);
      const targetColumn = targetColumns.find((c) => c.id === mapping.targetColumnId);

      if (sourceIds.length > 0 && targetColumn) {
        // 複数カラムの値を取得して結合
        const sourceValue = sourceIds
          .map((id) => {
            const col = sourceColumns.find((c) => c.id === id);
            return col ? (row[col.id] || '') : '';
          })
          .join(mapping.separator ?? '');

        // 複数コンバーターをパイプライン形式で適用
        const converters = mapping.converters || [{ type: 'direct' as const }];
        const convertedValue = applyConverters(sourceValue, converters, rowIndex);
        transformedRow[targetColumn.id] = convertedValue;
      }
    });

    return transformedRow;
  });
}
