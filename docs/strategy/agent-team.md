# CSV-Mapping Tool 成長戦略 — Claude Agent Team

## 概要

CSV-Mapping Toolの利用者拡大を目的として、専門性を持ったClaude Agentチームを構成し、ドキュメント整備・戦略立案・コンテンツ制作を推進する。

---

## Agent Team 構成

### 1. Product Analyst（プロダクト分析エージェント）

**役割**: 現状のプロダクトを分析し、強み・弱み・差別化ポイントを明確にする

**プロンプト例**:
```
あなたはSaaSプロダクトアナリストです。
以下のCSV変換ツールのコードベースを分析し、
競合（CSVの変換ツール、ETLツール）との差別化ポイント、
ターゲットユーザーのペルソナ、改善すべきUX課題を報告してください。
```

**アウトプット**:
- 競合分析レポート（`docs/strategy/competitive-analysis.md`）
- ユーザーペルソナ定義（`docs/strategy/personas.md`）
- UX改善提案（`docs/strategy/ux-improvements.md`）

---

### 2. Technical Writer（テクニカルライターエージェント）

**役割**: ユーザー向けドキュメント・チュートリアルの作成

**プロンプト例**:
```
あなたはテクニカルライターです。
このCSV-Mapping Toolのコードベースを読み、
以下のドキュメントを作成してください:
1. README.md（プロジェクト概要、スクリーンショット説明、クイックスタート）
2. ユーザーガイド（全コンバーターの使い方と具体例）
3. ユースケース集（ECデータ変換、システム移行、帳票変換など）
対象読者は非エンジニアの業務担当者です。
```

**アウトプット**:
- `README.md`（プロジェクトルート、書き直し）
- `docs/user-guide.md`（全機能ガイド）
- `docs/use-cases.md`（具体的なユースケース集）
- `docs/converters.md`（各コンバーターの詳細リファレンス）

---

### 3. Marketing Strategist（マーケティング戦略エージェント）

**役割**: ターゲット層へのリーチ戦略、コンテンツ企画

**プロンプト例**:
```
あなたはBtoB SaaSのマーケティング戦略家です。
CSV-Mapping Toolの以下の特徴を踏まえて、
利用者拡大のためのマーケティング戦略を立案してください:
- ブラウザ完結（インストール不要、GitHub Pages公開済み）
- 無料・OSS
- 11種類のコンバーター、プロファイル保存、SJIS対応
- ターゲット: データ移行担当者、EC運用者、業務システム管理者
```

**アウトプット**:
- チャネル戦略（`docs/strategy/channels.md`）
- コンテンツカレンダー（`docs/strategy/content-calendar.md`）
- SEO対策キーワードリスト（`docs/strategy/seo-keywords.md`）

---

### 4. Content Creator（コンテンツ制作エージェント）

**役割**: ブログ記事・SNS投稿・ランディングページの原稿作成

**プロンプト例**:
```
あなたはテック系コンテンツライターです。
CSV-Mapping Toolの利用シーンを具体的に描いた記事を書いてください。
例: 「ECサイトの商品CSVを別モールのフォーマットに変換する」
読者が「自分の課題を解決できる」と感じられる構成にしてください。
```

**アウトプット**:
- ブログ記事原稿（`docs/content/blog/`配下）
- SNS投稿テンプレート（`docs/content/social/`配下）
- ランディングページ原稿（`docs/content/lp.md`）

---

### 5. SEO & Analytics Agent（SEO・分析エージェント）

**役割**: 検索流入の最大化、メタデータ最適化

**プロンプト例**:
```
あなたはSEOスペシャリストです。
CSV-Mapping Toolのランディングページ（GitHub Pages）に対して、
以下を最適化してください:
1. index.htmlのmeta tags（title, description, OGP）
2. 想定検索クエリと対応するコンテンツ構成
3. 構造化データの提案
ターゲットキーワード: CSV変換、CSVマッピング、データ変換ツール、フォーマット変換
```

**アウトプット**:
- meta tags改善PR
- SEOキーワード戦略（`docs/strategy/seo-keywords.md`）

---

## 実行フロー

```
Phase 1: 基盤整備（Week 1-2）
├─ Product Analyst → 競合分析・ペルソナ定義
├─ Technical Writer → README刷新・ユーザーガイド作成
└─ SEO Agent → meta tags最適化・OGP設定

Phase 2: コンテンツ制作（Week 3-4）
├─ Marketing Strategist → チャネル戦略・コンテンツカレンダー策定
├─ Content Creator → ブログ記事3本・SNS投稿テンプレート作成
└─ Technical Writer → ユースケース集完成

Phase 3: 配信・改善（Week 5〜）
├─ Content Creator → 記事公開・SNS発信
├─ Product Analyst → フィードバック分析・改善提案
└─ 繰り返し
```

---

## Claude Codeでの実行方法

各エージェントはClaude CodeのAgent機能で並列実行できる。

```bash
# 例: Technical WriterとProduct Analystを並列で起動
# Claude Code内で以下のように依頼:

「以下の2つのタスクを並列のAgentで実行してください:
 1. Technical Writer: README.mdをプロジェクト概要・機能一覧・クイックスタートで書き直す
 2. Product Analyst: 競合ツール（CSVto、Tabula、OpenRefine等）との差別化ポイントを分析」
```

### worktree活用

ドキュメントやコード変更はworktreeで隔離して作業し、PRベースでレビューする。

```
Agent(isolation: "worktree") → ブランチ作成 → PR作成 → レビュー → マージ
```

---

## 優先アクション（すぐ始められること）

1. **README.md を書き直す** — 現在はViteテンプレートのまま。プロダクトの顔になる
2. **index.html の meta tags を最適化** — OGP画像・description追加で共有時の見栄え改善
3. **ユースケース3つを記事化** — EC商品CSV変換、システム移行、帳票フォーマット変換
4. **Qiita / Zenn に技術記事投稿** — 日本語圏の開発者・業務担当者にリーチ

---

## ファイル構成（計画）

```
docs/
├── strategy/
│   ├── agent-team.md          ← 本ファイル
│   ├── competitive-analysis.md
│   ├── personas.md
│   ├── channels.md
│   ├── content-calendar.md
│   ├── seo-keywords.md
│   └── ux-improvements.md
├── user-guide.md
├── use-cases.md
├── converters.md
└── content/
    ├── blog/
    ├── social/
    └── lp.md
```
