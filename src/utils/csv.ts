import Papa from 'papaparse';
import type { Column } from '../types';

// CSVファイルをパース
export function parseCSV(file: File): Promise<{ columns: Column[]; data: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        // カラム名ベースの固定ID（同じ名前のカラムは同じID）
        const columns: Column[] = headers.map((name) => ({
          id: `source_${name}`,
          name,
        }));

        const data = (results.data as Record<string, string>[]).map((row) => {
          const newRow: Record<string, string> = {};
          columns.forEach((col, index) => {
            newRow[col.id] = row[headers[index]] || '';
          });
          return newRow;
        });

        resolve({ columns, data });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// データをCSV文字列に変換
export function generateCSV(data: Record<string, string>[], columns: Column[]): string {
  const headers = columns.map((col) => col.name);
  const rows = data.map((row) => columns.map((col) => row[col.id] || ''));

  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

// CSVをダウンロード
export function downloadCSV(csvString: string, filename: string = 'output.csv'): void {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
