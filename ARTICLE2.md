---
title: "CSVマッピングツールを改善した！ツアー機能・E2Eテスト・複数カラム結合"
emoji: "🚀"
type: "tech"
topics: ["react", "typescript", "playwright", "githubactions", "shepherdjs"]
published: false
---

## はじめに

[前回の記事](https://zenn.dev/lecto/articles/a2b77f2b9f8177)で紹介した「ブラウザで完結する CSV マッピングツール」に、いくつかの機能を追加しました。

https://github.com/tamoco-mocomoco/csv-mapping-tool

**デモサイト:** https://tamoco-mocomoco.github.io/csv-mapping-tool/

今回追加した機能は以下の 3 つです：

1. **インタラクティブなツアー機能** - 初めてのユーザー向けガイド
2. **E2E テストと ci 設定** - Playwright + GitHub Actions
3. **複数カラム結合機能** - 「姓」+「名」→「氏名」のような結合

## 1. インタラクティブなツアー機能

### 課題

ツールを公開したものの、初めて使うユーザーにとっては操作方法が分かりにくいという問題がありました。README やドキュメントを読まなくても、直感的に使い方を理解できるようにしたいと考えました。

### 解決策：Shepherd.js

[Shepherd.js](https://shepherdjs.dev/)を使って、インタラクティブなツアー機能を実装しました。

![](https://storage.googleapis.com/zenn-user-upload/94237e5930f5-20260104.gif)

### 実装のポイント

```typescript
import Shepherd from "shepherd.js";

export function useTour(actions?: TourActions) {
  const startTour = useCallback(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: "shepherd-theme-custom",
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });

    tour.addStep({
      id: "welcome",
      text: `
        <h3>CSV マッピングツールへようこそ！</h3>
        <p>このツアーでは、サンプルデータを使って実際の操作を体験できます。</p>
      `,
      buttons: [
        { text: "スキップ", action: tour.cancel, secondary: true },
        { text: "始める", action: tour.next },
      ],
    });

    // 各ステップを追加...
    tour.start();
  }, [actions]);

  return { startTour, shouldShowTour, resetTour };
}
```

### ツアーの流れ

| ステップ          | 内容                                    |
| ----------------- | --------------------------------------- |
| 1. ウェルカム     | ツアーの説明                            |
| 2. 変換前カラム   | サンプル CSV のダウンロードとインポート |
| 3. 変換後カラム   | カラムの追加方法                        |
| 4. CSV データ     | データのインポート                      |
| 5. マッピング設定 | 自動でサンプルマッピングを追加          |
| 6. プレビュー     | 変換結果の確認方法                      |
| 7. プロファイル   | 設定の保存方法                          |

### 工夫した点

- **サンプル CSV のダウンロード機能**: ツアー中にサンプルデータをダウンロードできるようにした
- **サンプルマッピングの自動追加**: 「次へ」ボタンを押すと、適切なマッピングが自動で設定される
- **MUI との共存**: MUI のモーダルと Shepherd のオーバーレイの z-index 調整

```css
/* MUIのモーダルをShepherdより上に表示 */
.MuiModal-root {
  z-index: 1300 !important;
}
.shepherd-element {
  z-index: 1250;
}
```

## 2. E2E テストと ci 設定

### Playwright による e2e テスト

複雑な CSV 変換のシナリオを E2E テストでカバーしました。

```typescript
test("氏名の分割 + トリム", async ({ page }) => {
  const csvContent = `氏名
 田中 太郎
 鈴木 花子 `;

  // CSVをインポート
  const sourceFileInput = page.locator(
    '[data-tour="source-columns"] input[type="file"]'
  );
  await sourceFileInput.setInputFiles(csvPath);

  // マッピングを設定
  await page.getByRole("button", { name: "マッピング追加" }).click();
  const firstMapping = page.locator('[data-testid="mapping-row"]').first();

  // コンバーター設定: 分割 → トリム
  await firstMapping.locator('[data-testid="converter-type-select"]').click();
  await page.getByRole("option", { name: "分割" }).click();
  await firstMapping
    .locator('[data-testid="split-delimiter-input"] input')
    .fill(" ");

  // 結果を検証
  await page.getByRole("tab", { name: "変換後" }).click();
  const previewTable = page.locator('[data-tour="preview"]').locator("table");
  await expect(
    previewTable.locator("td").filter({ hasText: "田中" })
  ).toBeVisible();
});
```

### テストケース

| テスト              | 内容                                              |
| ------------------- | ------------------------------------------------- |
| 氏名の分割 + トリム | 「 田中 太郎 」→ 姓:「田中」、名:「太郎」         |
| メールの正規化      | 「 TANAKA@EXAMPLE.COM 」→「tanaka@example.com」   |
| 日付の部分抽出      | 「2024-01-15」→ 年:「2024」、月:「01」、日:「15」 |
| 商品コード生成      | 「food」→「PRD-FOOD-JP」                          |
| 複数カラム結合      | 姓:「田中」+ 名:「太郎」→「田中 太郎」            |

### data-testid 属性の活用

MUI コンポーネントは label 属性での選択が難しいため、`data-testid`属性を追加しました。

```tsx
<Select multiple value={validSourceIds} data-testid="source-column-select">
  {/* ... */}
</Select>
```

### GitHub Actions による CI

プッシュ時に自動でテストを実行するワークフローを設定しました。

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Type check
        run: npm run build

      - name: Run unit tests
        run: npm run test:run

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 3. 複数カラム結合機能

### 課題

前回の記事では「今後の展望」として挙げていた機能の 1 つに**複数カラムの結合**がありました。

> - [ ] 複数カラムの結合

例えば、「姓」と「名」を結合して「氏名」にしたいというユースケースです。

### 実装

#### 型定義の変更

後方互換性を保ちつつ、複数カラムに対応しました。

```typescript
export interface Mapping {
  id: string;
  sourceColumnId?: string; // 旧形式（後方互換性用）
  sourceColumnIds?: string[]; // 新形式（複数カラム対応）
  targetColumnId: string;
  converters: ConverterConfig[];
  separator?: string; // 結合時の区切り文字
}

// ヘルパー関数で統一的に扱う
export function getSourceColumnIds(mapping: Mapping): string[] {
  if (mapping.sourceColumnIds && mapping.sourceColumnIds.length > 0) {
    return mapping.sourceColumnIds;
  }
  if (mapping.sourceColumnId) {
    return [mapping.sourceColumnId];
  }
  return [];
}
```

#### 変換ロジック

```typescript
mappings.forEach((mapping) => {
  const sourceIds = getSourceColumnIds(mapping);
  const targetColumn = targetColumns.find(
    (c) => c.id === mapping.targetColumnId
  );

  if (sourceIds.length > 0 && targetColumn) {
    // 複数カラムの値を取得して結合
    const sourceValue = sourceIds
      .map((id) => {
        const col = sourceColumns.find((c) => c.id === id);
        return col ? row[col.id] || "" : "";
      })
      .join(mapping.separator ?? "");

    // コンバーターを適用
    const convertedValue = applyConverters(sourceValue, converters, rowIndex);
    transformedRow[targetColumn.id] = convertedValue;
  }
});
```

#### UI：複数選択ドロップダウン

MUI の Select コンポーネントで`multiple`属性を使用し、選択したカラムを Chip で表示します。

```tsx
<FormControl size="small" sx={{ minWidth: 200 }}>
  <InputLabel>変換元</InputLabel>
  <Select
    multiple
    value={validSourceIds}
    onChange={(e) => {
      onUpdate({
        sourceColumnIds: e.target.value as string[],
        sourceColumnId: undefined,
      });
    }}
    renderValue={(selected) => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {(selected as string[]).map((id) => {
          const col = sourceColumns.find((c) => c.id === id);
          return <Chip key={id} label={col?.name} size="small" />;
        })}
      </Box>
    )}
  >
    {sourceColumns.map((col) => (
      <MenuItem key={col.id} value={col.id}>
        <Checkbox checked={validSourceIds.includes(col.id)} />
        <ListItemText primary={col.name} />
      </MenuItem>
    ))}
  </Select>
</FormControl>;

{
  /* 複数選択時のみ区切り文字入力を表示 */
}
{
  validSourceIds.length > 1 && (
    <TextField
      size="small"
      label="区切り文字"
      value={mapping.separator ?? ""}
      onChange={(e) => onUpdate({ separator: e.target.value })}
    />
  );
}
```

### 使用例

**入力 CSV:**

```csv
姓,名
田中,太郎
鈴木,花子
```

**マッピング設定:**

- 変換元: 姓, 名（複数選択）
- 区切り文字: スペース
- 変換先: 氏名

**出力 CSV:**

```csv
氏名
田中 太郎
鈴木 花子
```

### 後方互換性

| データ形式                  | 読み込み                           | 保存         |
| --------------------------- | ---------------------------------- | ------------ |
| 旧形式（`sourceColumnId`）  | `getSourceColumnIds()`で配列に変換 | 新形式で保存 |
| 新形式（`sourceColumnIds`） | そのまま使用                       | そのまま保存 |

既存のプロファイルも問題なく読み込めます。

## まとめ

今回は以下の機能を追加しました：

1. **ツアー機能**: Shepherd.js で初めてのユーザーをガイド
2. **E2E テスト + ci**: Playwright + GitHub Actions で品質を担保
3. **複数カラム結合**: 「姓」+「名」→「氏名」のようなユースケースに対応

### 今後の展望

前回挙げた機能のうち、複数カラム結合は実装できました。残りは：

- [ ] 正規表現によるマッチング・置換
- [ ] 条件分岐（IF 文的な処理）
- [ ] カスタム JavaScript 関数の実行
- [ ] バッチ処理（複数ファイルの一括変換）

引き続き機能追加していきたいと思います。

## リンク

- **リポジトリ**: https://github.com/tamoco-mocomoco/csv-mapping-tool
- **デモサイト**: https://tamoco-mocomoco.github.io/csv-mapping-tool/
- **前回の記事**: [ブラウザで完結する CSV マッピングツールを作ってみた](https://zenn.dev/lecto/articles/a2b77f2b9f8177)
