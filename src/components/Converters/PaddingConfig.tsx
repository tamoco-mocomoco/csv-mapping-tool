import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import type { ConverterConfig, PadType } from '../../types';

interface PaddingConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function PaddingConfig({ config, onChange }: PaddingConfigProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel>位置</InputLabel>
        <Select
          value={config.padType || 'start'}
          label="位置"
          onChange={(e) =>
            onChange({ ...config, padType: e.target.value as PadType })
          }
        >
          <MenuItem value="start">先頭</MenuItem>
          <MenuItem value="end">末尾</MenuItem>
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="文字"
        value={config.padChar || '0'}
        onChange={(e) =>
          onChange({ ...config, padChar: e.target.value.slice(0, 1) || '0' })
        }
        sx={{ width: 60 }}
        inputProps={{ maxLength: 1 }}
      />
      <TextField
        size="small"
        type="number"
        label="桁数"
        value={config.padLength ?? 0}
        onChange={(e) =>
          onChange({ ...config, padLength: parseInt(e.target.value) || 0 })
        }
        sx={{ width: 80 }}
        inputProps={{ min: 0 }}
      />
    </Box>
  );
}
