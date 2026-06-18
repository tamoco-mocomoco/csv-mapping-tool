import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { CsvImporter } from './CsvImporter';
import { useMappingContext } from '../../contexts/MappingContext';

export function DataImportSection() {
  const { sourceData, sourceColumns } = useMappingContext();

  const hasData = sourceData.length > 0;
  const hasColumns = sourceColumns.length > 0;

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">CSVデータ</Typography>
            {hasData && (
              <Chip
                label={`${sourceData.length}件`}
                size="small"
                color="primary"
              />
            )}
          </Box>

          {!hasColumns ? (
            <Typography color="text.secondary" variant="body2">
              先にカラム定義をインポートしてください
            </Typography>
          ) : (
            <>
              {!hasData && (
                <Typography color="text.secondary" variant="body2">
                  変換するCSVデータをインポート
                </Typography>
              )}
              <CsvImporter
                variant={hasData ? 'small' : 'large'}
                mode="data"
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
