import { Box, TextField } from '@mui/material';
import type { ConverterConfig } from '../../types';

interface ReplaceConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function ReplaceConfig({ config, onChange }: ReplaceConfigProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        label="検索文字列"
        value={config.searchValue || ''}
        onChange={(e) => onChange({ ...config, searchValue: e.target.value })}
        sx={{ width: 120 }}
      />
      <TextField
        size="small"
        label="置換後"
        value={config.replaceValue || ''}
        onChange={(e) => onChange({ ...config, replaceValue: e.target.value })}
        sx={{ width: 120 }}
      />
    </Box>
  );
}
