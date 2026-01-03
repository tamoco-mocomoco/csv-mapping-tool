import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 表示されているShepherdステップを取得するセレクタ
const visibleShepherdStep = '.shepherd-element:not([hidden])';

test.describe('Tour Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // ツアーをリセット（未完了状態に）
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('ツアーを完了してマッピングが正しく設定される', async ({ page }) => {
    // サンプルCSVを作成
    const csvContent = `氏名,メールアドレス,電話番号
田中 太郎,TANAKA@EXAMPLE.COM,090-1234-5678
鈴木 花子,SUZUKI@EXAMPLE.COM,080-9876-5432
佐藤 次郎,SATO@EXAMPLE.COM,070-1111-2222`;
    const csvPath = path.join(__dirname, 'tour-sample.csv');
    fs.writeFileSync(csvPath, csvContent);

    try {
      // ツアーが自動的に開始されることを確認
      await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });

      // ステップ1: ウェルカム - 「始める」をクリック
      await page.getByRole('button', { name: '始める' }).click();

      // ステップ2: 変換前カラム - CSVをインポート
      await expect(page.locator(visibleShepherdStep)).toContainText('変換前カラムを設定');
      const sourceFileInput = page.locator('[data-tour="source-columns"] input[type="file"]');
      await sourceFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: '次へ' }).click();

      // ステップ3: 変換後カラム - 4つのカラムを追加
      await expect(page.locator(visibleShepherdStep)).toContainText('変換後カラムを設定');

      const targetColumns = ['姓', '名', 'メール（小文字）', '電話番号（ハイフンなし）'];
      for (const columnName of targetColumns) {
        await page.locator('[data-tour="target-columns"]').getByRole('button', { name: 'カラム追加' }).click();
        await page.getByRole('textbox', { name: 'カラム名' }).fill(columnName);
        await page.getByRole('button', { name: '保存' }).click();
        await page.waitForTimeout(200);
      }
      await page.getByRole('button', { name: '次へ' }).click();

      // ステップ4: CSVデータをインポート
      await expect(page.locator(visibleShepherdStep)).toContainText('CSVデータをインポート');
      const dataFileInput = page.locator('[data-tour="data-import"] input[type="file"]');
      await dataFileInput.setInputFiles(csvPath);
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: '次へ' }).click();

      // ステップ5: マッピング設定 - 「次へ」でマッピングが自動追加される
      await expect(page.locator(visibleShepherdStep)).toContainText('マッピングを設定');
      await page.getByRole('button', { name: '次へ' }).click();

      // マッピングが4つ追加されていることを確認
      await expect(page.locator('[data-testid="mapping-row"]')).toHaveCount(4);

      // ステップ6: プレビュー
      await expect(page.locator(visibleShepherdStep)).toContainText('結果を確認');
      await page.getByRole('button', { name: '次へ' }).click();

      // ステップ7: プロファイル - 完了
      await expect(page.locator(visibleShepherdStep)).toContainText('設定を保存');
      await page.getByRole('button', { name: '完了' }).click();

      // ツアーが終了したことを確認
      await expect(page.locator(visibleShepherdStep)).not.toBeVisible();

      // 変換後タブで結果を確認
      await page.getByRole('tab', { name: '変換後' }).click();
      await page.waitForTimeout(300);

      const previewTable = page.locator('[data-tour="preview"]').locator('table');

      // 氏名の分割を確認
      await expect(previewTable.locator('td').filter({ hasText: '田中' }).first()).toBeVisible();
      await expect(previewTable.locator('td').filter({ hasText: '太郎' }).first()).toBeVisible();

      // メールの小文字変換を確認
      await expect(previewTable.locator('td').filter({ hasText: 'tanaka@example.com' }).first()).toBeVisible();

      // 電話番号のハイフン除去を確認
      await expect(previewTable.locator('td').filter({ hasText: '09012345678' }).first()).toBeVisible();

    } finally {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
      }
    }
  });

  test('ツアーをスキップできる', async ({ page }) => {
    // ツアーが自動的に開始されることを確認
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });

    // 「スキップ」をクリック
    await page.getByRole('button', { name: 'スキップ' }).click();

    // ツアーが終了したことを確認
    await expect(page.locator(visibleShepherdStep)).not.toBeVisible();

    // ツアー完了フラグが設定されていることを確認
    const tourCompleted = await page.evaluate(() => {
      return localStorage.getItem('csv-mapper-tour-completed');
    });
    expect(tourCompleted).toBe('true');
  });

  test('ヘッダーからツアーを再開できる', async ({ page }) => {
    // まずツアーをスキップ
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'スキップ' }).click();
    await expect(page.locator(visibleShepherdStep)).not.toBeVisible();

    // ヘッダーの「使い方」ボタンをクリック
    await page.getByRole('button', { name: '使い方' }).click();

    // ツアーが再開されることを確認
    await expect(page.locator(visibleShepherdStep)).toBeVisible();
    await expect(page.locator(visibleShepherdStep)).toContainText('CSV マッピングツールへようこそ');
  });
});
