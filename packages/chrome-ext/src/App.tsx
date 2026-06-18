import { Container, Box, Grid } from '@mui/material';
import { MappingProvider } from '@core/contexts/MappingContext';
import { Header } from '@core/components/Layout/Header';
import { SourceColumns } from '@core/components/ColumnConfig/SourceColumns';
import { TargetColumns } from '@core/components/ColumnConfig/TargetColumns';
import { DataImportSection } from '@core/components/FileIO/DataImportSection';
import { MappingEditor } from '@core/components/Mapping/MappingEditor';
import { DataPreview } from '@core/components/Preview/DataPreview';

function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SourceColumns />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TargetColumns />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DataImportSection />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MappingEditor />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DataPreview />
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
