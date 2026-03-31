import { useEffect, useCallback } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import type { Column, Mapping, ConverterConfig } from '../types';

const TOUR_COMPLETED_KEY = 'csv-mapper-tour-completed';

// マッピングはカラムIDが動的なので関数で生成
function createSampleMappings(sourceColumns: Column[], targetColumns: Column[]): Mapping[] {
  const srcName = sourceColumns.find(c => c.name === '氏名');
  const srcEmail = sourceColumns.find(c => c.name === 'メールアドレス');
  const srcPhone = sourceColumns.find(c => c.name === '電話番号');

  const tgtLastName = targetColumns.find(c => c.name === '姓');
  const tgtFirstName = targetColumns.find(c => c.name === '名');
  const tgtEmail = targetColumns.find(c => c.name === 'メール（小文字）');
  const tgtPhone = targetColumns.find(c => c.name === '電話番号（ハイフンなし）');

  const mappings: Mapping[] = [];
  const now = Date.now();

  if (srcName && tgtLastName) {
    mappings.push({
      id: `mapping_${now}_1`,
      sourceColumnIds: [srcName.id],
      targetColumnId: tgtLastName.id,
      converters: [{ type: 'split', delimiter: ' ', index: 0 } as ConverterConfig],
    });
  }

  if (srcName && tgtFirstName) {
    mappings.push({
      id: `mapping_${now}_2`,
      sourceColumnIds: [srcName.id],
      targetColumnId: tgtFirstName.id,
      converters: [{ type: 'split', delimiter: ' ', index: 1 } as ConverterConfig],
    });
  }

  if (srcEmail && tgtEmail) {
    mappings.push({
      id: `mapping_${now}_3`,
      sourceColumnIds: [srcEmail.id],
      targetColumnId: tgtEmail.id,
      converters: [{ type: 'case', caseType: 'lower' } as ConverterConfig],
    });
  }

  if (srcPhone && tgtPhone) {
    mappings.push({
      id: `mapping_${now}_4`,
      sourceColumnIds: [srcPhone.id],
      targetColumnId: tgtPhone.id,
      converters: [{ type: 'replace', searchValue: '-', replaceValue: '' } as ConverterConfig],
    });
  }

  return mappings;
}

// サンプルデータ定義
const SAMPLE_SOURCE_COLUMNS: Column[] = [
  { id: 'tour_src_1', name: '氏名' },
  { id: 'tour_src_2', name: 'メールアドレス' },
  { id: 'tour_src_3', name: '電話番号' },
];

const SAMPLE_TARGET_COLUMNS: Column[] = [
  { id: 'tour_tgt_1', name: '姓' },
  { id: 'tour_tgt_2', name: '名' },
  { id: 'tour_tgt_3', name: 'メール（小文字）' },
  { id: 'tour_tgt_4', name: '電話番号（ハイフンなし）' },
];

const SAMPLE_SOURCE_DATA: Record<string, string>[] = [
  { tour_src_1: '田中 太郎', tour_src_2: 'TANAKA@EXAMPLE.COM', tour_src_3: '090-1234-5678' },
  { tour_src_1: '鈴木 花子', tour_src_2: 'SUZUKI@EXAMPLE.COM', tour_src_3: '080-9876-5432' },
  { tour_src_1: '佐藤 次郎', tour_src_2: 'SATO@EXAMPLE.COM', tour_src_3: '070-1111-2222' },
];

interface TourActions {
  setSourceColumns: (columns: Column[]) => void;
  setTargetColumns: (columns: Column[]) => void;
  setMappings: (mappings: Mapping[]) => void;
  setSourceData: (data: Record<string, string>[]) => void;
  resetAll: () => void;
  getSourceColumns: () => Column[];
  getTargetColumns: () => Column[];
  getSourceData: () => Record<string, string>[];
  getMappings: () => Mapping[];
}

