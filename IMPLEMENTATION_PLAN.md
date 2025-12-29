# CSV マッピングツール 実装計画

## 概要
CSVファイルのカラムを変換・マッピングするWebアプリケーション。フロントエンドのみで完結し、設定はローカルストレージに保存。

## 技術スタック
| 項目 | 技術 |
|------|------|
| フレームワーク | React 18 + TypeScript |
| UIライブラリ | Material UI (MUI) v5 |
| ビルドツール | Vite |
| CSVパース | PapaParse |
| 状態管理 | React Context API |
| データ永続化 | LocalStorage |

---

## 機能一覧

### 1. カラム設定
- 変換前カラムの定義（CSVからインポート可能）
- 変換後カラムの定義（手動追加/編集/削除）

### 2. マッピング設定
- 変換前カラム → 変換後カラムの紐付け
- 各マッピングにコンバーターを適用

### 3. コンバーター
| コンバーター | 説明 | 設定項目 |
|------------|------|---------|
| そのまま | 値をそのままコピー | なし |
| 分割 | 文字列を分割して特定部分を取得 | 区切り文字、取得インデックス |
| 置換 | 文字列を置換 | 検索文字列、置換文字列 |
| 接頭辞付与 | 先頭に文字列を追加 | 接頭辞タイプ（固定/ランダム/日付） |

### 4. プレビュー
- 変換前CSVデータのテーブル表示
- 変換後CSVデータのテーブル表示（リアルタイム）

### 5. エクスポート
- 変換後CSVのダウンロード

---

## ディレクトリ構成

```
csv-mapping-tool/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Header.tsx
│   │   ├── ColumnConfig/
│   │   │   ├── SourceColumns.tsx      # 変換前カラム設定
│   │   │   └── TargetColumns.tsx      # 変換後カラム設定
│   │   ├── Mapping/
│   │   │   ├── MappingEditor.tsx      # マッピング設定UI
│   │   │   └── MappingRow.tsx         # 個別マッピング行
│   │   ├── Converters/
│   │   │   ├── ConverterSelect.tsx    # コンバーター選択
│   │   │   ├── SplitConfig.tsx        # 分割設定
│   │   │   ├── ReplaceConfig.tsx      # 置換設定
│   │   │   └── PrefixConfig.tsx       # 接頭辞設定
│   │   ├── Preview/
│   │   │   ├── DataPreview.tsx        # プレビューコンテナ
│   │   │   └── DataTable.tsx          # データテーブル
│   │   └── FileIO/
│   │       ├── CsvImporter.tsx        # CSVインポート
│   │       └── CsvExporter.tsx        # CSVエクスポート
│   ├── contexts/
│   │   └── MappingContext.tsx         # グローバル状態管理
│   ├── hooks/
│   │   ├── useLocalStorage.ts         # ローカルストレージ
│   │   └── useCsvParser.ts            # CSVパース
│   ├── converters/
│   │   ├── index.ts                   # コンバーター統合
│   │   ├── split.ts                   # 分割処理
│   │   ├── replace.ts                 # 置換処理
│   │   └── prefix.ts                  # 接頭辞付与
│   ├── types/
│   │   └── index.ts                   # 型定義
│   ├── utils/
│   │   ├── csv.ts                     # CSV操作ユーティリティ
│   │   └── transform.ts               # 変換処理
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## 型定義

```typescript
// カラム定義
interface Column {
  id: string;
  name: string;
}

// コンバーター種別
type ConverterType = 'direct' | 'split' | 'replace' | 'prefix';

// コンバーター設定
interface ConverterConfig {
  type: ConverterType;
  // 分割用
  delimiter?: string;
  index?: number;
  // 置換用
  searchValue?: string;
  replaceValue?: string;
  // 接頭辞用
  prefixType?: 'fixed' | 'random' | 'date';
  fixedPrefix?: string;
  randomLength?: number;
  dateFormat?: string;
}

// マッピング定義
interface Mapping {
  id: string;
  sourceColumnId: string;
  targetColumnId: string;
  converter: ConverterConfig;
}

// アプリケーション状態
interface MappingState {
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
  sourceData: Record<string, string>[];
}
```

---

## 画面構成

```
┌─────────────────────────────────────────────────────────┐
│  CSV マッピングツール                    [設定保存] [リセット] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │ 変換前カラム     │    │ 変換後カラム     │            │
│  │ [CSVインポート]  │    │ [+ カラム追加]   │            │
│  │ ・氏名          │    │ ・姓            │            │
│  │ ・住所          │    │ ・名            │            │
│  │ ・電話番号      │    │ ・郵便番号       │            │
│  └─────────────────┘    └─────────────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ マッピング設定                                    │   │
│  │ ┌────────┐    ┌────────┐    ┌────────────────┐ │   │
│  │ │ 氏名   │ → │ 姓     │    │ 分割(スペース,0)│ │   │
│  │ │ 氏名   │ → │ 名     │    │ 分割(スペース,1)│ │   │
│  │ │ 住所   │ → │ 郵便番号│    │ 置換(...)     │ │   │
│  │ └────────┘    └────────┘    └────────────────┘ │   │
│  │                                    [+ 追加]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ プレビュー                                       │   │
│  │ [変換前] [変換後]                                │   │
│  │ ┌─────────────────────────────────────────────┐ │   │
│  │ │ 姓      │ 名      │ 郵便番号  │ ...        │ │   │
│  │ │ 田中    │ 太郎    │ 100-0001  │ ...        │ │   │
│  │ └─────────────────────────────────────────────┘ │   │
│  │                               [CSVダウンロード] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 実装ステップ

### Step 1: プロジェクトセットアップ
- Vite + React + TypeScript プロジェクト作成
- Material UI インストール・設定
- PapaParse インストール
- 基本ディレクトリ構造作成

### Step 2: 型定義・Context作成
- `types/index.ts` に型定義
- `MappingContext.tsx` で状態管理
- `useLocalStorage.ts` でローカルストレージ永続化

### Step 3: カラム設定コンポーネント
- `SourceColumns.tsx`（CSVインポート機能付き）
- `TargetColumns.tsx`（手動編集機能付き）

### Step 4: コンバーター実装
- 各コンバーターのロジック実装
- コンバーター設定UIコンポーネント

### Step 5: マッピング設定UI
- `MappingEditor.tsx`
- ドラッグ&ドロップまたはセレクト形式

### Step 6: 変換処理・プレビュー
- `transform.ts` で変換ロジック
- `DataPreview.tsx` でリアルタイムプレビュー

### Step 7: CSVエクスポート
- 変換結果のCSVダウンロード機能

### Step 8: 仕上げ
- エラーハンドリング
- UI調整・レスポンシブ対応

---

## ローカルストレージ保存項目

| キー | 内容 |
|------|------|
| `csv-mapper-source-columns` | 変換前カラム定義 |
| `csv-mapper-target-columns` | 変換後カラム定義 |
| `csv-mapper-mappings` | マッピング設定 |

---

## 使用例

### 例1: 氏名の分割
**入力CSV:**
```
氏名
田中 太郎
鈴木 花子
```

**マッピング設定:**
- 氏名 → 姓（分割: スペース, インデックス: 0）
- 氏名 → 名（分割: スペース, インデックス: 1）

**出力CSV:**
```
姓,名
田中,太郎
鈴木,花子
```

### 例2: 接頭辞付与
**入力CSV:**
```
商品コード
001
002
```

**マッピング設定:**
- 商品コード → ID（接頭辞: 日付形式 `YYYYMMDD-`）

**出力CSV:**
```
ID
20241223-001
20241223-002
```
