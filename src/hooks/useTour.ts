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
      sourceColumnId: srcName.id,
      targetColumnId: tgtLastName.id,
      converters: [{ type: 'split', delimiter: ' ', index: 0 } as ConverterConfig],
    });
  }

  if (srcName && tgtFirstName) {
    mappings.push({
      id: `mapping_${now}_2`,
      sourceColumnId: srcName.id,
      targetColumnId: tgtFirstName.id,
      converters: [{ type: 'split', delimiter: ' ', index: 1 } as ConverterConfig],
    });
  }

  if (srcEmail && tgtEmail) {
    mappings.push({
      id: `mapping_${now}_3`,
      sourceColumnId: srcEmail.id,
      targetColumnId: tgtEmail.id,
      converters: [{ type: 'case', caseType: 'lower' } as ConverterConfig],
    });
  }

  if (srcPhone && tgtPhone) {
    mappings.push({
      id: `mapping_${now}_4`,
      sourceColumnId: srcPhone.id,
      targetColumnId: tgtPhone.id,
      converters: [{ type: 'replace', searchValue: '-', replaceValue: '' } as ConverterConfig],
    });
  }

  return mappings;
}

// サンプルCSVをダウンロードする関数
function downloadSampleCsv() {
  const csvContent = `氏名,メールアドレス,電話番号
田中 太郎,TANAKA@EXAMPLE.COM,090-1234-5678
鈴木 花子,SUZUKI@EXAMPLE.COM,080-9876-5432
佐藤 次郎,SATO@EXAMPLE.COM,070-1111-2222`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
            // サンプルデータをリセット
            if (actions) {
              actions.resetAll();
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
        <p>サンプルCSVをダウンロードして、「インポート」ボタンからインポートしてください。</p>
        <p style="margin-top:12px;">
          <a href="#" id="download-sample-csv-source" style="color:#1976d2; text-decoration:underline; cursor:pointer;">
            📥 サンプルCSVをダウンロード
          </a>
        </p>
        <p style="margin-top:8px; font-size:12px; color:#666;">
          インポート後、「次へ」を押してください。
        </p>
      `,
      when: {
        show: () => {
          setTimeout(() => {
            const link = document.getElementById('download-sample-csv-source');
            if (link) {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                downloadSampleCsv();
              });
            }
          }, 100);
        },
      },
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        {
          text: '次へ',
          action: () => {
            if (actions) {
              const columns = actions.getSourceColumns();
              if (columns.length === 0) {
                alert('先にサンプルCSVをインポートしてください。');
                return;
              }
            }
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: 'target-columns',
      attachTo: { element: '[data-tour="target-columns"]', on: 'bottom' },
      text: `
        <h3>2. 変換後カラムを設定</h3>
        <p>「カラムを追加」ボタンから、以下の4つのカラムを追加してください：</p>
        <ul>
          <li>姓</li>
          <li>名</li>
          <li>メール（小文字）</li>
          <li>電話番号（ハイフンなし）</li>
        </ul>
        <p style="margin-top:8px; font-size:12px; color:#666;">
          追加後、「次へ」を押してください。
        </p>
      `,
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        {
          text: '次へ',
          action: () => {
            if (actions) {
              const columns = actions.getTargetColumns();
              if (columns.length === 0) {
                alert('先に変換後カラムを追加してください。');
                return;
              }
            }
            tour.next();
          },
        },
      ],
    });

    tour.addStep({
      id: 'data-import',
      attachTo: { element: '[data-tour="data-import"]', on: 'bottom' },
      text: `
        <h3>3. CSVデータをインポート</h3>
        <p>変換するデータを読み込みます。先ほどダウンロードしたサンプルCSVを「インポート」からインポートしてください。</p>
        <p style="margin-top:12px;">
          <a href="#" id="download-sample-csv" style="color:#1976d2; text-decoration:underline; cursor:pointer;">
            📥 サンプルCSVをダウンロード
          </a>
        </p>
        <p style="margin-top:8px; font-size:12px; color:#666;">
          インポート後、「次へ」を押してください。
        </p>
      `,
      when: {
        show: () => {
          setTimeout(() => {
            const link = document.getElementById('download-sample-csv');
            if (link) {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                downloadSampleCsv();
              });
            }
          }, 100);
        },
      },
      buttons: [
        { text: '戻る', action: tour.back, secondary: true },
        {
          text: '次へ',
          action: () => {
            if (actions) {
              const data = actions.getSourceData();
              if (data.length === 0) {
                alert('先にCSVデータをインポートしてください。');
                return;
              }
            }
            tour.next();
          },
        },
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
