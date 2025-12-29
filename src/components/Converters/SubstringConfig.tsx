import { Box, TextField, Typography } from '@mui/material';
import type { ConverterConfig } from '../../types';

interface SubstringConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function SubstringConfig({ config, onChange }: SubstringConfigProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        type="number"
        label="開始位置"
        value={config.substringStart ?? 0}
        onChange={(e) =>
          onChange({
            ...config,
            substringStart: parseInt(e.target.value) || 0,
          })
        }
        sx={{ width: 90 }}
        inputProps={{ min: 0 }}
      />
      <Typography variant="body2" color="text.secondary">
        〜
      </Typography>
      <TextField
        size="small"
        type="number"
        label="終了位置"
        value={config.substringEnd ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange({
            ...config,
            substringEnd: val === '' ? undefined : parseInt(val) || 0,
          });
        }}
        sx={{ width: 90 }}
        inputProps={{ min: 0 }}
        placeholder="末尾"
      />
    </Box>
  );
}
