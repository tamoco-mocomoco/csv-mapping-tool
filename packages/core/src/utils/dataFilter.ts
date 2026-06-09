import type { DataFilter } from '../types';

export function applyDataFilter(
  sourceData: Record<string, string>[],
  transformedData: Record<string, string>[],
  dataFilter: DataFilter
): { filteredSource: Record<string, string>[]; filteredTransformed: Record<string, string>[] } {
  if (!dataFilter.enabled || !dataFilter.columnId || !dataFilter.pattern) {
    return { filteredSource: sourceData, filteredTransformed: transformedData };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(dataFilter.pattern);
  } catch {
    return { filteredSource: sourceData, filteredTransformed: transformedData };
  }

  const dataToFilter = dataFilter.columnType === 'source' ? sourceData : transformedData;
  const matchedIndices: number[] = [];

  dataToFilter.forEach((row, index) => {
    const value = row[dataFilter.columnId] ?? '';
    if (regex.test(value)) {
      matchedIndices.push(index);
    }
  });

  return {
    filteredSource: matchedIndices.map((i) => sourceData[i]),
    filteredTransformed: matchedIndices.map((i) => transformedData[i]),
  };
}