export function useTour(actions?: TourActions) {
  const startTour = useCallback(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      keyboardNavigation: false,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    tour.addStep({
      id: 'welcome',
      text: `
        <h3>CSV マッピングツールへようこそ！</h3>
        <p>このツアーでは、サンプルデータを使って実際の操作を体験できます。</p>
        <p><strong>例：</strong>「氏名」を「姓」と「名」に分割する変換を行います。</p>
      `,
      buttons: [
        {
          text: 'スキップ',
          action: tour.cancel,
          secondary: true,
        },
        {
          text: '始める',
          action: () => {
            // サンプルデータを自動投入
            if (actions) {
              actions.resetAll();
              actions.setSourceColumns(SAMPLE_SOURCE_COLUMNS);
              actions.setTargetColumns(SAMPLE_TARGET_COLUMNS);
              actions.setSourceData(SAMPLE_SOURCE_DATA);
            }
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: 'source-columns',
      attachTo: { element: '[data-tour="source-columns"]', on: 'bottom' },
      text: `
        <h3>1. 変換前カラムを設定</h3>
        <p>サンプルデータが自動で読み込まれました。</p>
        <p>通常はCSVファイルをインポートすると、ここにカラム一覧が表示されます。</p>
        <p style="margin-top:8px; font-size:13px;">今回のサンプル: <strong>氏名</strong>、<strong>メールアドレス</strong>、<strong>電話番号</strong></p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        { text: '次へ', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'target-columns',
      attachTo: { element: '[data-tour="target-columns"]', on: 'bottom' },
      text: `
        <h3>2. 変換後カラムを設定</h3>
        <p>出力先となるカラムも自動で設定されました。</p>
        <p>通常は「カラムを追加」ボタンから手動で追加します。</p>
        <p style="margin-top:8px; font-size:13px;">今回のサンプル: <strong>姓</strong>、<strong>名</strong>、<strong>メール（小文字）</strong>、<strong>電話番号（ハイフンなし）</strong></p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        { text: '次へ', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'data-import',
      attachTo: { element: '[data-tour="data-import"]', on: 'bottom' },
      text: `
        <h3>3. CSVデータをインポート</h3>
        <p>変換するCSVデータも自動で読み込まれています。</p>
        <p>通常は「インポート」ボタンからCSVファイルを選択して読み込みます。エンコーディング（UTF-8 / SJIS）も切り替えられます。</p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        { text: '次へ', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'mapping-editor',
      attachTo: { element: '[data-tour="mapping-editor"]', on: 'bottom' },
      text: `
        <h3>4. マッピングを設定</h3>
        <p>変換ルールを定義します。「次へ」を押すと、以下のマッピングが自動で追加されます：</p>
        <table style="width:100%; font-size:12px; border-collapse:collapse; margin-top:8px;">
          <tr style="background:#f5f5f5;">
            <th style="padding:6px; border:1px solid #ddd; text-align:left;">変換</th>
            <th style="padding:6px; border:1px solid #ddd; text-align:left;">コンバーター</th>
            <th style="padding:6px; border:1px solid #ddd; text-align:left;">設定</th>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ddd;">氏名→姓</td>
            <td style="padding:6px; border:1px solid #ddd;">分割</td>
            <td style="padding:6px; border:1px solid #ddd;">区切り文字: (スペース)、インデックス: 0</td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ddd;">氏名→名</td>
            <td style="padding:6px; border:1px solid #ddd;">分割</td>
            <td style="padding:6px; border:1px solid #ddd;">区切り文字: (スペース)、インデックス: 1</td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ddd;">メール→メール（小文字）</td>
            <td style="padding:6px; border:1px solid #ddd;">大文字/小文字</td>
            <td style="padding:6px; border:1px solid #ddd;">変換タイプ: 小文字</td>
          </tr>
          <tr>
            <td style="padding:6px; border:1px solid #ddd;">電話→電話（ハイフンなし）</td>
            <td style="padding:6px; border:1px solid #ddd;">置換</td>
            <td style="padding:6px; border:1px solid #ddd;">検索文字列: -、置換後: (空)</td>
          </tr>
        </table>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        {
          text: '次へ',
          action: () => {
            if (actions) {
              const sourceColumns = actions.getSourceColumns();
              const targetColumns = actions.getTargetColumns();
              const mappings = createSampleMappings(sourceColumns, targetColumns);
              actions.setMappings(mappings);
            }
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: 'preview',
      attachTo: { element: '[data-tour="preview"]', on: 'top' },
      text: `
        <h3>5. 結果を確認</h3>
        <p>変換結果がリアルタイムでプレビューされます。</p>
        <p>「変換後」タブをクリックすると、以下のように変換されていることが確認できます：</p>
        <ul style="font-size:13px;">
          <li>「田中 太郎」→ 姓：田中、名：太郎</li>
          <li>「TANAKA@...」→ 「tanaka@...」</li>
          <li>「090-1234-5678」→ 「09012345678」</li>
        </ul>
        <p>問題なければ「CSVエクスポート」でダウンロードできます。</p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        { text: '次へ', action: tour.next },
      ],
    });

    tour.addStep({
      id: 'profile',
      attachTo: { element: '[data-tour="profile"]', on: 'bottom' },
      text: `
        <h3>6. 設定を保存</h3>
        <p>今回の設定をプロファイルとして保存できます。</p>
        <p>次回同じ変換を行う際に、すぐに読み込めます。</p>
        <p>JSONファイルでエクスポートして、チームで共有することも可能です。</p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        { text: '完了', action: tour.complete },
      ],
    });

    tour.on('complete', () => {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    });

    tour.on('cancel', () => {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    });

    tour.start();
  }, [actions]);

  const shouldShowTour = useCallback(() => {
    return localStorage.getItem(TOUR_COMPLETED_KEY) !== 'true';
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  }, []);

  useEffect(() => {
    // カスタムスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
      .shepherd-theme-custom {
        max-width: 400px;
      }
      .shepherd-theme-custom .shepherd-content {
        border-radius: 8px;
        padding: 0;
      }
      .shepherd-theme-custom .shepherd-text {
        padding: 16px;
        font-size: 14px;
        line-height: 1.6;
      }
      .shepherd-theme-custom .shepherd-text h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        color: #1976d2;
      }
      .shepherd-theme-custom .shepherd-text p {
        margin: 8px 0;
      }
      .shepherd-theme-custom .shepherd-footer {
        padding: 12px 16px;
        border-top: 1px solid #eee;
      }
      .shepherd-theme-custom .shepherd-button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .shepherd-theme-custom .shepherd-button:hover {
        background: #1565c0;
      }
      .shepherd-theme-custom .shepherd-button.shepherd-button-secondary {
        background: transparent;
        color: #666;
      }
      .shepherd-theme-custom .shepherd-button.shepherd-button-secondary:hover {
        background: #f5f5f5;
      }
      .shepherd-modal-overlay-container {
        z-index: 1200;
      }
      .shepherd-element {
        z-index: 1250;
      }
      /* MUIのモーダルをshepherdより上に表示 */
      .MuiModal-root {
        z-index: 1300 !important;
      }
      .MuiDialog-root {
        z-index: 1300 !important;
      }
      .MuiPopover-root {
        z-index: 1300 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return { startTour, shouldShowTour, resetTour };
}
