import { TextField } from '@mui/material';
import type { ConverterConfig } from '../../types';

interface DateFormatConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function DateFormatConfig({ config, onChange }: DateFormatConfigProps) {
  return (
    <>
      <TextField
        size="small"
        label="入力フォーマット"
        value={config.dateInputFormat || ''}
        onChange={(e) => onChange({ ...config, dateInputFormat: e.target.value })}
        placeholder="YYYY年MM月DD日"
        sx={{ minWidth: 180 }}
        data-testid="date-input-format"
      />
      <TextField
        size="small"
        label="出力フォーマット"
        value={config.dateOutputFormat || ''}
        onChange={(e) => onChange({ ...config, dateOutputFormat: e.target.value })}
        placeholder="YYYY-MM-DDThh:mm:ssZ"
        sx={{ minWidth: 180 }}
        data-testid="date-output-format"
      />
    </>
  );
}
