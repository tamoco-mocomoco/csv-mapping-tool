import { Container, Box, Grid } from '@mui/material';
import { MappingProvider } from './contexts/MappingContext';
import { Header } from './components/Layout/Header';
import { SourceColumns } from './components/ColumnConfig/SourceColumns';
import { TargetColumns } from './components/ColumnConfig/TargetColumns';
import { DataImportSection } from './components/FileIO/DataImportSection';
import { MappingEditor } from './components/Mapping/MappingEditor';
import { DataPreview } from './components/Preview/DataPreview';

function App() {
  return (
    <MappingProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* カラム設定 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <SourceColumns />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TargetColumns />
            </Grid>

            {/* CSVデータインポート */}
            <Grid size={{ xs: 12 }}>
              <DataImportSection />
            </Grid>

            {/* マッピング設定 */}
            <Grid size={{ xs: 12 }}>
              <MappingEditor />
            </Grid>

            {/* プレビュー */}
            <Grid size={{ xs: 12 }}>
              <DataPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MappingProvider>
  );
}

export default App;
