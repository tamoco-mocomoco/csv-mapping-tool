import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { ConverterConfig, TrimType } from '../../types';

interface TrimConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function TrimConfig({ config, onChange }: TrimConfigProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>トリム位置</InputLabel>
      <Select
        value={config.trimType || 'both'}
        label="トリム位置"
        onChange={(e) =>
          onChange({ ...config, trimType: e.target.value as TrimType })
        }
      >
        <MenuItem value="both">両端</MenuItem>
        <MenuItem value="start">先頭のみ</MenuItem>
        <MenuItem value="end">末尾のみ</MenuItem>
      </Select>
    </FormControl>
  );
}
