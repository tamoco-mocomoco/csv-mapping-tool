---
title: "ブラウザで完結するCSVマッピングツールを作ってみた"
emoji: "📊"
type: "tech"
topics: ["react", "typescript", "csv", "vite", "materialui"]
published: false
---

## はじめに

CSV ファイルのカラムを別のフォーマットに変換したい場面は意外と多いものです。例えば：

- 「氏名」カラムを「姓」と「名」に分割したい
- 商品コードに日付の接頭辞を付けたい
- 特定の文字列を置換したい

こういった作業を Excel やスプレッドシートで手作業で行うのは面倒ですし、Python スクリプトを書くのも毎回のことだと大変です。

**「ブラウザで動く CSV マッピングツールがあれば便利なのに」** と思って探してみましたが、意外と見当たりませんでした。あっても機能が限定的だったり、サーバーにデータをアップロードする必要があったり...

そこで、**完全にブラウザ内で完結する**CSV マッピングツールを作ってみました。

https://github.com/tamoco-mocomoco/csv-mapping-tool

**デモサイト:** https://tamoco-mocomoco.github.io/csv-mapping-tool/

## 作ったもの：スクリーンショット

### カラムの設定

![](https://storage.googleapis.com/zenn-user-upload/311bc1985eb4-20251229.png)

### マッピングの設定

![](https://storage.googleapis.com/zenn-user-upload/fd14c0f8b219-20251229.png)

### 変換前後のプレビュー

![](https://storage.googleapis.com/zenn-user-upload/18b18ce37333-20251229.png)

![](https://storage.googleapis.com/zenn-user-upload/403f26db9b00-20251229.png)

### 主な機能

| 機能                   | 説明                                                      |
| ---------------------- | --------------------------------------------------------- |
| カラムマッピング       | 変換前カラムと変換後カラムを紐付け                        |
| 複数のコンバーター     | 分割、置換、接頭辞、接尾辞、トリム、大文字/小文字変換など |
| パイプライン処理       | 1 つのマッピングに複数のコンバーターを連結                |
| リアルタイムプレビュー | 変換結果を即座に確認                                      |
| プロファイル管理       | 設定の保存・読み込み・エクスポート・インポート            |
| ドラッグ&ドロップ      | マッピングの並び替え                                      |
| 自動マッピング         | 同名カラムを一括でマッピング                              |

### 特徴

- **完全にブラウザ内で動作** - サーバーへのデータ送信なし
- **データはローカルストレージに保存** - ブラウザを閉じても設定が残る
- **プロファイルのエクスポート/インポート** - 設定を JSON ファイルで共有可能

## 技術スタック

| 項目              | 技術                  |
| ----------------- | --------------------- |
| フレームワーク    | React 19 + TypeScript |
| UI ライブラリ     | Material UI (MUI)     |
| ビルドツール      | Vite                  |
| CSV パース        | PapaParse             |
| ドラッグ&ドロップ | @dnd-kit              |
| 状態管理          | React Context API     |
| データ永続化      | LocalStorage          |
| テスト            | Vitest + Playwright   |

## 実装のポイント

### 1. コンバーターのパイプライン処理

1 つのマッピングに複数のコンバーターを連結できるようにしました。例えば「分割 → トリム → 大文字変換」のように、変換処理を順番に適用できます。

```typescript
// 変換処理の適用
export function applyConverters(
  value: string,
  converters: ConverterConfig[]
): string {
  return converters.reduce((acc, config) => {
    return applyConverter(acc, config);
  }, value);
}
```

各コンバーターは独立した関数として実装し、`reduce`で順番に適用しています。

### 2. コンバーターの種類

現在実装しているコンバーターは以下の通りです：

| コンバーター  | 説明                           | 設定項目                     |
| ------------- | ------------------------------ | ---------------------------- |
| そのまま      | 値をそのままコピー             | なし                         |
| 分割          | 文字列を分割して特定部分を取得 | 区切り文字、取得インデックス |
| 置換          | 文字列を置換                   | 検索文字列、置換文字列       |
| 接頭辞付与    | 先頭に文字列を追加             | 接頭辞文字列                 |
| 接尾辞付与    | 末尾に文字列を追加             | 接尾辞文字列                 |
| トリム        | 前後の空白を除去               | トリム位置（両端/先頭/末尾） |
| 大文字/小文字 | ケース変換                     | 変換タイプ                   |
| 部分文字列    | 文字列の一部を抽出             | 開始位置、終了位置           |
| パディング    | 文字列を埋める                 | パディング文字、長さ、位置   |

### 3. プロファイル管理

設定をプロファイルとして保存・読み込みできるようにしました。さらに、JSON ファイルとしてエクスポート/インポートすることで、チームメンバーと設定を共有できます。

```typescript
// エクスポート
const handleExportProfile = (profile: Profile) => {
  const exportData = {
    name: profile.name,
    sourceColumns: profile.sourceColumns,
    targetColumns: profile.targetColumns,
    mappings: profile.mappings,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  // ダウンロード処理...
};
```

### 4. ドラッグ&ドロップでの並び替え

`@dnd-kit`を使って、マッピングの並び替えをドラッグ&ドロップで行えるようにしました。

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={mappings.map((m) => m.id)}
    strategy={verticalListSortingStrategy}
  >
    {mappings.map((mapping, index) => (
      <SortableMappingRow key={mapping.id} mapping={mapping} index={index} />
    ))}
  </SortableContext>
</DndContext>
```

### 5. ローカルストレージでの永続化

カスタムフックを作成して、状態をローカルストレージに自動保存するようにしました。

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        const valueToStore =
          value instanceof Function ? value(prevValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
```

## 使い方

### 1. カラム定義のインポート

「変換前カラム」セクションで「インポート」ボタンをクリックし、CSV ファイルを選択します。ヘッダー行からカラム定義が読み込まれます。

### 2. 変換後カラムの設定

「変換後カラム」セクションで出力したいカラムを定義します。「全てコピー」ボタンで変換前カラムをそのままコピーすることもできます。

### 3. マッピングの設定

「マッピング設定」セクションで、変換前カラムと変換後カラムの紐付けを行います。各マッピングにはコンバーターを設定できます。

### 4. CSV データのインポート

「CSV データ」セクションで実際のデータをインポートします。

### 5. プレビューと出力

変換結果がリアルタイムでプレビューされます。問題なければ「CSV エクスポート」ボタンでダウンロードできます。

## 使用例

### 例 1: 氏名の分割

**入力 CSV:**

```csv
氏名
田中 太郎
鈴木 花子
```

**マッピング設定:**

- 氏名 → 姓（分割: スペース, インデックス: 0）
- 氏名 → 名（分割: スペース, インデックス: 1）

**出力 CSV:**

```csv
姓,名
田中,太郎
鈴木,花子
```

### 例 2: 接頭辞付与

**入力 CSV:**

```csv
商品コード
001
002
```

**マッピング設定:**

- 商品コード → ID（接頭辞: `ITEM-`）

**出力 CSV:**

```csv
ID
ITEM-001
ITEM-002
```

### 例 3: パイプライン処理

**入力 CSV:**

```csv
email
  JOHN.DOE@EXAMPLE.COM
  jane.smith@example.com
```

**マッピング設定:**

- email → normalized_email
  1. トリム（両端の空白除去）
  2. 小文字変換

**出力 CSV:**

```csv
normalized_email
john.doe@example.com
jane.smith@example.com
```

## テスト

### ユニットテスト（Vitest）

コンバーターのロジックはユニットテストでカバーしています。

```bash
npm run test:run
```

### E2E テスト（Playwright）

プロファイルのインポート/エクスポートなど、UI を通した操作は Playwright でテストしています。

```bash
npm run test:e2e
```

## 今後の展望

- [ ] 正規表現によるマッチング・置換
- [ ] 条件分岐（IF 文的な処理）
- [ ] 複数カラムの結合
- [ ] カスタム JavaScript 関数の実行
- [ ] バッチ処理（複数ファイルの一括変換）

## おわりに

ブラウザで完結する CSV マッピングツールを作ってみました。
今後はコンバーターの処理の追加や、
e2e のテストを入れているので CSV を元に結合したテストケースなどを追加していきたいですね。
