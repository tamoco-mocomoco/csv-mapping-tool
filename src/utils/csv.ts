import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import type { Column, CsvEncoding } from '../types';

// ファイルを指定エンコーディングで読み込み、文字列に変換
export async function readFileAsText(file: File, encoding: CsvEncoding = 'utf-8'): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  if (encoding === 'sjis') {
    const converted = Encoding.convert(buffer, { to: 'UNICODE', from: 'SJIS' });
    return Encoding.codeToString(converted);
  }
  return new TextDecoder('utf-8').decode(buffer);
}

// CSVファイルをパース
export async function parseCSV(file: File, encoding: CsvEncoding = 'utf-8'): Promise<{ columns: Column[]; data: Record<string, string>[] }> {
  const text = await readFileAsText(file, encoding);
  const results = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

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

  return { columns, data };
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
