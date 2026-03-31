# CSV Mapping Tool

![Deploy](https://github.com/tamoco-mocomoco/csv-mapping-tool/actions/workflows/deploy.yml/badge.svg) ![Test](https://github.com/tamoco-mocomoco/csv-mapping-tool/actions/workflows/test.yml/badge.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A browser-based CSV column mapping & data transformation tool. No installation required — all data is processed locally in your browser and never sent to any server.

## Features

- **Runs entirely in the browser** — No server, no upload, your data stays local
- **UTF-8 / Shift_JIS support** — Handles Japanese CSV files natively
- **11 built-in converters** — Split, replace, date format, conditional assignment, and more
- **Pipeline processing** — Chain multiple converters in sequence for complex transformations
- **Auto-mapping** — Automatically matches source and target columns by name
- **Data filtering** — Filter rows using regular expressions
- **Profile saving** — Save mapping configurations in the browser and reuse them anytime
- **Drag & drop** — Reorder columns and converters intuitively
- **Guided tour** — Built-in walkthrough for first-time users

## Demo

Try it instantly (GitHub Pages):

**https://tamoco-mocomoco.github.io/csv-mapping-tool/**

## Quick Start (for developers)

```bash
git clone https://github.com/tamoco-mocomoco/csv-mapping-tool.git
cd csv-mapping-tool
npm install
npm run dev
```

Open `http://localhost:5173/csv-mapping-tool/` in your browser.

## How to Use

1. **Import CSV** — Select a CSV file and choose the encoding (UTF-8 / Shift_JIS)
2. **Define target columns** — Add or edit the output columns
3. **Set up mappings** — Map source columns to target columns and add converters as needed. Use auto-mapping for columns with matching names
4. **Filter data** (optional) — Use regex to include only specific rows
5. **Preview results** — Check the transformed data on screen
6. **Export CSV** — Download the converted data as a CSV file

Save your configuration as a profile to reuse the same mapping next time.

## Converters

| Converter | Description | Example |
|---|---|---|
| Direct | Copy the value as-is | — |
| Split | Split by delimiter and pick an element | Delimiter: `-`, Index: `0` |
| Replace | Find and replace a string | `株式会社` → `(株)` |
| Prefix | Prepend a fixed string, random string, or date | Fixed: `ID-` |
| Suffix | Append a fixed string | Suffix: `@example.com` |
| Trim | Remove leading/trailing whitespace | Target: both / start / end |
| Case | Convert to upper / lower / capitalize | `upper` / `lower` / `capitalize` |
| Substring | Extract a portion of the string | Start: `0`, End: `3` |
| Padding | Pad to a specified length | Char: `0`, Length: `5`, Direction: start |
| Conditional | Assign a value based on regex match in another column | Pattern: `^Tokyo` → Value: `Kanto` |
| Date Format | Convert date formats with optional month offset | Input: `YYYYMMDD` → Output: `YYYY/MM/DD` |

Converters can be chained in a pipeline. For example: Split → Trim → Upper Case.

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| UI Library | Material UI (MUI) |
| CSV Parsing | PapaParse |
| Japanese Encoding | encoding-japanese |
| Drag & Drop | dnd-kit |
| Guided Tour | Shepherd.js |
| Testing | Vitest / Playwright |

## License

MIT

---

## 日本語ドキュメント

日本語の詳細ドキュメントは以下を参照してください。

- [ユーザーガイド](docs/user-guide.md) — 全機能の使い方・コンバーター詳細・ユースケース集
