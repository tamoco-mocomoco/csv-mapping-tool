import { useEffect, useMemo, useRef } from 'react';
import { Container, Box, Grid } from '@mui/material';
import { MappingProvider, useMappingContext } from './contexts/MappingContext';
import { Header } from './components/Layout/Header';
import { SourceColumns } from './components/ColumnConfig/SourceColumns';
import { TargetColumns } from './components/ColumnConfig/TargetColumns';
import { DataImportSection } from './components/FileIO/DataImportSection';
import { MappingEditor } from './components/Mapping/MappingEditor';
import { DataPreview } from './components/Preview/DataPreview';
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

  // 最新の状態を参照するためのref
  const stateRef = useRef({ sourceColumns, targetColumns, mappings, sourceData });
  stateRef.current = { sourceColumns, targetColumns, mappings, sourceData };

  const tourActions = useMemo(() => ({
    setSourceColumns,
    setTargetColumns,
    setMappings,
    setSourceData,
    resetAll,
    getSourceColumns: () => stateRef.current.sourceColumns,
    getTargetColumns: () => stateRef.current.targetColumns,
    getSourceData: () => stateRef.current.sourceData,
    getMappings: () => stateRef.current.mappings,
  }), [setSourceColumns, setTargetColumns, setMappings, setSourceData, resetAll]);

  const { startTour, shouldShowTour } = useTour(tourActions);

  useEffect(() => {
    // 初回訪問時にツアーを自動開始
    if (shouldShowTour()) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, startTour]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header onStartTour={startTour} />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* カラム設定 */}
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

          {/* CSVデータインポート */}
          <Grid size={{ xs: 12 }}>
            <Box data-tour="data-import">
              <DataImportSection />
            </Box>
          </Grid>

          {/* マッピング設定 */}
          <Grid size={{ xs: 12 }}>
            <Box data-tour="mapping-editor">
              <MappingEditor />
            </Box>
          </Grid>

          {/* プレビュー */}
          <Grid size={{ xs: 12 }}>
            <Box data-tour="preview">
              <DataPreview />
            </Box>
          </Grid>
        </Grid>
      </Container>
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
