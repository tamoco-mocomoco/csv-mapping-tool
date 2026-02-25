import Papa from 'papaparse';
import Encoding from 'encoding-japanese';
import type { Column } from '../types';

// ファイルをArrayBufferとして読み込み、UTF-8文字列に変換
function readFileAsUTF8(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const detected = Encoding.detect(buffer);
      if (detected && detected !== 'UTF8' && detected !== 'ASCII') {
        const converted = Encoding.convert(buffer, { to: 'UNICODE', from: detected });
        resolve(Encoding.codeToString(converted));
      } else {
        resolve(new TextDecoder('utf-8').decode(buffer));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// CSVファイルをパース
export function parseCSV(file: File): Promise<{ columns: Column[]; data: Record<string, string>[] }> {
  return readFileAsUTF8(file).then((text) => {
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
