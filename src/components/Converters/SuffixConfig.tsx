import { TextField } from '@mui/material';
import type { ConverterConfig } from '../../types';

interface SuffixConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function SuffixConfig({ config, onChange }: SuffixConfigProps) {
  return (
    <TextField
      size="small"
      label="接尾辞"
      value={config.suffix || ''}
      onChange={(e) => onChange({ ...config, suffix: e.target.value })}
      placeholder="例: 様、円"
      sx={{ minWidth: 120 }}
      data-testid="suffix-value-input"
    />
  );
}
