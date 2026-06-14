import type { Page } from '@playwright/test';

export const WIZARD_STEPS = {
  profile: 'プロファイル',
  columns: 'カラム定義',
  mapping: 'CSV取込 & マッピング',
  preview: 'プレビュー & 出力',
} as const;

export async function goToStep(page: Page, label: string) {
  await page.locator('.MuiStepButton-root').filter({ hasText: label }).first().click();
  await page.waitForTimeout(150);
}
