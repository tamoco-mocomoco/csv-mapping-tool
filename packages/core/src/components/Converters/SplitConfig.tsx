import { Box, TextField } from '@mui/material';
import type { ConverterConfig } from '../../types';

interface SplitConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function SplitConfig({ config, onChange }: SplitConfigProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        label="区切り文字"
        value={config.delimiter || ''}
        onChange={(e) => onChange({ ...config, delimiter: e.target.value })}
        sx={{ width: 100 }}
        placeholder="例: スペース"
        data-testid="split-delimiter-input"
      />
      <TextField
        size="small"
        label="インデックス"
        type="number"
        value={config.index ?? 0}
        onChange={(e) => onChange({ ...config, index: parseInt(e.target.value) || 0 })}
        sx={{ width: 100 }}
        inputProps={{ min: 0 }}
        data-testid="split-index-input"
      />
    </Box>
  );
}
