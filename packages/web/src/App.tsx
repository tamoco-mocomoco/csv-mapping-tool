import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { MappingProvider, useMappingContext } from '@core/contexts/MappingContext';
import { Header } from '@core/components/Layout/Header';
import { WizardLayout, type WizardStep } from '@core/components/Layout/WizardLayout';
import { ProfilePanel } from '@core/components/Layout/ProfilePanel';
import { SourceColumns } from '@core/components/ColumnConfig/SourceColumns';
import { TargetColumns } from '@core/components/ColumnConfig/TargetColumns';
import { DataImportSection } from '@core/components/FileIO/DataImportSection';
import { MappingEditor } from '@core/components/Mapping/MappingEditor';
import { DataPreview } from '@core/components/Preview/DataPreview';
import { useTour } from './hooks/useTour';

function AppContent() {
  const {
    sourceColumns,
    targetColumns,
    mappings,
    sourceData,
    setSourceColumns,
    setTargetColumns,
    setMappings,
    setSourceData,
    resetAll,
  } = useMappingContext();

  const [activeStep, setActiveStep] = useState(0);

  // ツアー用に最新stateを参照するためのref
  const stateRef = useRef({ sourceColumns, targetColumns, mappings, sourceData });
  stateRef.current = { sourceColumns, targetColumns, mappings, sourceData };

  const tourActions = useMemo(
    () => ({
      setSourceColumns,
      setTargetColumns,
      setMappings,
      setSourceData,
      resetAll,
      setActiveStep,
      getSourceColumns: () => stateRef.current.sourceColumns,
      getTargetColumns: () => stateRef.current.targetColumns,
      getSourceData: () => stateRef.current.sourceData,
      getMappings: () => stateRef.current.mappings,
    }),
    [setSourceColumns, setTargetColumns, setMappings, setSourceData, resetAll]
  );

  const { startTour, shouldShowTour } = useTour(tourActions);

  useEffect(() => {
    if (shouldShowTour()) {
      const timer = setTimeout(() => startTour(), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, startTour]);

  const steps: WizardStep[] = useMemo(
    () => [
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
              <Box data-tour="source-columns">
                <SourceColumns />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box data-tour="target-columns">
                <TargetColumns />
              </Box>
            </Grid>
          </Grid>
        ),
      },
      {
        label: 'CSV取込 & マッピング',
        description: 'CSVを読み込み、変換ルール（マッピング）を設定します。',
        content: (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box data-tour="data-import">
              <DataImportSection />
            </Box>
            <Box data-tour="mapping-editor">
              <MappingEditor />
            </Box>
          </Box>
        ),
      },
      {
        label: 'プレビュー & 出力',
        description: '変換結果を確認し、CSVファイルとしてダウンロードします。',
        content: (
          <Box data-tour="preview">
            <DataPreview />
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header onStartTour={startTour} />
      <WizardLayout steps={steps} activeStep={activeStep} onStepChange={setActiveStep} />
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
