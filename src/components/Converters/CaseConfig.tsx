import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { ConverterConfig, CaseType } from '../../types';

interface CaseConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function CaseConfig({ config, onChange }: CaseConfigProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>変換タイプ</InputLabel>
      <Select
        value={config.caseType || 'upper'}
        label="変換タイプ"
        onChange={(e) =>
          onChange({ ...config, caseType: e.target.value as CaseType })
        }
      >
        <MenuItem value="upper">大文字</MenuItem>
        <MenuItem value="lower">小文字</MenuItem>
        <MenuItem value="capitalize">先頭大文字</MenuItem>
      </Select>
    </FormControl>
  );
}
