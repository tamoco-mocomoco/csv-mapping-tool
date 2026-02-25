import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { useMappingContext } from '../../contexts/MappingContext';
import { transformData } from '../../utils/transform';
import { applyDataFilter } from '../Preview/DataPreview';

export function CsvExporter() {
  const { sourceData, mappings, sourceColumns, targetColumns, dataFilter } = useMappingContext();

  const handleExport = () => {
    if (sourceData.length === 0) {
      alert('エクスポートするデータがありません。');
      return;
    }

    if (targetColumns.length === 0) {
      alert('変換後カラムが設定されていません。');
      return;
    }

    const transformedData = transformData(sourceData, mappings, sourceColumns, targetColumns);
    const { filteredTransformed } = applyDataFilter(sourceData, transformedData, dataFilter);
    const csvString = generateCSV(filteredTransformed, targetColumns);
    downloadCSV(csvString, 'converted.csv');
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      disabled={sourceData.length === 0 || targetColumns.length === 0}
    >
      CSVダウンロード
    </Button>
  );
}
