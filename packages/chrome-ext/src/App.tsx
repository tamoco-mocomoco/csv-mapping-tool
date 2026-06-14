import { Box, Grid } from '@mui/material';
import { MappingProvider } from '@core/contexts/MappingContext';
import { Header } from '@core/components/Layout/Header';
import { WizardLayout, type WizardStep } from '@core/components/Layout/WizardLayout';
import { ProfilePanel } from '@core/components/Layout/ProfilePanel';
import { SourceColumns } from '@core/components/ColumnConfig/SourceColumns';
import { TargetColumns } from '@core/components/ColumnConfig/TargetColumns';
import { DataImportSection } from '@core/components/FileIO/DataImportSection';
import { MappingEditor } from '@core/components/Mapping/MappingEditor';
import { DataPreview } from '@core/components/Preview/DataPreview';

const STEPS: WizardStep[] = [
  {
    label: 'プロファイル',
    description: '設定を保存・読み込みできます。新しく始める場合はそのまま「次へ」へ進んでください。',
    content: <ProfilePanel />,
  },
  {
    label: 'カラム定義',
    description: '変換前カラム（CSVから読み込む列）と変換後カラム（出力する列）を設定します。',
    content: (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SourceColumns />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TargetColumns />
        </Grid>
      </Grid>
    ),
  },
  {
    label: 'CSV取込 & マッピング',
    description: 'CSVを読み込み、変換ルール（マッピング）を設定します。',
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <DataImportSection />
        <MappingEditor />
      </Box>
    ),
  },
  {
    label: 'プレビュー & 出力',
    description: '変換結果を確認し、CSVファイルとしてダウンロードします。',
    content: <DataPreview />,
  },
];

function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header />
      <WizardLayout steps={STEPS} />
    </Box>
  );
}

function App() {
  return (
    <MappingProvider>
      <AppContent />
    </MappingProvider>
  );
}

export default App;
