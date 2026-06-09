import { test, expect } from '@playwright/test';

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
    // ページ描画 + ツアー自動開始（500ms遅延）を待つ
    await page.waitForTimeout(1000);
  });

  test('ツアーが手動ファイルインポートなしで最後まで進められる', async ({ page }) => {
    // ツアーが自動的に開始されることを確認
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });

    // ステップ1: ウェルカム - 「始める」をクリック
    await expect(page.locator(visibleShepherdStep)).toContainText('ようこそ');
    await page.getByRole('button', { name: '始める' }).click();

    // ステップ2: 変換前カラム
    // サンプルデータ自動投入により、手動インポートなしで「次へ」が押せること
    await expect(page.locator(visibleShepherdStep)).toContainText('変換前カラム');
    await page.getByRole('button', { name: '次へ' }).click();

    // ステップ3: 変換後カラム
    await expect(page.locator(visibleShepherdStep)).toContainText('変換後カラム');
    await page.getByRole('button', { name: '次へ' }).click();

    // ステップ4: CSVデータをインポート
    await expect(page.locator(visibleShepherdStep)).toContainText('CSVデータ');
    await page.getByRole('button', { name: '次へ' }).click();

    // ステップ5: マッピング設定
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

    // ツアー完了フラグが設定されていることを確認
    const tourCompleted = await page.evaluate(() => {
      return localStorage.getItem('csv-mapper-tour-completed');
    });
    expect(tourCompleted).toBe('true');
  });

  test('ツアー完了後に変換結果が正しくプレビューされる', async ({ page }) => {
    // ツアーを最後まで進める
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '始める' }).click();

    // 各ステップを「次へ」で進む
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '次へ' }).click();
      await page.waitForTimeout(300);
    }

    // 完了
    await page.getByRole('button', { name: '完了' }).click();

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

  test('オーバーレイがUIをブロックしない（ツアー中にページ要素が操作可能）', async ({ page }) => {
    // ツアー開始
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '始める' }).click();

    // ステップ2で、×ボタン（キャンセル）がクリック可能であること
    await expect(page.locator(visibleShepherdStep)).toBeVisible();
    const cancelButton = page.locator(visibleShepherdStep).locator('.shepherd-cancel-icon');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // ツアーがキャンセルされたことを確認
    await expect(page.locator(visibleShepherdStep)).not.toBeVisible();
  });

  test('alert()が表示されない（ツアーのバリデーションでalertを使わない）', async ({ page }) => {
    let alertTriggered = false;
    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      await dialog.dismiss();
    });

    // ツアー開始 → 全ステップを「次へ」で進む
    await expect(page.locator(visibleShepherdStep)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '始める' }).click();

    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: '次へ' }).click();
      await page.waitForTimeout(300);
    }

    await page.getByRole('button', { name: '完了' }).click();

    // ツアー中にalert()が一度も呼ばれていないこと
    expect(alertTriggered).toBe(false);
  });
});
