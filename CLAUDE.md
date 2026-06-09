# CSV マッピングツール

## プロジェクト構成

npm workspacesベースのモノレポ。

```
packages/
├── core/        # 共通ロジック + 共通UIコンポーネント
├── web/         # Web版エントリ（GitHub Pages デプロイ）
└── chrome-ext/  # Chrome拡張機能版
```

## パッケージ詳細

### packages/core
- `src/types/` — 全TypeScript型定義（Column, Mapping, ConverterConfig, Profile等）
- `src/converters/` — 11種のデータ変換関数（split, replace, prefix, suffix, trim, case, substring, padding, conditional, dateFormat）+ テスト
- `src/utils/` — CSV解析(papaparse + encoding-japanese)、変換パイプライン + テスト
- `src/contexts/MappingContext.tsx` — React Context によるグローバル状態管理
- `src/hooks/useLocalStorage.ts` — LocalStorage永続化フック
- `src/components/` — 全UIコンポーネント（MUI v7 + dnd-kit）

### packages/web
- `src/App.tsx` — ツアー機能（shepherd.js）付きエントリ
- `src/hooks/useTour.ts` — ガイドツアーロジック（Web版専用）
- Vite base: `/csv-mapping-tool/`（GitHub Pages用）

### packages/chrome-ext
- `src/App.tsx` — ツアーなしのエントリ
- `public/manifest.json` — Manifest V3
- `public/background.js` — アイコンクリックで新タブを開く

## コマンド

```bash
npm run dev:web      # Web版 開発サーバー
npm run dev:ext      # Chrome拡張 開発サーバー
npm run build:web    # Web版 ビルド → packages/web/dist/
npm run build:ext    # Chrome拡張 ビルド → packages/chrome-ext/dist/
npm run test:run     # ユニットテスト（vitest）
npm run test:e2e     # E2Eテスト（Playwright）
```

## import規約

- **core内のファイル同士**: 相対パス（`../types`, `../../contexts/MappingContext`）
- **web/chrome-ext → core**: `@core/...` エイリアス（`@core/contexts/MappingContext`）
- Viteの `resolve.alias` と tsconfig の `paths` で解決

## 技術スタック

React 19, TypeScript, Vite, MUI v7, dnd-kit, papaparse, encoding-japanese
