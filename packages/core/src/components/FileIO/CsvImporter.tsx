import { useRef } from 'react';
import { Button, ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { parseCSV } from '../../utils/csv';
import { useMappingContext } from '../../contexts/MappingContext';

interface CsvImporterProps {
  variant?: 'small' | 'large';
  mode?: 'columns' | 'data' | 'both';
  label?: string;
}

export function CsvImporter({ variant = 'small', mode = 'both', label }: CsvImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSourceColumns, setSourceData, encoding, setEncoding } = useMappingContext();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { columns, data } = await parseCSV(file, encoding);
      if (mode === 'columns' || mode === 'both') {
        setSourceColumns(columns);
      }
      if (mode === 'data' || mode === 'both') {
        setSourceData(data);
      }
    } catch (error) {
      console.error('CSV parse error:', error);
      alert('CSVファイルの読み込みに失敗しました。');
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getButtonLabel = () => {
    if (label) return label;
    switch (mode) {
      case 'columns':
        return 'カラムインポート';
      case 'data':
        return 'CSVインポート';
      default:
        return 'CSVインポート';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ToggleButtonGroup
        value={encoding}
        exclusive
        onChange={(_e, v) => { if (v) setEncoding(v); }}
        size="small"
      >
        <ToggleButton value="utf-8">UTF-8</ToggleButton>
        <ToggleButton value="sjis">SJIS</ToggleButton>
      </ToggleButtonGroup>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={handleClick}
        size={variant === 'large' ? 'large' : 'small'}
        sx={variant === 'large' ? { px: 4, py: 1.5 } : undefined}
      >
        {getButtonLabel()}
      </Button>
    </Box>
  );
}
