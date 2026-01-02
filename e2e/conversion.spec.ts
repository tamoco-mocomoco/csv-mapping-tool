import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Complex CSV Conversions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('csv-mapper-tour-completed', 'true');
    });
    await page.reload();
  });

  test('1. 氏名の分割 + トリム', async ({ page }) => {
    // テスト用CSVを作成
    const csvContent = `氏名
 田中 太郎
 鈴木 花子 `;
    const csvPath = path.join(__dirname, 'test-name-split.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // 変換前カラムのインポート
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // 変換後カラムを追加
      await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
      await page.getByRole('textbox', { name: 'カラム名' }).fill('姓');
      await page.getByRole('button', { name: '保存' }).click();

      await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
      await page.getByRole('textbox', { name: 'カラム名' }).fill('名');
      await page.getByRole('button', { name: '保存' }).click();

      // CSVデータをインポート
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // マッピングを追加（姓: 分割 + トリム）
      await page.getByRole('button', { name: 'マッピング追加' }).click();
      await page.waitForTimeout(500);

      // 最初のマッピング設定
      const firstMapping = page.locator('[data-testid="mapping-row"]').first();

      // 変換元: 氏名は既にデフォルトで選択済み、変換先: 姓
      // 注: 新規マッピングは自動的に最初の変換元カラムを選択するため、
      //     同じカラムをクリックするとトグルで選択解除されてしまう
      await firstMapping.locator('[data-testid="target-column-select"]').click();
      await page.getByRole('option', { name: '姓' }).click();

      // コンバーター1: 分割
      await firstMapping.locator('[data-testid="converter-type-select"]').first().click();
      await page.getByRole('option', { name: '分割' }).click();
      await firstMapping.locator('[data-testid="split-delimiter-input"] input').fill(' ');
      await firstMapping.locator('[data-testid="split-index-input"] input').fill('1');

      // コンバーター追加: トリム
      await firstMapping.locator('[data-testid="add-converter-button"]').click();
      await firstMapping.locator('[data-testid="converter-type-select"]').last().click();
      await page.getByRole('option', { name: 'トリム' }).click();

      // 2つ目のマッピング（名）
      await page.getByRole('button', { name: 'マッピング追加' }).click();
      await page.waitForTimeout(500);

      const secondMapping = page.locator('[data-testid="mapping-row"]').nth(1);

      // 変換元: 氏名は既にデフォルトで選択済み、変換先: 名
      await secondMapping.locator('[data-testid="target-column-select"]').click();
      await page.getByRole('option', { name: '名' }).click();

      // コンバーター1: 分割
      await secondMapping.locator('[data-testid="converter-type-select"]').first().click();
      await page.getByRole('option', { name: '分割' }).click();
      await secondMapping.locator('[data-testid="split-delimiter-input"] input').fill(' ');
      await secondMapping.locator('[data-testid="split-index-input"] input').fill('2');

      // コンバーター追加: トリム
      await secondMapping.locator('[data-testid="add-converter-button"]').click();
      await secondMapping.locator('[data-testid="converter-type-select"]').last().click();
      await page.getByRole('option', { name: 'トリム' }).click();

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      // 結果を確認
      const previewTable = page.locator('[data-tour="preview"]').locator('table');
      await expect(previewTable.locator('td').filter({ hasText: '田中' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: '太郎' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });

  test('2. メールアドレスの正規化（トリム + 小文字）', async ({ page }) => {
    const csvContent = `メール
  TANAKA@Example.COM
  SUZUKI@TEST.CO.JP  `;
    const csvPath = path.join(__dirname, 'test-email.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // 変換前カラムのインポート
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // 変換後カラムを追加
      await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
      await page.getByRole('textbox', { name: 'カラム名' }).fill('正規化メール');
      await page.getByRole('button', { name: '保存' }).click();

      // CSVデータをインポート
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // マッピングを追加
      await page.getByRole('button', { name: 'マッピング追加' }).click();
      await page.waitForTimeout(500);

      const mappingCard = page.locator('[data-testid="mapping-row"]').first();

      // 変換元: メールは既にデフォルトで選択済み、変換先: 正規化メール
      await mappingCard.locator('[data-testid="target-column-select"]').click();
      await page.getByRole('option', { name: '正規化メール' }).click();

      // コンバーター1: トリム
      await mappingCard.locator('[data-testid="converter-type-select"]').first().click();
      await page.getByRole('option', { name: 'トリム' }).click();

      // コンバーター追加: 小文字
      await mappingCard.locator('[data-testid="add-converter-button"]').click();
      await mappingCard.locator('[data-testid="converter-type-select"]').last().click();
      await page.getByRole('option', { name: '大文字/小文字' }).click();
      await mappingCard.locator('[data-testid="case-type-select"]').click();
      await page.getByRole('option', { name: '小文字' }).click();

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      const previewTable = page.locator('[data-tour="preview"]').locator('table');
      await expect(previewTable.locator('td').filter({ hasText: 'tanaka@example.com' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: 'suzuki@test.co.jp' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });

  test('3. 日付の部分抽出（分割）', async ({ page }) => {
    const csvContent = `日付
2024-01-15
2023-12-25`;
    const csvPath = path.join(__dirname, 'test-date.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // 変換前カラムのインポート
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // 変換後カラムを追加（年、月、日）
      for (const name of ['年', '月', '日']) {
        await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
        await page.getByRole('textbox', { name: 'カラム名' }).fill(name);
        await page.getByRole('button', { name: '保存' }).click();
      }

      // CSVデータをインポート
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // マッピングを追加（年: インデックス0、月: インデックス1、日: インデックス2）
      const targets = [
        { name: '年', index: '0' },
        { name: '月', index: '1' },
        { name: '日', index: '2' },
      ];

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        await page.getByRole('button', { name: 'マッピング追加' }).click();
        await page.waitForTimeout(500);

        const mapping = page.locator('[data-testid="mapping-row"]').nth(i);

        // 変換元: 日付は既にデフォルトで選択済み、変換先: target.name
        await mapping.locator('[data-testid="target-column-select"]').click();
        await page.getByRole('option', { name: target.name }).click();

        // コンバーター: 分割
        await mapping.locator('[data-testid="converter-type-select"]').first().click();
        await page.getByRole('option', { name: '分割' }).click();
        await mapping.locator('[data-testid="split-delimiter-input"] input').fill('-');
        await mapping.locator('[data-testid="split-index-input"] input').fill(target.index);
      }

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      const previewTable = page.locator('[data-tour="preview"]').locator('table');
      // 最初の行: 2024, 01, 15
      await expect(previewTable.locator('td').filter({ hasText: '2024' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: '01' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: '15' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });

  test('4. 商品コード生成（大文字 + 接頭辞 + 接尾辞）', async ({ page }) => {
    const csvContent = `カテゴリ
food
electronics
clothing`;
    const csvPath = path.join(__dirname, 'test-product.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // 変換前カラムのインポート
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // 変換後カラムを追加
      await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
      await page.getByRole('textbox', { name: 'カラム名' }).fill('商品コード');
      await page.getByRole('button', { name: '保存' }).click();

      // CSVデータをインポート
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // マッピングを追加
      await page.getByRole('button', { name: 'マッピング追加' }).click();
      await page.waitForTimeout(500);

      const mappingCard = page.locator('[data-testid="mapping-row"]').first();

      // 変換元: カテゴリは既にデフォルトで選択済み、変換先: 商品コード
      await mappingCard.locator('[data-testid="target-column-select"]').click();
      await page.getByRole('option', { name: '商品コード' }).click();

      // コンバーター1: 大文字
      await mappingCard.locator('[data-testid="converter-type-select"]').first().click();
      await page.getByRole('option', { name: '大文字/小文字' }).click();
      // デフォルトで大文字が選択されている

      // コンバーター追加: 接頭辞
      await mappingCard.locator('[data-testid="add-converter-button"]').click();
      await mappingCard.locator('[data-testid="converter-type-select"]').nth(1).click();
      await page.getByRole('option', { name: '接頭辞付与' }).click();
      await mappingCard.locator('[data-testid="prefix-value-input"] input').fill('PRD-');

      // コンバーター追加: 接尾辞
      await mappingCard.locator('[data-testid="add-converter-button"]').click();
      await mappingCard.locator('[data-testid="converter-type-select"]').nth(2).click();
      await page.getByRole('option', { name: '接尾辞付与' }).click();
      await mappingCard.locator('[data-testid="suffix-value-input"] input').fill('-JP');

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      const previewTable = page.locator('[data-tour="preview"]').locator('table');
      await expect(previewTable.locator('td').filter({ hasText: 'PRD-FOOD-JP' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: 'PRD-ELECTRONICS-JP' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: 'PRD-CLOTHING-JP' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });

  test('5. 複数カラム結合（姓 + 名 → 氏名）', async ({ page }) => {
    const csvContent = `姓,名
田中,太郎
鈴木,花子`;
    const csvPath = path.join(__dirname, 'test-merge.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // 変換前カラムのインポート
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // 変換後カラムを追加
      await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
      await page.getByRole('textbox', { name: 'カラム名' }).fill('氏名');
      await page.getByRole('button', { name: '保存' }).click();

      // CSVデータをインポート
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);

      // マッピングを追加
      await page.getByRole('button', { name: 'マッピング追加' }).click();
      await page.waitForTimeout(500);

      const mappingCard = page.locator('[data-testid="mapping-row"]').first();

      // 変換元: 姓は既にデフォルトで選択済み、名を追加選択
      await mappingCard.locator('[data-testid="source-column-select"]').click();
      await page.getByRole('option', { name: '名' }).click(); // 名を追加（姓は既に選択済み）
      await page.keyboard.press('Escape'); // 複数選択ドロップダウンを閉じる

      // 区切り文字を設定（複数選択時に表示される）
      await mappingCard.locator('[data-testid="separator-input"] input').fill(' ');

      // 変換先: 氏名
      await mappingCard.locator('[data-testid="target-column-select"]').click();
      await page.getByRole('option', { name: '氏名' }).click();

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      const previewTable = page.locator('[data-tour="preview"]').locator('table');
      await expect(previewTable.locator('td').filter({ hasText: '田中 太郎' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: '鈴木 花子' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });
});
