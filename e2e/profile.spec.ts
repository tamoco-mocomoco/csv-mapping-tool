import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Profile Import/Export', () => {
  test.beforeEach(async ({ page }) => {
    // LocalStorageをクリアし、ツアーをスキップ
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('csv-mapper-tour-completed', 'true');
    });
    await page.reload();
  });

  test('should save a new profile', async ({ page }) => {
    await page.goto('/');

    // プロファイルメニューを開く
    await page.click('button:has-text("プロファイル")');

    // 新規保存をクリック
    await page.getByRole('menuitem', { name: '新規保存' }).click();

    // ダイアログが開くのを待つ
    await expect(page.getByRole('dialog')).toBeVisible();

    // プロファイル名を入力（MUIのTextField - ダイアログ内のテキストボックス）
    await page.getByRole('textbox').fill('テストプロファイル');
    await page.getByRole('button', { name: '保存' }).click();

    // ダイアログが閉じるのを待つ
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // プロファイルが保存されたことを確認
    await page.click('button:has-text("プロファイル")');
    // メニュー内のプロファイル名を確認
    await expect(page.getByRole('menu').getByText('テストプロファイル')).toBeVisible();
  });

  test('should export and import profile', async ({ page }) => {
    await page.goto('/');

    // まずプロファイルを保存
    await page.click('button:has-text("プロファイル")');
    await page.getByRole('menuitem', { name: '新規保存' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('textbox').fill('エクスポートテスト');
    await page.getByRole('button', { name: '保存' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // ダウンロードをキャプチャ
    await page.click('button:has-text("プロファイル")');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[title="エクスポート"]'),
    ]);

    // ダウンロードされたファイルを保存
    const downloadPath = path.join(__dirname, 'test-profile.json');
    await download.saveAs(downloadPath);

    // ファイルが存在することを確認
    expect(fs.existsSync(downloadPath)).toBe(true);

    // ファイルの内容を確認
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));
    expect(content.name).toBe('エクスポートテスト');

    // クリーンアップ
    fs.unlinkSync(downloadPath);
  });

  test('should import profile and overwrite existing', async ({ page }) => {
    await page.goto('/');

    // テスト用のプロファイルJSONを作成
    const testProfile = {
      name: '上書きテスト',
      sourceColumns: [{ id: 'src_1', name: 'Column1' }],
      targetColumns: [{ id: 'tgt_1', name: 'Target1' }],
      mappings: [],
    };
    const testProfilePath = path.join(__dirname, 'import-test.json');
    fs.writeFileSync(testProfilePath, JSON.stringify(testProfile));

    try {
      // まず同名のプロファイルを保存
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menuitem', { name: '新規保存' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('textbox').fill('上書きテスト');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // 同名のプロファイルをインポート（上書きダイアログが出るはず）
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menuitem', { name: 'インポート' }).click();

      // ファイルを選択（.json用のinputを指定）
      const fileInput = page.locator('input[type="file"][accept=".json"]');
      await fileInput.setInputFiles(testProfilePath);

      // 上書き確認ダイアログが表示されることを確認
      await expect(page.getByText('プロファイルの上書き確認')).toBeVisible();
      await expect(page.getByText('「上書きテスト」という名前のプロファイルは既に存在します')).toBeVisible();

      // 上書きをクリック
      await page.getByRole('button', { name: '上書き' }).click();

      // ダイアログが閉じることを確認
      await expect(page.getByText('プロファイルの上書き確認')).not.toBeVisible();

      // プロファイルメニューを開いて、プロファイルが1つだけ存在することを確認
      await page.click('button:has-text("プロファイル")');
      const profileItems = page.getByRole('menu').locator('li:has-text("上書きテスト")');
      await expect(profileItems).toHaveCount(1);
    } finally {
      // クリーンアップ
      if (fs.existsSync(testProfilePath)) {
        fs.unlinkSync(testProfilePath);
      }
    }
  });

  test('should import new profile without overwrite dialog', async ({ page }) => {
    await page.goto('/');

    // テスト用のプロファイルJSONを作成
    const testProfile = {
      name: '新規インポート',
      sourceColumns: [{ id: 'src_1', name: 'Column1' }],
      targetColumns: [{ id: 'tgt_1', name: 'Target1' }],
      mappings: [],
    };
    const testProfilePath = path.join(__dirname, 'new-import-test.json');
    fs.writeFileSync(testProfilePath, JSON.stringify(testProfile));

    try {
      // インポート
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menuitem', { name: 'インポート' }).click();

      // ファイルを選択（.json用のinputを指定）
      const fileInput = page.locator('input[type="file"][accept=".json"]');
      await fileInput.setInputFiles(testProfilePath);

      // 少し待つ
      await page.waitForTimeout(500);

      // 上書きダイアログは表示されない
      await expect(page.getByText('プロファイルの上書き確認')).not.toBeVisible();

      // プロファイルがインポートされたことを確認
      await page.click('button:has-text("プロファイル")');
      await expect(page.getByRole('menu').getByText('新規インポート')).toBeVisible();
    } finally {
      // クリーンアップ
      if (fs.existsSync(testProfilePath)) {
        fs.unlinkSync(testProfilePath);
      }
    }
  });

  test('should load profile data to screen after import', async ({ page }) => {
    await page.goto('/');

    // テスト用のプロファイルJSONを作成（カラム情報を含む）
    const testProfile = {
      name: '画面反映テスト',
      sourceColumns: [
        { id: 'src_1', name: 'SourceCol1' },
        { id: 'src_2', name: 'SourceCol2' },
      ],
      targetColumns: [
        { id: 'tgt_1', name: 'TargetCol1' },
        { id: 'tgt_2', name: 'TargetCol2' },
      ],
      mappings: [],
    };
    const testProfilePath = path.join(__dirname, 'load-test.json');
    fs.writeFileSync(testProfilePath, JSON.stringify(testProfile));

    try {
      // インポート
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menuitem', { name: 'インポート' }).click();

      const fileInput = page.locator('input[type="file"][accept=".json"]');
      await fileInput.setInputFiles(testProfilePath);

      await page.waitForTimeout(500);

      // インポート後、プロファイルを読み込む
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menu').getByText('画面反映テスト').click();

      // 画面にソースカラムが表示されることを確認（変換前カラムのカード内）
      await expect(page.getByText('SourceCol1').first()).toBeVisible();
      await expect(page.getByText('SourceCol2').first()).toBeVisible();

      // 画面にターゲットカラムが表示されることを確認
      await expect(page.getByText('TargetCol1').first()).toBeVisible();
      await expect(page.getByText('TargetCol2').first()).toBeVisible();
    } finally {
      if (fs.existsSync(testProfilePath)) {
        fs.unlinkSync(testProfilePath);
      }
    }
  });

  test('should auto-load profile after import', async ({ page }) => {
    await page.goto('/');

    // テスト用のプロファイルJSONを作成
    const testProfile = {
      name: '自動読み込みテスト',
      sourceColumns: [
        { id: 'src_1', name: 'AutoSourceCol' },
      ],
      targetColumns: [
        { id: 'tgt_1', name: 'AutoTargetCol' },
      ],
      mappings: [],
    };
    const testProfilePath = path.join(__dirname, 'auto-load-test.json');
    fs.writeFileSync(testProfilePath, JSON.stringify(testProfile));

    try {
      // インポート
      await page.click('button:has-text("プロファイル")');
      await page.getByRole('menuitem', { name: 'インポート' }).click();

      const fileInput = page.locator('input[type="file"][accept=".json"]');
      await fileInput.setInputFiles(testProfilePath);

      await page.waitForTimeout(500);

      // インポート後、自動的に画面にカラムが表示されることを確認
      await expect(page.getByText('AutoSourceCol').first()).toBeVisible();
      await expect(page.getByText('AutoTargetCol').first()).toBeVisible();

      // ヘッダーにプロファイル名が表示されることを確認
      await expect(page.locator('header').getByText('自動読み込みテスト')).toBeVisible();
    } finally {
      if (fs.existsSync(testProfilePath)) {
        fs.unlinkSync(testProfilePath);
      }
    }
  });
});
