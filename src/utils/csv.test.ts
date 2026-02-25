import { describe, it, expect } from 'vitest';
import Encoding from 'encoding-japanese';
import { readFileAsText, parseCSV } from './csv';

// UTF-8文字列からSJISエンコードのFileを作成するヘルパー
function createSJISFile(content: string, filename = 'test.csv'): File {
  const unicodeArray = Encoding.stringToCode(content);
  const sjisArray = Encoding.convert(unicodeArray, { to: 'SJIS', from: 'UNICODE' });
  const uint8 = new Uint8Array(sjisArray);
  return new File([uint8], filename, { type: 'text/csv' });
}

// UTF-8エンコードのFileを作成するヘルパー
function createUTF8File(content: string, filename = 'test.csv'): File {
  return new File([content], filename, { type: 'text/csv' });
}

describe('readFileAsText', () => {
  it('UTF-8ファイルをそのまま読み込める', async () => {
    const content = '名前,年齢\n田中太郎,30\n';
    const file = createUTF8File(content);
    const result = await readFileAsText(file, 'utf-8');
    expect(result).toBe(content);
  });

  it('SJISファイルをencoding=sjisで読み込める', async () => {
    const content = '名前,年齢\n田中太郎,30\n';
    const file = createSJISFile(content);
    const result = await readFileAsText(file, 'sjis');
    expect(result).toBe(content);
  });

  it('SJIS特有の文字（半角カナ等）を正しく変換できる', async () => {
    const content = '項目,値\nｶﾀｶﾅ,ﾃｽﾄ\n';
    const file = createSJISFile(content);
    const result = await readFileAsText(file, 'sjis');
    expect(result).toBe(content);
  });

  it('ASCII文字のみのファイルを読み込める', async () => {
    const content = 'name,age\nAlice,30\n';
    const file = createUTF8File(content);
    const result = await readFileAsText(file, 'utf-8');
    expect(result).toBe(content);
  });

  it('デフォルトはUTF-8として読み込む', async () => {
    const content = '名前,年齢\n田中太郎,30\n';
    const file = createUTF8File(content);
    const result = await readFileAsText(file);
    expect(result).toBe(content);
  });
});

describe('parseCSV', () => {
  it('UTF-8のCSVを正しくパースできる', async () => {
    const content = '名前,年齢\n田中太郎,30\n鈴木花子,25\n';
    const file = createUTF8File(content);
    const { columns, data } = await parseCSV(file, 'utf-8');

    expect(columns).toHaveLength(2);
    expect(columns[0].name).toBe('名前');
    expect(columns[1].name).toBe('年齢');
    expect(data).toHaveLength(2);
    expect(data[0]['source_名前']).toBe('田中太郎');
    expect(data[1]['source_名前']).toBe('鈴木花子');
  });

  it('SJISのCSVをencoding=sjisで正しくパースできる', async () => {
    const content = '名前,年齢\n田中太郎,30\n鈴木花子,25\n';
    const file = createSJISFile(content);
    const { columns, data } = await parseCSV(file, 'sjis');

    expect(columns).toHaveLength(2);
    expect(columns[0].name).toBe('名前');
    expect(columns[1].name).toBe('年齢');
    expect(data).toHaveLength(2);
    expect(data[0]['source_名前']).toBe('田中太郎');
    expect(data[1]['source_名前']).toBe('鈴木花子');
  });

  it('SJISのCSVでカラム値が文字化けしない', async () => {
    const content = '都道府県,市区町村\n東京都,千代田区\n大阪府,大阪市\n';
    const file = createSJISFile(content);
    const { columns, data } = await parseCSV(file, 'sjis');

    expect(columns[0].name).toBe('都道府県');
    expect(columns[1].name).toBe('市区町村');
    expect(data[0]['source_都道府県']).toBe('東京都');
    expect(data[0]['source_市区町村']).toBe('千代田区');
    expect(data[1]['source_都道府県']).toBe('大阪府');
    expect(data[1]['source_市区町村']).toBe('大阪市');
  });
});
